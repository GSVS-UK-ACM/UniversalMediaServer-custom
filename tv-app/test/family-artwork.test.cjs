const test = require('node:test');
const assert = require('node:assert/strict');
const { DOMParser } = require('@xmldom/xmldom');
const C = require('../app/core.js');
const F = require('../app/family.js');
const base = 'http://192.0.2.1:5001/control';
function soap(items) { return '<Envelope><Result>' + C.escapeXml('<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp">' + items + '</DIDL-Lite>') + '</Result><NumberReturned>1</NumberReturned><TotalMatches>1</TotalMatches></Envelope>'; }
function picture(title = 'family-cover', url = '/media/PNG_LRG_family-cover.png') { return '<item id="cover" parentID="family"><dc:title>' + title + '</dc:title><upnp:class>object.item.imageItem.photo</upnp:class><upnp:albumArtURI>/wrong.jpg</upnp:albumArtURI><res protocolInfo="http-get:*:image/png:*">' + url + '</res><res protocolInfo="http-get:*:image/jpeg:DLNA.ORG_PN=JPEG_MED">/media/JPEG_MED_family-cover.png</res></item>'; }
const cover = url => ({ id: url, artworkOnly: true, artwork: base + '/' + url });
const folder = id => ({ id, title: id, folder: true });
const film = id => ({ id, title: '(film) (2000) ' + id, url: '/' + id + '.mp4', artwork: '/scraped.jpg', parentId: 'films' });
function tree() { return { kids: [folder('family'), folder('sibling')], family: [cover('master.jpg'), folder('films'), folder('tv'), folder('extras'), folder('live')], films: [film('film')], tv: [{ ...film('ep'), title: '(tv show) Example - S01E01 - One' }], extras: [{ ...film('extra'), title: '(extra content) Family - One' }], live: [cover('nested.jpg'), film('livefilm')], sibling: [film('siblingfilm')] }; }
async function catalogue(map, options) { return F.catalogue(async id => map[id], folder('kids'), options); }
function flatten(items) { return items.flatMap(item => item.items || [item]); }

test('only explicit sidecar images enter the parser, never as playable videos', () => {
  const item = C.parseResult(soap(picture()), base, DOMParser).items[0];
  assert.equal(item.artworkOnly, true); assert.equal(item.url, '');
  assert.equal(item.artwork, 'http://192.0.2.1:5001/media/JPEG_MED_family-cover.png');
  assert.deepEqual(C.parseResult(soap(picture('holiday')), base, DOMParser).items, []);
  const unsafe = picture().replaceAll('/media/PNG_LRG_family-cover.png', 'https://elsewhere.invalid/family-cover.png').replaceAll('/media/JPEG_MED_family-cover.png', 'javascript:alert(1)');
  assert.deepEqual(C.parseResult(soap(unsafe), base, DOMParser).items, []);
  assert.deepEqual(C.parseResult(soap(picture().replaceAll('/media/', '/ums/thumbnail/')), base, DOMParser).items, []);
});

test('master image reaches films, series, extras and child queue items without changing identity', async () => {
  const map = tree(), before = structuredClone(map), entries = await catalogue(map);
  const files = flatten(entries);
  for (const id of ['film', 'ep', 'extra']) assert.equal(files.find(item => item.id === id).artwork, base + '/master.jpg');
  assert.equal(entries.find(item => item.kind === 'tv show').artwork, base + '/master.jpg');
  assert.equal(entries.find(item => item.kind === 'extra content').artwork, base + '/master.jpg');
  assert.equal(files.some(item => item.artworkOnly), false);
  assert.deepEqual(map, before, 'cached browse results are not mutated');
  assert.equal(files.find(item => item.id === 'siblingfilm').artwork, '/scraped.jpg', 'inheritance cannot cross sibling roots');
  for (const item of files) assert.equal(C.progressKey('server', item), C.progressKey('server', flatten(await catalogue({ ...map, family: map.family.filter(x => !x.artworkOnly), live: map.live.filter(x => !x.artworkOnly) })).find(x => x.id === item.id)));
});

test('nearest override wins, parent replacements preserve it and removal restores inheritance', async () => {
  const map = tree();
  assert.equal(flatten(await catalogue(map)).find(x => x.id === 'livefilm').artwork, base + '/nested.jpg');
  map.family[0] = cover('replacement.jpg');
  let entries = await catalogue(map);
  assert.equal(flatten(entries).find(x => x.id === 'film').artwork, base + '/replacement.jpg');
  assert.equal(flatten(entries).find(x => x.id === 'livefilm').artwork, base + '/nested.jpg');
  map.live.shift(); entries = await catalogue(map);
  assert.equal(flatten(entries).find(x => x.id === 'livefilm').artwork, base + '/replacement.jpg');
});

test('corrupt or duplicate explicit choices fail closed with diagnostics, not scraped art', async () => {
  const map = tree(), rows = [];
  let entries = await catalogue(map, { validateArtwork: async url => !url.endsWith('/nested.jpg'), folderArtwork: row => rows.push(row) });
  assert.equal(flatten(entries).find(x => x.id === 'livefilm').artwork, '');
  assert.match(rows.find(x => x.id === 'live').issue, /could not be loaded/);
  map.live.unshift(cover('duplicate.jpg'));
  entries = await catalogue(map);
  assert.equal(flatten(entries).find(x => x.id === 'livefilm').artwork, '');
  assert.match(flatten(entries).find(x => x.id === 'livefilm').artworkIssue, /Multiple/);
});

test('cancellation during image validation never publishes a partial catalogue', async () => {
  let current = true;
  await assert.rejects(catalogue(tree(), { validateArtwork: async () => { current = false; return true; }, isCurrent: () => current }), /cancelled/);
});

test('refresh busts image cache without altering queue, wall or progress keys', async () => {
  const first = await catalogue(tree(), { artworkRevision: 'first' }), second = await catalogue(tree(), { artworkRevision: 'second' });
  assert.deepEqual(first.map(x => x.id), second.map(x => x.id));
  assert.match(first.find(x => x.id === 'film').artwork, /familyRefresh=first/); assert.match(second.find(x => x.id === 'film').artwork, /familyRefresh=second/);
  const wall = F.wall(first, 5, 3, true); wall.move('right'); const selected = wall.selected().id;
  const updated = F.wall(second, 5, 3, true); updated.select(selected); assert.equal(updated.selected().id, selected);
});
