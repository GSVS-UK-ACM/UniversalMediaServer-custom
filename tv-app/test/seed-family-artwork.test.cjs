const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const S = require('../scripts/seed-family-artwork.cjs');

test('seed path guard rejects parent, sibling-prefix and root targets', () => {
  const root = path.resolve('library');
  assert.equal(S.inside(root, root), false);
  assert.equal(S.inside(root, path.resolve('library-other/image.jpg')), false);
  assert.equal(S.inside(root, path.resolve('library/../outside.jpg')), false);
  assert.equal(S.inside(root, path.resolve('library/family/image.jpg')), true);
});
test('frame score rejects black/white/invalid frames and rewards visible variation', () => {
  assert.equal(S.pixels(Buffer.alloc(64 * 36 * 3)), 0);
  assert.equal(S.pixels(Buffer.alloc(64 * 36 * 3, 255)), 0);
  assert.equal(S.pixels(Buffer.alloc(30)), -1);
  const visible = Buffer.from(Array.from({ length: 64 * 36 * 3 }, (_, i) => 30 + i % 180));
  assert.ok(S.pixels(visible) > 500);
});
test('dry planning preserves existing cover choice and prefers films over extras, never trailers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'family-seed-test-'));
  const family = path.join(root, 'example'); fs.mkdirSync(family);
  const names = ['family-cover.png', '(extra content) Clip.mkv', '(film) Main.mkv', '(trailers) Advert.mkv'];
  try {
    for (const name of names) fs.writeFileSync(path.join(family, name), Buffer.alloc(1024 * 1024 + 1));
    const [entry] = S.plan(root);
    assert.deepEqual(entry.existing, ['family-cover.png']);
    assert.equal(path.basename(entry.candidates[0]), '(film) Main.mkv');
    assert.equal(entry.candidates.length, 2);
    assert.equal(fs.existsSync(entry.destination), false, 'planning never generates images');
  } finally { for (const name of names) fs.unlinkSync(path.join(family, name)); fs.rmdirSync(family); fs.rmdirSync(root); }
});
