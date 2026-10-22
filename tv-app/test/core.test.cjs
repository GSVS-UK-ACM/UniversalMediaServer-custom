const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DOMParser } = require('@xmldom/xmldom');
const C = require('../app/core.js');
const base = 'http://192.0.2.1:5001/dev/test/desc';
const device = '<root><device><friendlyName>Kids TV</friendlyName><serviceList><service><serviceType>' + C.SERVICE + '</serviceType><controlURL>/control</controlURL></service></serviceList></device></root>';
function response(didl, returned = 1, total = 1) { return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><Result>' + C.escapeXml(didl) + '</Result><NumberReturned>' + returned + '</NumberReturned><TotalMatches>' + total + '</TotalMatches></s:Body></s:Envelope>'; }
const movie = '<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp"><item id="42" parentID="8"><dc:title>Film &amp; friends</dc:title><upnp:class>object.item.videoItem.movie</upnp:class><res protocolInfo="http-get:*:image/jpeg:DLNA.ORG_PN=JPEG_TN">/thumb.jpg</res><res protocolInfo="http-get:*:video/mp4:*" duration="1:20:00">/movie.mp4</res><upnp:albumArtURI>/cover.jpg</upnp:albumArtURI></item></DIDL-Lite>';

test('description resolves only same-server ContentDirectory endpoints', () => {
  assert.equal(C.description(device, base, DOMParser).control, 'http://192.0.2.1:5001/control');
  assert.throws(() => C.description(device.replace('/control', 'https://elsewhere.invalid/control'), base, DOMParser));
  assert.throws(() => C.description('<root/>', base, DOMParser));
});
test('video URL is not confused with thumbnail resource; escaped titles survive', () => {
  const result = C.parseResult(response(movie), base, DOMParser);
  assert.equal(result.items[0].url, 'http://192.0.2.1:5001/movie.mp4');
  assert.equal(result.items[0].title, 'Film & friends');
  assert.equal(result.items[0].artwork, 'http://192.0.2.1:5001/cover.jpg');
});
test('folders keep artwork and IDs while internal transcoding actions are hidden', () => {
  const xml = '<DIDL-Lite xmlns:dc="urn:dc"><container id="5"><dc:title>Collection</dc:title><res protocolInfo="http-get:*:image/jpeg:*">/folder.jpg</res></container><container id="6"><dc:title>#--TRANSCODE--#</dc:title></container></DIDL-Lite>';
  const result = C.parseResult(response(xml, 2, 2), base, DOMParser);
  assert.equal(result.items.length, 1); assert.equal(result.items[0].folder, true); assert.ok(result.items[0].artwork.endsWith('/folder.jpg'));
});
test('untrusted artwork and media URLs cannot leave the configured server', () => {
  const xml = movie.replace('/movie.mp4', 'javascript:alert(1)').replace('/cover.jpg', 'https://tracker.invalid/x');
  assert.equal(C.parseResult(response(xml), base, DOMParser).items.length, 0);
  assert.throws(() => C.httpUrl('http://user:secret@server/'));
  assert.throws(() => C.httpUrl('file:///etc/passwd'));
});
test('DTD/entity declarations and SOAP errors fail explicitly', () => {
  assert.throws(() => C.parseXml('<!DOCTYPE x [<!ENTITY e "boom">]><x>&e;</x>', DOMParser));
  assert.throws(() => C.parseResult('<Envelope><Fault><errorDescription>No access</errorDescription></Fault></Envelope>', base, DOMParser), /No access/);
});
test('SOAP and search values are escaped independently', () => {
  const criteria = C.searchCriteria('A "quote" & <tag>');
  assert.ok(criteria.includes('\\"quote\\"'));
  const xml = C.envelope('Search', { SearchCriteria: criteria });
  const parsed = C.parseXml(xml, DOMParser);
  assert.equal(parsed.getElementsByTagName('SearchCriteria')[0].textContent, criteria);
});
test('browse paginates by raw NumberReturned, not visible filtered items', async () => {
  const offsets = [];
  const client = C.client(async (url, options) => {
    if (!options.method) return device;
    offsets.push(Number(options.body.match(/<StartingIndex>(\d+)/)[1]));
    return offsets.length === 1 ? response('<DIDL-Lite/>', 200, 201) : response(movie, 1, 201);
  }, DOMParser);
  await client.connect(base);
  assert.equal((await client.browse('0')).length, 1); assert.deepEqual(offsets, [0, 200]);
});
test('search calls the subtree action without crawling folders', async () => {
  let action;
  const client = C.client(async (url, options) => { if (!options.method) return device; action = options.body; return response(movie); }, DOMParser);
  await client.connect(base); await client.search('8', 'Film');
  assert.ok(action.includes('<u:Search ')); assert.ok(action.includes('<ContainerID>8</ContainerID>'));
});
test('progress is finite, watched starts at 95%, and renderer URL is not its identity', () => {
  assert.equal(C.progress(94, 100).watched, false); assert.equal(C.progress(95, 100).watched, true);
  assert.equal(C.progress(-10, 0).position, 0);
  assert.equal(C.progress(Infinity, NaN).position, 0);
  assert.equal(C.progressKey(base, { parentId: '8', title: 'Movie', url: '/renderer-1' }), C.progressKey(base, { parentId: '8', title: 'Movie', url: '/renderer-2' }));
});
test('packaged TV policy permits its local connection settings and targets Tizen 5.5', () => {
  const doc = C.parseXml(fs.readFileSync(path.resolve(__dirname, '../app/config.xml'), 'utf8'), DOMParser);
  const policy = doc.getElementsByTagNameNS('*', 'content-security-policy')[0].textContent;
  assert.match(policy, /connect-src 'self' http: https:/);
  assert.equal(doc.getElementsByTagNameNS('*', 'application')[0].getAttribute('required_version'), '5.5');
});

test('explicit resource filename beats a conflicting online movie lookup and suppresses its wrong art/plot', () => {
  const xml = movie.replace('Film &amp; friends', 'Unrelated online film (2010)').replace('/movie.mp4', '/get/42/-film-1968-Example-Family-Film-720p-BluRay-.mp4');
  const result = C.parseResult(response(xml), base, DOMParser).items[0], info = C.mediaName(result.title);
  assert.equal(info.title, 'Example Family Film'); assert.equal(info.kind, 'film'); assert.equal(info.year, '1968');
  assert.equal(result.artwork, ''); assert.equal(result.description, ''); assert.equal(result.series, '');
});

test('private exact-name index restores separators and punctuation from sanitised resource slugs', () => {
  const name = '(tv show) Example - S02E03 - A Friend\'s Day (480p DVD Rip).mp4';
  const url = 'http://192.0.2.1/get/1/-tv-show-Example-S02E03-A-Friend-s-Day-480p-DVD-Rip-.mp4_transcoded_to.ts';
  const names = { [C.resourceKey(C.resourceFilename(url))]: name };
  assert.equal(C.storageName(url, names), name); assert.equal(C.mediaName(C.storageName(url)).kind, 'tv show');
  assert.equal(C.storageName('http://192.0.2.1/get/movie.mp4'), '');
});

test('file modification date is not treated as a film release year', () => {
  const xml = movie.replace('<dc:title>', '<dc:date>2026-10-22</dc:date><dc:title>');
  assert.equal(C.parseResult(response(xml), base, DOMParser).items[0].year, undefined);
});

test('a private exact-name overlay cannot relabel a different manually selected server', async () => {
  const url = '/get/42/-film-1968-Example-720p-.mp4';
  const names = { [C.resourceKey(url.split('/').pop())]: '(film) (1968) Private Overlay Title (720p).mp4' };
  const client = C.client(async (u, options) => options.method ? response(movie.replace('/movie.mp4', url)) : device, DOMParser);
  client.setNames(names, base); await client.connect('http://192.0.2.2:5001/dev/test/desc');
  assert.equal(C.cleanTitle((await client.browse('0'))[0].title), 'Example');
});
