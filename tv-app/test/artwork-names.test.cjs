const test = require('node:test');
const assert = require('node:assert/strict');
const { DOMParser } = require('@xmldom/xmldom');
const C = require('../app/core.js');
const F = require('../app/family.js');
const base = 'http://192.0.2.1:5001/control';
function item(filename, reported, date = '', rejected = []) {
  const slug = filename.replace(/[^a-z0-9.]/gi, '-');
  const didl = '<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp"><item id="1" parentID="2"><dc:title>' + C.escapeXml(reported) + '</dc:title><dc:date>' + date + '</dc:date><upnp:longDescription>Reported plot</upnp:longDescription><upnp:albumArtURI>/poster.jpg</upnp:albumArtURI><res protocolInfo="http-get:*:video/mp4:*">/media/' + slug + '</res></item></DIDL-Lite>';
  const xml = '<Envelope><Result>' + C.escapeXml(didl) + '</Result><NumberReturned>1</NumberReturned><TotalMatches>1</TotalMatches></Envelope>';
  return C.parseResult(xml, base, DOMParser, { [C.resourceKey(slug)]: filename }, rejected).items[0];
}
test('missing reported year is unknown, not contradictory artwork identity', () => {
  const parsed = item('(film) (2002) Example Film (PAL DVD Remux).mp4', 'Example Film (PAL DVD Remux)', '2026-10-23');
  assert.equal(parsed.artwork, 'http://192.0.2.1:5001/poster.jpg');
  assert.equal(parsed.description, 'Reported plot');
  assert.equal(C.mediaName(parsed.title).year, '2002', 'file date must not replace the filename year');
  assert.equal(item('(film) Example Film.mp4', 'Example Film (2002)').artwork, parsed.artwork);
});
test('matching title/year keeps artwork but genuine remake, sequel and edition conflicts stay blocked', () => {
  const file = '(film) (2002) Example Film - Extended Cut.mp4';
  assert.ok(item(file, 'Example Film - Extended Cut (2002)').artwork);
  for (const wrong of ['Unrelated Film (2002)', 'Example Film - Extended Cut (2020)', 'Example Film 2 - Extended Cut', 'Example Film - Theatrical Cut', '']) {
    const parsed = item(file, wrong);
    assert.equal(parsed.artwork, '', wrong); assert.equal(parsed.description, '', wrong);
    assert.equal(parsed.title, file, 'a reported title never renames the media');
  }
});
test('episode artwork can survive a missing server year without accepting another episode', () => {
  const filename = '(tv show) (2010) Example - S01E02 - A Friend.mp4';
  assert.ok(item(filename, 'Example S01E02 - A Friend').artwork);
  assert.equal(item(filename, 'Example S01E03 - A Friend').artwork, '');
});
test('reviewed stale-poster rejection overrides matching reported metadata without hiding the video', () => {
  const name = '(film) (2002) Example Film.mp4', key = C.resourceKey(name);
  assert.ok(item(name, 'Example Film').artwork);
  const rejected = item(name, 'Example Film', '', [key]);
  assert.equal(rejected.artwork, ''); assert.equal(rejected.description, '');
  assert.ok(rejected.url); assert.equal(rejected.title, name);
  assert.ok(item(name, 'Example Film', '', ['anotherfile']).artwork);
});
test('private artwork rejections cannot follow the client to an unrelated server', async () => {
  const device = '<root><device><friendlyName>Test</friendlyName><service><serviceType>' + C.SERVICE + '</serviceType><controlURL>/control</controlURL></service></device></root>';
  const name = '(film) (2002) Example Film.mp4', didl = '<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp"><item id="1"><dc:title>Example Film</dc:title><upnp:albumArtURI>/poster.jpg</upnp:albumArtURI><res protocolInfo="http-get:*:video/mp4:*">/-film-2002-Example-Film.mp4</res></item></DIDL-Lite>';
  const soap = '<Envelope><Result>' + C.escapeXml(didl) + '</Result><NumberReturned>1</NumberReturned><TotalMatches>1</TotalMatches></Envelope>';
  const client = C.client(async (url, options) => options.method ? soap : device, DOMParser);
  client.setNames({}, 'http://192.0.2.1:5001/desc', [C.resourceKey(name)]);
  await client.connect('http://192.0.2.2:5001/desc');
  assert.ok((await client.browse('0'))[0].artwork);
  await client.connect('http://192.0.2.1:5001/desc');
  assert.equal((await client.browse('0'))[0].artwork, '');
});
test('collection labels prettify filesystem slugs without damaging supplied human titles', () => {
  for (const [raw, label] of [['the-jungle-book', 'The Jungle Book'], ['ben-10', 'Ben 10'], ['mr-bean', 'Mr Bean'], ['charlie-and-the-chocolate-factory', 'Charlie and the Chocolate Factory'], ['paw-patrol', 'PAW Patrol'], ['spiderman', 'Spider-Man'], ['ironman', 'Iron Man'], ['garfield', 'Garfield'], ['Spider-Man', 'Spider-Man'], ['WALL-E', 'WALL-E'], ['NASA: The Mission', 'NASA: The Mission']]) {
    assert.equal(C.collectionTitle(raw), label);
  }
});
test('pretty collection names preserve queue IDs, all child titles and validated artwork selection', async () => {
  const clip = { id: 'clip', parentId: 'extras', title: '(extra content) (2002) Example Film - Clip', artwork: '/safe.jpg' };
  const folders = { kids: [{ id: 'family', title: 'the-jungle-book', folder: true }], family: [{ id: 'extras', title: 'extras', folder: true }], extras: [clip] };
  const entries = await F.catalogue(async id => folders[id], { id: 'kids', title: 'kids' });
  assert.equal(entries.length, 1); assert.equal(entries[0].title, 'The Jungle Book');
  assert.equal(entries[0].id, 'collection:extra content|the-jungle-book', 'existing rotation key survives display-only cleanup');
  assert.equal(entries[0].artwork, '/safe.jpg'); assert.deepEqual(entries[0].items, [clip]);
  assert.equal(F.label(entries[0]), 'The Jungle Book - 2002 - Bonus content');
});
