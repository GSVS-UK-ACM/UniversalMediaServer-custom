const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const C = require('../app/core.js');
const F = require('../app/family.js');
const movies = n => Array.from({ length: n }, (_, i) => ({ id: String(i), title: 'Family ' + i, kind: i % 3 ? 'film' : 'tv show' }));

test('schema metadata separates all four prefixes, year, quality and visible edition', () => {
  const m = C.mediaName('(film) (2002) Spider-Man - Extended Cut (1080p BluRay).mkv');
  assert.equal(m.title, 'Spider-Man - Extended Cut'); assert.equal(m.year, '2002'); assert.equal(m.kind, 'film'); assert.equal(m.quality, '1080p BluRay');
  for (const kind of ['tv show', 'trailers', 'extra content']) assert.equal(C.mediaName('(' + kind + ') Sample (PAL DVD Remux).mkv').kind, kind);
  assert.equal(C.cleanTitle('(tv show) Example - S02E03 - Adventure (Part 2) (480p DVD Rip).mp4'), 'Example - S02E03 - Adventure (Part 2)');
  assert.equal(C.mediaName('Title (1999).mp4').year, '1999');
  assert.equal(C.mediaName('Unknown Film.mkv').year, '');
});

test('7x5 has exactly one centre and 35 unique visible titles when available', () => {
  const wall = F.wall(movies(200), 7, 5, true), cells = wall.cells();
  assert.equal(cells.length, 35); assert.equal(cells.filter(c => c.centre).length, 1);
  assert.deepEqual([cells.find(c => c.centre).x, cells.find(c => c.centre).y], [3, 2]);
  assert.equal(new Set(cells.map(c => c.item.id)).size, 35);
});

test('whole-library movement is reversible and not limited to 7 columns or 5 rows', () => {
  const wall = F.wall(movies(137), 7, 5, true), initial = wall.selected().id;
  for (let i = 0; i < 7; i++) wall.move('right'); assert.notEqual(wall.selected().id, initial);
  for (let i = 0; i < 7; i++) wall.move('left'); assert.equal(wall.selected().id, initial);
  for (let i = 0; i < 5; i++) wall.move('down'); assert.notEqual(wall.selected().id, initial);
  for (let i = 0; i < 5; i++) wall.move('up'); assert.equal(wall.selected().id, initial);
  wall.move('left'); assert.equal(wall.selected().id, '136'); wall.move('right'); assert.equal(wall.selected().id, initial);
});

test('density is parent-adjustable, odd, bounded and preserves an existing arrangement', () => {
  assert.deepEqual(F.density(9, 7), { columns: 9, rows: 7 });
  for (const dims of [[6, 5], [7, 4], [99, 5], [7, NaN]]) assert.throws(() => F.density(...dims));
  const order = movies(40), wall = F.wall(order, 9, 5, true); assert.deepEqual(wall.order, order);
  assert.equal(F.wall([], 7, 5).selected(), null); assert.equal(F.wall(movies(1), 7, 5).cells().length, 35);
});

