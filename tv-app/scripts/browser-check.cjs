const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const C = require('../app/core.js');
const root = path.resolve(__dirname, '../dist');
const fixtureBase = 'http://192.0.2.1:5001';
const descriptionUrl = process.env.TV_DESCRIPTION_URL || fixtureBase + '/dev/test/desc';
function result(didl, count) { return '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><Result>' + C.escapeXml('<DIDL-Lite xmlns:dc="urn:dc" xmlns:upnp="urn:upnp">' + didl + '</DIDL-Lite>') + '</Result><NumberReturned>' + count + '</NumberReturned><TotalMatches>' + count + '</TotalMatches></s:Body></s:Envelope>'; }
const folder = '<container id="1" parentID="0"><dc:title>Adventure collection</dc:title><upnp:albumArtURI>/art.png</upnp:albumArtURI></container>';
const movie = '<item id="2" parentID="1"><dc:title>A little adventure</dc:title><upnp:albumArtURI>/art.png</upnp:albumArtURI><res protocolInfo="http-get:*:video/mp4:*">/movie.mp4</res></item>';
let server, browser;
(async () => {
  server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : file.endsWith('.json') ? 'application/json' : 'text/html');
    fs.createReadStream(file).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.TV_CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(({ url, live }) => {
    localStorage.setItem('kids-tv-server', url);
    if (!live) window.webapis = { avplay: {
      open() {}, close() {}, stop() {}, pause() {}, play() {}, setDisplayRect() {}, setDisplayMethod() {}, setListener(listener) { this.listener = listener; },
      prepareAsync(ok) { setTimeout(ok, 10); }, getDuration() { return 600000; }, seekTo(ms, ok) { ok(); }
    } };
  }, { url: descriptionUrl, live: !!process.env.TV_DESCRIPTION_URL });
  if (!process.env.TV_DESCRIPTION_URL) await page.route('**/connection.json', route => route.fulfill({ contentType: 'application/json', body: '{"descriptionUrl":""}' }));
  // Browser-only CORS bridge for read-only validation. The packaged Tizen app
  // uses its access policy. Never enable CORS broadly on the live UMS server.
  await page.route(new URL(descriptionUrl).origin + '/**', async route => {
    const req = route.request(), headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type,soapaction' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
    if (process.env.TV_DESCRIPTION_URL) {
      const response = await route.fetch(); return route.fulfill({ response, headers: { ...response.headers(), ...headers } });
    }
    if (req.url().endsWith('/art.png')) return route.fulfill({ body: fs.readFileSync(path.join(root, 'icon.png')), contentType: 'image/png', headers });
    const xml = req.method() === 'GET' ? '<root><device><friendlyName>Kids TV test</friendlyName><service><serviceType>' + C.SERVICE + '</serviceType><controlURL>/control</controlURL></service></device></root>' : (req.postData().includes('<ObjectID>0</ObjectID>') ? result(folder, 1) : result(movie, 1));
    return route.fulfill({ body: xml, contentType: 'text/xml', headers });
  });
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.locator('.tile').first().waitFor();
  if (!process.env.TV_DESCRIPTION_URL) {
    await page.locator('.tile').nth(1).waitFor();
    assert.equal(await page.locator('.tile').count(), 2);
    await page.locator('.tile').first().focus(); await page.keyboard.press('ArrowRight');
    await page.locator('.tile').first().click();
    await page.getByRole('heading', { name: 'Adventure collection', exact: true }).waitFor();
    await page.locator('.tile').first().click(); await page.locator('#playback:not(.hidden)').waitFor();
    await page.keyboard.press('Escape'); await page.locator('#playback.hidden').waitFor();
    await page.locator('#search').click(); await page.locator('#query').fill('adventure'); await page.locator('#do-search').click();
    await page.getByRole('heading', { name: 'Found in your library' }).waitFor();
  }
  fs.mkdirSync(path.resolve(__dirname, '../test-results'), { recursive: true });
  await page.screenshot({ path: path.resolve(__dirname, '../test-results/preview.png') });
  assert.deepEqual(errors, []);
  console.log(process.env.TV_DESCRIPTION_URL ? 'Live UMS browser browse/render check passed (not native TV playback).' : 'Browser fixture navigation, playback adapter, Back and search checks passed.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); if (server) server.close(); });
