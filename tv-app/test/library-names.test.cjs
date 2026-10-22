const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { derive } = require('../scripts/library-names.cjs');
const root = path.resolve('synthetic-library');
const plan = name => derive(path.join(root, ...name.split('/')), root);
test('film names keep evidenced source/year and remove release tags, not film numbers', () => {
  assert.equal(plan('Film.2.2011.1080p.BluRay.x264-GROUP.mp4').name, '(film) (2011) Film 2 (1080p BluRay).mp4');
  assert.equal(plan('2. Example (1998 - 480p DVDRip).mp4').name, '(film) (1998) Example (480p DVD Rip).mp4');
});
test('quality parentheses are removed atomically rather than leaving a broken suffix', () => {
  assert.equal(plan('Show/Show - S03 E02 - Name (Part 1) (480p DVDRip).mp4').name, '(tv show) Show - S03E02 - Name (Part 1) (480p DVD Rip).mp4');
});
test('explicit season folder and source episode numbers do not invent metadata', () => {
  assert.equal(plan('Example/Season 2/03 - Title.mp4').name, '(tv show) Example - S02E03 - Title.mp4');
  assert.equal(plan('Postman Pat (1981) - Complete - DVDRip + WEBRip/S01E03 - Title.mkv').name, '(tv show) Postman Pat - S01E03 - Title.mkv');
});
test('unknown film year/quality stay absent and existing schema labels are preserved', () => {
  assert.equal(plan('Unknown Film.mkv').name, '(film) Unknown Film.mkv');
  assert.equal(plan('(extra content) (2002) Example - Deleted Scene (PAL DVD Remux).mkv').name, '(extra content) (2002) Example - Deleted Scene (PAL DVD Remux).mkv');
});