test('spacing avoids adjacent franchise blocks when alternatives exist and loses no entries', () => {
  const items = Array.from({ length: 30 }, (_, i) => ({ id: i, title: 'Title', franchise: 'Family ' + (i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'), kind: ['film', 'tv show', 'extra content'][i % 3] }));
  const out = F.spread(items, 7, () => 0.5);
  assert.equal(new Set(out.map(x => x.id)).size, items.length);
  for (let i = 1; i < out.length - 2; i++) assert.notEqual(out[i].franchise, out[i - 1].franchise);
});

test('TV click start rotates 1, 2, 3, wraps each queue once and uses natural episode order', () => {
  const items = [10, 2, 1, 3].map(i => ({ title: '(tv show) Example - S01E' + String(i).padStart(2, '0') }));
  const first = F.queue(items, 'tv show', 0), second = F.queue(items, 'tv show', first.nextStart);
  assert.deepEqual(first.items.map(i => C.mediaName(i.title).episode), [1, 2, 3, 10]);
  assert.deepEqual(second.items.map(i => C.mediaName(i.title).episode), [2, 3, 10, 1]);
  assert.equal(F.queue(items, 'tv show', 3).nextStart, 0);
  assert.equal(F.queue([], 'tv show', 0).items.length, 0);
});

test('bonus queues shuffle each item exactly once without changing the source', () => {
  const items = movies(9), original = items.slice(), result = F.queue(items, 'extra content', 0, () => 0);
  assert.equal(result.items.length, 9); assert.equal(new Set(result.items.map(i => i.id)).size, 9);
  assert.notDeepEqual(result.items, items); assert.deepEqual(items, original);
});

test('catalogue only traverses the chosen root, groups series, preserves editions and hides adverts', async () => {
  const calls = [], map = {
    kids: [{ id: 'a', title: 'Films', folder: true }, { id: 'b', title: 'Series', folder: true }, { id: 'excluded', title: 'DVD-Reviewed', folder: true }],
    a: [{ id: '1', title: '(film) (2002) Spider-Man (1080p BluRay)', parentId: 'a' }, { id: '2', title: '(film) (2002) Spider-Man - Extended Cut', parentId: 'a' }, { id: '3', title: '(trailers) Preview' }],
    b: [{ id: '4', title: '(tv show) Example - S01E02 - Two' }, { id: '5', title: '(tv show) Example - S01E01 - One' }]
  };
  const entries = await F.catalogue(async id => { calls.push(id); return map[id]; }, { id: 'kids', title: 'kids' });
  assert.deepEqual(calls, ['kids', 'a', 'b']); assert.equal(entries.length, 3);
  assert.equal(entries.find(e => e.kind === 'tv show').items.length, 2);
  assert.equal(F.label(entries[0]), 'Spider-Man - 2002 - Film');
});

test('catalogue respects cancellation, cycle and size bounds and never publishes partial failure', async () => {
  let current = true;
  await assert.rejects(F.catalogue(async () => { current = false; return []; }, { id: 'kids' }, { isCurrent: () => current }), /cancelled/);
  await assert.rejects(F.catalogue(async () => [{ id: 'child', title: 'child', folder: true }], { id: 'kids' }, { maxFolders: 1 }), /limit/);
  await assert.rejects(F.catalogue(async () => movies(4), { id: 'kids' }, { maxItems: 2 }), /limit/);
  await assert.rejects(F.catalogue(async () => { throw new Error('offline'); }, { id: 'kids' }), /offline/);
});

test('a misidentified inherited folder poster cannot leak into a validated kids collection', async () => {
  const entries = await F.catalogue(async () => [{ id: 'ep', title: '(tv show) Example - S01E01 - One', artwork: '' }], { id: 'kids', title: 'kids', artwork: '/wrong-inherited-poster.jpg' });
  assert.equal(entries[0].artwork, '');
});

test('bootstrap only accepts 12345, and confirmation requires a personal 5-10 digit replacement', async () => {
  assert.equal(await F.checkCode('12345', null, webcrypto), true); assert.equal(await F.checkCode('54321', null, webcrypto), false);
  for (const value of ['1234', '12345678901', '12a45', '12345']) await assert.rejects(F.newCode(value, value, webcrypto));
  await assert.rejects(F.newCode('93518', '93519', webcrypto), /match/);
  const record = await F.newCode('93518027', '93518027', webcrypto);
  assert.equal(record.length, 8); assert.ok(F.codeRecord(record)); assert.equal(JSON.stringify(record).includes('93518027'), false);
  assert.equal(await F.checkCode('93518027', record, webcrypto), true); assert.equal(await F.checkCode('12345', record, webcrypto), false);
  assert.equal(await F.checkCode('93518028', record, webcrypto), false);
});

test('corrupt credentials fail closed and missing secure crypto does not fall back to plaintext', async () => {
  for (const record of [{}, { version: 1, length: 1e9 }, { version: 1, length: -1 }]) {
    assert.equal(!!F.codeRecord(record), false); await assert.rejects(F.checkCode('12345', record, webcrypto), /invalid/);
  }
  await assert.rejects(F.newCode('93518', '93518', { getRandomValues: a => a }), /unavailable/);
});

test('invisible digit buffer resets on pause/navigation and cools down after five wrong attempts', async () => {
  let time = 100, attempts = 0;
  const gate = F.gate(5, async code => { attempts++; return code === '12345'; }, () => time);
  for (const d of '12') await gate.digit(d); gate.reset();
  for (const d of '345') assert.equal(await gate.digit(d), false);
  time += 16000; for (const d of '1234') await gate.digit(d); assert.equal(await gate.digit('5'), true);
  for (let i = 0; i < 25; i++) await gate.digit('0');
  const before = attempts; for (const d of '12345') assert.equal(await gate.digit(d), false); assert.equal(attempts, before);
  time += 31000; for (const d of '1234') await gate.digit(d); assert.equal(await gate.digit('5'), true);
});

test('tile metadata retains evidenced year/type without inventing a missing year', () => {
  assert.equal(F.metadata({ title: '(film) (2002) Example (PAL DVD Remux)' }), '2002 - Film');
  assert.equal(F.metadata({ title: 'Example', kind: 'tv show' }), 'Series');
  assert.equal(F.metadata({ title: 'Example', kind: 'extra content', year: '2003' }), '2003 - Bonus content');
});

test('physical-remote entry tolerates deliberate pauses while navigation and long idle reset it', async () => {
  let time = 100;
  const gate = F.gate(5, async value => value === '93518', () => time);
  for (const d of '9351') { await gate.digit(d); time += 5000; }
  assert.equal(await gate.digit('8'), true);
  await gate.digit('9'); time += 16000;
  for (const d of '3518') assert.equal(await gate.digit(d), false);
  gate.reset(); for (const d of '9351') await gate.digit(d); assert.equal(await gate.digit('8'), true);
});

test('owner recovery resets only the code once and preserves a later new code on reload', () => {
  const values = new Map([['kids-tv-parent-code', 'old record'], ['kids-tv-progress', 'progress'], ['kids-tv-density', 'density']]);
  const storage = { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const nonce = 'a'.repeat(32);
  assert.equal(F.recoverCode(storage, ''), false); assert.equal(F.recoverCode(storage, nonce), true);
  assert.equal(storage.getItem('kids-tv-parent-code'), null);
  assert.equal(storage.getItem('kids-tv-progress'), 'progress'); assert.equal(storage.getItem('kids-tv-density'), 'density');
  storage.setItem('kids-tv-parent-code', 'new record'); assert.equal(F.recoverCode(storage, nonce), false);
  assert.equal(storage.getItem('kids-tv-parent-code'), 'new record');
  assert.throws(() => F.recoverCode(storage, 'invalid'), /Invalid/);
  assert.throws(() => F.recoverCode({ ...storage, setItem() { throw Error('full'); } }, 'b'.repeat(32)), /full/);
  assert.equal(storage.getItem('kids-tv-parent-code'), 'new record');
});
