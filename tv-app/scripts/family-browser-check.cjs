const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const C = require('../app/core.js');
const root = path.resolve(__dirname, '../dist'), fixtureBase = 'http://192.0.2.1:5001';
const live = !!process.env.TV_DESCRIPTION_URL, descriptionUrl = process.env.TV_DESCRIPTION_URL || fixtureBase + '/dev/test/desc';
const scenario = process.env.TV_STARTUP_SCENARIO || 'online', router = 'http://192.168.50.1:49000';
const recoveryNonce = process.env.TV_CODE_RECOVERY === '1' ? 'e'.repeat(32) : '';
let server, browser, page, descriptionCalls = 0, rootCalls = 0, wakeCalls = 0;
function container(id, title) { return '<container id="' + id + '"><dc:title>' + C.escapeXml(title) + '</dc:title><upnp:albumArtURI>/art.png</upnp:albumArtURI></container>'; }
function film(id, title, parent = 'films') { return '<item id="' + id + '" parentID="' + parent + '"><dc:title>' + C.escapeXml(title) + '</dc:title><upnp:albumArtURI>/art.png</upnp:albumArtURI><res protocolInfo="http-get:*:video/mp4:*">/movie-' + id + '.mp4</res></item>'; }
const fixtures = {
  0: [container('share', 'Shared library')],
  share: [container('kids', 'kids'), container('adult', 'adults')],
  kids: [container('films', 'Films'), container('series', 'Series'), container('extras', 'Extras'), container('namedfamily', 'the-test-film'), container('excluded', 'DVD-Reviewed')],
  films: Array.from({ length: 42 }, (_, i) => {
    const item = film('film' + i, '(film) (2002) Film ' + String(i).padStart(2, '0') + ' (1080p BluRay)');
    return i % 2 ? item.replace('<upnp:albumArtURI>/art.png</upnp:albumArtURI>', '') : item;
  }),
  series: Array.from({ length: 6 }, (_, i) => film('episode' + (i + 1), '(tv show) Example - S01E0' + (i + 1) + ' - Episode ' + (i + 1), 'series')),
  extras: Array.from({ length: 3 }, (_, i) => film('bonus' + i, '(extra content) Parent Film - Clip ' + i, 'extras')),
  namedfamily: [container('namedextras', 'extras')],
  namedextras: [film('namedclip', 'The Test Film Clip 1', 'namedextras').replace('/movie-namedclip.mp4', '/media/-extra-content-2002-The-Test-Film-Clip-1.mp4')],
  adult: [container('adultcollection', 'Adult collection')],
  adultcollection: [film('adultfilm', '(film) (2000) Adult test film', 'adultcollection')]
};
function result(items) { return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><Result>' + C.escapeXml('<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp">' + items.join('') + '</DIDL-Lite>') + '</Result><NumberReturned>' + items.length + '</NumberReturned><TotalMatches>' + items.length + '</TotalMatches></s:Body></s:Envelope>'; }
async function selectCaption(page, text) {
  for (let i = 0; i < 50; i++) {
    if ((await page.locator('#wall-caption').innerText()).includes(text)) return;
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(180);
  }
  throw new Error('Tile was not found: ' + text);
}
async function digits(page, value) { for (const digit of value) await page.keyboard.press(digit); }
async function ended(page) { await page.evaluate(() => window.webapis.avplay.listener.onstreamcompleted()); }
async function title(page, pattern) { await page.waitForFunction(p => new RegExp(p).test(document.getElementById('playing-title').textContent), pattern); }
(async () => {
  server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : file.endsWith('.json') ? 'application/json' : 'text/html');
    fs.createReadStream(file).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.TV_CHROMIUM_PATH || undefined });
  page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); const errors = [], browseIds = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ url, mock, recoveryNonce }) => {
    localStorage.setItem('kids-tv-server', url);
    if (mock) localStorage.setItem('kids-tv-home:' + url, JSON.stringify({ id: 'adult', title: 'Old adult Home' }));
    if (mock && localStorage.getItem('kids-tv-progress') === null) {
      const progress = {}; progress[url + '|legacyfilms|Old film title'] = { position: 120, duration: 600, watched: false, updated: Date.now(), server: url, item: { parentId: 'legacyfilms', title: 'Old film title' } };
      localStorage.setItem('kids-tv-progress', JSON.stringify(progress));
    }
    if (mock && recoveryNonce && !localStorage.getItem('kids-tv-parent-recovery:' + recoveryNonce) && localStorage.getItem('kids-tv-parent-code') === null) localStorage.setItem('kids-tv-parent-code', '{broken record');
    if (mock) window.webapis = { avplay: {
      open() {}, close() {}, stop() {}, pause() {}, play() {}, setDisplayRect() {}, setDisplayMethod() {}, setListener(listener) { this.listener = listener; },
      prepareAsync(ok) { setTimeout(ok, 10); }, getDuration() { return 600000; }, seekTo(ms, ok) { ok(); }
    } };
  }, { url: descriptionUrl, mock: !live, recoveryNonce });
  if (!live) {
    await page.route('**/connection.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ descriptionUrl, parentalRecoveryNonce: recoveryNonce, libraryPaths: { kids: ['Shared library', 'kids'], adults: ['Shared library', 'adults'] }, titleAliases: [{ oldParentId: 'legacyfilms', oldTitle: 'Old film title', newTitle: '(film) (2002) Film 00 (1080p BluRay)' }], wake: { descriptionUrl: router + '/tr64desc.xml', macAddress: '02:00:00:00:00:01' } }) }));
    await page.route(router + '/**', route => {
      const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type,soapaction' };
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
      if (route.request().method() === 'POST') wakeCalls++;
      return route.fulfill({ headers, contentType: 'text/xml', body: route.request().method() === 'GET' ? '<root><service><serviceType>urn:dslforum-org:service:Hosts:1</serviceType><controlURL>/upnp/control/hosts</controlURL></service></root>' : '<Envelope><X_AVM-DE_WakeOnLANByMACAddressResponse/></Envelope>' });
    });
  }
  // This bridge is test-only. No CORS or profile change on the real server.
  await page.route(new URL(descriptionUrl).origin + '/**', async route => {
    const req = route.request(), headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type,soapaction' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
    if (live) { const response = await route.fetch(); return route.fulfill({ response, headers: { ...response.headers(), ...headers } }); }
    if (req.url().endsWith('/art.png')) return route.fulfill({ body: fs.readFileSync(path.join(root, 'icon.png')), contentType: 'image/png', headers });
    if (req.method() === 'GET') {
      descriptionCalls++;
      if (scenario === 'offline' && descriptionCalls < 3) return route.abort('connectionrefused');
      return route.fulfill({ headers, contentType: 'text/xml', body: '<root><device><friendlyName>Family test</friendlyName><service><serviceType>' + C.SERVICE + '</serviceType><controlURL>/control</controlURL></service></device></root>' });
    }
    const id = (req.postData().match(/<ObjectID>(.*?)<\/ObjectID>/) || [])[1] || 'search'; browseIds.push(id);
    if (id === '0') rootCalls++;
    const items = scenario === 'empty' && id === '0' && rootCalls < 3 ? [] : id === 'search' ? fixtures.adultcollection : fixtures[id] || [];
    return route.fulfill({ headers, contentType: 'text/xml', body: result(items) });
  });
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.locator('#wall-focus[data-selected]').waitFor({ timeout: 60000 });
  assert.equal(await page.locator('nav').isVisible(), false);
  assert.equal(await page.locator('#setup').isVisible(), false);
  assert.equal(await page.locator('#search').isVisible(), false);
  if (!live) {
    assert.equal(wakeCalls, scenario === 'offline' ? 1 : 0);
    if (recoveryNonce) {
      assert.equal(await page.evaluate(() => localStorage.getItem('kids-tv-parent-code')), null, 'owner recovery removes even a corrupt credential, not progress');
      assert.equal(await page.evaluate(nonce => localStorage.getItem('kids-tv-parent-recovery:' + nonce), recoveryNonce), 'consumed');
    }
    assert.deepEqual(await page.evaluate(() => {
      const focus = document.getElementById('wall-focus').getBoundingClientRect(), viewport = document.getElementById('wall-viewport').getBoundingClientRect();
      return [Math.round(viewport.width / focus.width), Math.round(viewport.height / focus.height)];
    }), [5, 3], 'fresh TV default is 5x3');
    await selectCaption(page, 'Film 00 -');
    assert.match(await page.locator('.wall-selected .wall-tile-title').innerText(), /Film 00/);
    assert.equal(await page.locator('.wall-selected .wall-tile-meta').innerText(), '2002 - Film', 'tile metadata remains visible when artwork loads');
    await selectCaption(page, 'Film 01 -');
    assert.equal(await page.locator('.wall-selected .wall-tile-meta').innerText(), '2002 - Film', 'missing artwork does not hide metadata');
    assert.equal(browseIds.includes('adult'), false, 'kids catalogue must not crawl adult siblings');
    assert.equal(browseIds.includes('excluded'), false, 'initial review copy must be ignored');
    await selectCaption(page, 'The Test Film -');
    assert.equal(await page.locator('.wall-selected .wall-tile-title').innerText(), 'The Test Film', 'slug becomes a display label, not a media rename');
    assert.equal(await page.locator('#wall-focus').getAttribute('data-selected'), 'collection:extra content|the-test-film', 'display cleanup preserves the existing queue key');
    await page.waitForFunction(() => { const img = document.querySelector('.wall-selected .wall-art img'); return img && img.complete && img.naturalWidth > 0; });
    assert.equal(await page.locator('.wall-selected .wall-tile-meta').innerText(), '2002 - Bonus content', 'a missing UMS year no longer hides matched artwork');
    assert.equal(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('kids-tv-progress'))).find(r => r.item.title.includes('Film 00')).position), 120, 'unambiguous rename alias retains existing resume state');
    const selected = await page.locator('#wall-focus').getAttribute('data-selected'), before = await page.locator('#wall-focus').boundingBox();
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
    assert.notEqual(await page.locator('#wall-focus').getAttribute('data-selected'), selected);
    const after = await page.locator('#wall-focus').boundingBox(); assert.deepEqual(before, after, 'selection frame is stationary');
    await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200);
    assert.equal(await page.locator('#wall-focus').getAttribute('data-selected'), selected);
    await page.locator('#tile-details').waitFor({ state: 'visible' });
    await page.keyboard.down('ArrowRight');
    for (let repeat = 0; repeat < 4; repeat++) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(80); }
    await page.keyboard.up('ArrowRight');
    await page.locator('#tile-details').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#detail-meta').innerText(), await page.locator('#wall-caption').innerText(), 'dwell belongs to the final settled tile');
    await selectCaption(page, 'Film 00 -');
    await page.keyboard.press('Enter'); await page.locator('#playback:not(.hidden)').waitFor();
    await page.keyboard.press('Escape'); await page.locator('#playback').waitFor({ state: 'hidden' });
    assert.match(await page.locator('#wall-caption').innerText(), /Film 00/);
    await selectCaption(page, 'Example -');
    const collectionTile = await page.locator('#wall-focus').getAttribute('data-selected');
    await page.keyboard.press('Enter'); await title(page, 'S01E01');
    for (let episode = 2; episode <= 6; episode++) { await ended(page); await title(page, 'S01E0' + episode); }
    await ended(page); await page.locator('#playback').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#wall-focus').getAttribute('data-selected'), collectionTile);
    await page.keyboard.press('Enter'); await title(page, 'S01E02');
    for (const episode of [3, 4, 5, 6, 1]) { await ended(page); await title(page, 'S01E0' + episode); }
    await ended(page); await page.locator('#playback').waitFor({ state: 'hidden' });
    await page.keyboard.press('Enter'); await title(page, 'S01E03'); await page.keyboard.press('Escape');
    await page.locator('#playback').waitFor({ state: 'hidden' });
    await digits(page, '12345'); await page.locator('#pin-panel').waitFor({ state: 'visible' });
    await page.locator('#new-code').fill('907314'); await page.locator('#confirm-code').fill('907315'); await page.locator('#save-code').click();
    await page.getByText('The two codes do not match.', { exact: true }).waitFor(); assert.equal(await page.locator('nav').isVisible(), false);
    await page.locator('#confirm-code').fill('907314');
    await page.evaluate(() => { window.savedStorageSet = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (key === 'kids-tv-parent-code') throw new Error('Synthetic storage-full'); return window.savedStorageSet.call(this, key, value); }; });
    await page.locator('#save-code').click(); await page.getByText('Synthetic storage-full', { exact: true }).waitFor();
    assert.equal(await page.locator('nav').isVisible(), false, 'storage failure must not grant parent access');
    await page.evaluate(() => { Storage.prototype.setItem = window.savedStorageSet; });
    await page.locator('#save-code').click();
    await page.getByRole('heading', { name: 'Adults', exact: true }).waitFor();
    assert.equal(await page.locator('#search').isVisible(), true);
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('kids-tv-parent-code')));
    assert.equal(record.length, 6); assert.equal(JSON.stringify(record).includes('907314'), false);
    await page.locator('.tile').filter({ hasText: 'Adult collection' }).click(); await page.getByRole('heading', { name: 'Adult collection', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Use this collection as Home' }).click();
    await page.locator('#settings').click(); await page.locator('#reset-home').click();
    await page.getByRole('heading', { name: 'Adults', exact: true }).waitFor();
    assert.equal(await page.evaluate(url => localStorage.getItem('kids-tv-parent-home:' + url), descriptionUrl), null);
    await page.locator('#search').click(); await page.locator('#query').fill('adventure'); await page.locator('#do-search').click();
    await page.getByRole('heading', { name: 'Found in your library' }).waitFor();
    await page.locator('#settings').click();
    const libraryScroll = await page.locator('#content').evaluate(el => el.scrollTop);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'density-columns');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
    assert.match(await page.locator('#density-columns').innerText(), /5/);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'density-rows');
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft');
    assert.match(await page.locator('#density-rows').innerText(), /3/);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'save-density', 'remote reaches Save without keyboard tricks');
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('kids-tv-density'))), { columns: 5, rows: 3 });
    assert.equal(await page.locator('#content').evaluate(el => el.scrollTop), libraryScroll, 'modal arrows do not scroll the underlying library');
    assert.equal(await page.locator('#shell').evaluate(el => getComputedStyle(el).visibility), 'hidden', 'underlying native scrollbars are not painted through settings');
    assert.deepEqual(await page.evaluate(() => [window.scrollX, window.scrollY]), [0, 0], 'modal navigation cannot scroll the page');
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'parent-close');
    await page.keyboard.press('Escape'); await page.locator('#parent-panel').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement.id), 'settings');
    await page.locator('#settings').click();
    await page.locator('#change-code').click(); await page.locator('#old-code').fill('907314');
    await page.locator('#new-code').fill('86539012'); await page.locator('#confirm-code').fill('86539012'); await page.locator('#save-code').click();
    await page.locator('#parent-panel').waitFor({ state: 'visible' }); await page.locator('#back-to-kids').click();
    await page.locator('#wall-focus[data-selected]').waitFor();
    assert.equal(await page.locator('nav').isVisible(), false);
    await page.reload(); await page.locator('#wall-focus[data-selected]').waitFor();
    assert.equal(await page.locator('nav').isVisible(), false, 'relaunch always starts in kids');
    await digits(page, '12345'); await page.waitForTimeout(100); assert.equal(await page.locator('#pin-panel').isVisible(), false);
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(180);
    await page.evaluate(() => {
      const derive = crypto.subtle.deriveBits.bind(crypto.subtle);
      crypto.subtle.deriveBits = function (...args) { return new Promise(resolve => setTimeout(resolve, 350)).then(() => derive(...args)); };
    });
    await digits(page, '86539012'); await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Adults', exact: true }).waitFor();
    assert.equal(await page.locator('#playback').isVisible(), false, 'OK during slow code verification must not launch the selected film or cancel parental access');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.locator('nav').isVisible(), false, 'hiding locks adult mode');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.locator('#wall-focus[data-selected]').waitFor();
    await digits(page, '86539012'); await page.getByRole('heading', { name: 'Adults', exact: true }).waitFor();
    await page.locator('#settings').click(); await page.locator('#back-to-kids').click(); await page.locator('#wall-focus[data-selected]').waitFor();
    await page.evaluate(() => localStorage.setItem('kids-tv-density', JSON.stringify({ columns: 7, rows: 5 })));
    await page.reload(); await page.locator('#wall-focus[data-selected]').waitFor();
    assert.deepEqual(await page.evaluate(() => {
      const tile = document.getElementById('wall-focus').getBoundingClientRect(), wall = document.getElementById('wall-viewport').getBoundingClientRect();
      return [Math.round(wall.width / tile.width), Math.round(wall.height / tile.height)];
    }), [7, 5], 'update preserves a valid saved density preference');
    await page.evaluate(() => localStorage.setItem('kids-tv-density', JSON.stringify({ columns: 4, rows: 2 })));
    await page.reload(); await page.locator('#wall-focus[data-selected]').waitFor();
    assert.deepEqual(await page.evaluate(() => {
      const tile = document.getElementById('wall-focus').getBoundingClientRect(), wall = document.getElementById('wall-viewport').getBoundingClientRect();
      return [Math.round(wall.width / tile.width), Math.round(wall.height / tile.height)];
    }), [5, 3], 'invalid preferences safely fall back to 5x3 without wiping code/progress');
  }
  const results = path.resolve(__dirname, '../test-results'); fs.mkdirSync(results, { recursive: true });
  await page.screenshot({ path: path.join(results, live ? 'family-live-private.png' : 'family-' + scenario + '.png') });
  assert.deepEqual(errors, []);
  console.log(live ? 'Live read-only kids-root catalogue/render check passed. No media playback or native TV acceptance.' : 'Family browser ' + scenario + (recoveryNonce ? ' with code recovery' : '') + ': fixed-centre navigation, visible metadata, dwell, playback/queue rotation, parent bootstrap/change/slow-check re-entry, remote-only sizing/Save/Back, modal isolation, density persistence, Reset Home and kids relaunch passed.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (page) await page.unrouteAll({ behavior: 'ignoreErrors' }); if (browser) await browser.close(); if (server) server.close(); });
