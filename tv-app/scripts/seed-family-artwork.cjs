/* First-pass artwork from owned library footage, never scraped posters. Dry
 * run by default. Existing choices are immutable; provenance stays private.
 * Every output is a new sidecar, not a modification of a media stream. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const C = require('../app/core.js');
function inside(root, file) { const rel = path.relative(root, file); return rel !== '' && !rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel); }
function files(root, at = root, depth = 0) {
  if (depth > 12) throw new Error('Artwork source exceeds 12 folders.');
  return fs.readdirSync(at, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) return [];
    const file = path.join(at, entry.name);
    if (!inside(root, file)) throw new Error('Source left the selected root.');
    return entry.isDirectory() ? files(root, file, depth + 1) : entry.isFile() && /\.(mkv|mp4|avi|m4v|mpg|mpeg|ts|wmv|webm)$/i.test(file) ? [file] : [];
  });
}
function plan(root) {
  root = fs.realpathSync(root);
  return fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.isSymbolicLink()).map(entry => {
    const directory = path.join(root, entry.name), existing = fs.readdirSync(directory).filter(name => /^family-cover\.(jpe?g|png)$/i.test(name));
    const candidates = files(directory).filter(file => fs.statSync(file).size > 1024 * 1024 && C.mediaName(path.basename(file)).kind !== 'trailers').sort((a, b) => {
      const rank = file => { const kind = C.mediaName(path.basename(file)).kind; return kind === 'film' ? 0 : kind === 'tv show' ? 1 : kind === 'extra content' ? 2 : 3; };
      return rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true });
    });
    return { directory, destination: path.join(directory, 'family-cover.jpg'), existing, candidates };
  });
}
function pixels(bytes) {
  if (bytes.length !== 64 * 36 * 3) return -1;
  let sum = 0, squares = 0, middle = 0;
  for (let i = 0; i < bytes.length; i += 3) { const y = .2126 * bytes[i] + .7152 * bytes[i + 1] + .0722 * bytes[i + 2]; sum += y; squares += y * y; if (y > 25 && y < 235) middle++; }
  const n = bytes.length / 3, mean = sum / n;
  return (squares / n - mean * mean) * (middle / n) * (mean > 15 && mean < 240 ? 1 : .05);
}
function run(ffmpeg, args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', ...args], { encoding: null, timeout: 45000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  if (result.error) throw result.error;
  return result;
}
function seed(entry, ffmpeg, temporary) {
  const failures = [];
  for (const source of entry.candidates.slice(0, 5)) {
    const probe = spawnSync(ffmpeg, ['-hide_banner', '-nostdin', '-i', source], { encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024, windowsHide: true });
    const duration = String(probe.stderr).match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!duration) { failures.push('Duration unavailable: ' + path.basename(source)); continue; }
    const seconds = Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
    let best = null;
    for (const fraction of [.3, .5, .7]) {
      const at = Math.max(0, seconds * fraction), candidate = path.join(temporary, 'frame-' + fraction + '.jpg');
      const result = run(ffmpeg, ['-y', '-ss', String(at), '-i', source, '-an', '-sn', '-frames:v', '1', '-vf', 'thumbnail=24,scale=960:-2', '-q:v', '3', candidate]);
      if (result.status !== 0 || !fs.existsSync(candidate)) continue;
      const raw = run(ffmpeg, ['-i', candidate, '-frames:v', '1', '-vf', 'scale=64:36', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']);
      const score = raw.status === 0 ? pixels(raw.stdout) : -1;
      if (score >= 0 && (!best || score > best.score)) best = { source, seconds: at, score, bytes: fs.readFileSync(candidate) };
      if (score > 500) break;
    }
    if (best && best.score > 80) {
      // Exclusive create is the final race guard. Never replace an owner's
      // image, even if one appeared after the initial plan was prepared.
      const present = fs.readdirSync(entry.directory).filter(name => /^family-cover\.(jpe?g|png)$/i.test(name));
      if (present.length) return { ...entry, state: 'preserved', existing: present };
      fs.writeFileSync(entry.destination, best.bytes, { flag: 'wx' });
      return { ...entry, candidates: undefined, state: 'seeded', source: best.source, seconds: best.seconds, score: best.score, sha256: createHash('sha256').update(best.bytes).digest('hex'), bytes: best.bytes.length };
    }
    failures.push('No sufficiently visible scene: ' + path.basename(source));
  }
  return { ...entry, candidates: undefined, state: 'needs-review', failures };
}
function main(args) {
  const option = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : ''; };
  if (!option('--root')) throw new Error('Usage: seed-family-artwork.cjs --root SHARE-ROLE --ffmpeg FFMPEG --report PRIVATE-JSON [--apply]');
  const entries = plan(option('--root'));
  if (!args.includes('--apply')) { console.log(JSON.stringify(entries.map(({ candidates, ...entry }) => ({ ...entry, candidates: candidates.length })), null, 2)); return; }
  const report = path.resolve(option('--report') || ''), repo = path.resolve(__dirname, '../..');
  if (!option('--report') || report === repo || inside(repo, report) || fs.existsSync(report)) throw new Error('Use a new private report outside the repository.');
  if (!fs.existsSync(option('--ffmpeg'))) throw new Error('Select the installed FFmpeg executable.');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ums-family-art-')), results = [];
  try {
    for (const entry of entries) {
      let result;
      try { result = entry.existing.length ? { ...entry, candidates: undefined, state: 'preserved' } : seed(entry, option('--ffmpeg'), temporary); }
      catch (error) { result = { ...entry, candidates: undefined, state: 'needs-review', error: error.message }; }
      results.push(result); console.log(result.state + ': ' + path.basename(entry.directory));
      fs.writeFileSync(report, JSON.stringify(results, null, 2));
    }
  } finally {
    // Only our newly created temporary files. Never recursively delete a
    // computed media path or follow a link into the library.
    for (const name of fs.readdirSync(temporary)) fs.unlinkSync(path.join(temporary, name));
    fs.rmdirSync(temporary);
  }
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { inside, pixels, plan };
