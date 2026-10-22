/* Filename-only intake planning. Never downloads metadata or writes media.
 * CLI output is PRIVATE inventory: select a directory outside the repository.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const C = require('../app/core.js');
const video = /\.(mkv|mp4|avi|m4v|ts|mpg|mpeg|webm|wmv)$/i;
function tidy(value) {
  return value.replace(/[._]/g, ' ').replace(/\s+/g, ' ').replace(/\s*[- ]\s*$/, '').trim();
}
function quality(value) {
  const resolution = (value.match(/\b(\d{3,4}p)\b/i) || [])[1] || '';
  const source = (value.match(/\b(WEB[ .-]?DL|WEBRip|HDTV|Blu[ .-]?Ray|BRRip|DVDRip|DVD Remux)\b/i) || [])[1] || '';
  const sources = { webdl: 'WEB-DL', webrip: 'WEBRip', hdtv: 'HDTV', bluray: 'BluRay', brrip: 'BluRay Rip', dvdrip: 'DVD Rip', dvdremux: 'DVD Remux' };
  return [resolution.toLowerCase(), sources[source.replace(/[ .-]/g, '').toLowerCase()] || '', /\b3D\b/i.test(value) ? '3D' : '', /\bHSBS\b/i.test(value) ? 'HSBS' : ''].filter(Boolean).join(' ');
}
function trimRelease(value) {
  return value.replace(/\s*\((?=[^)]*(?:\d{3,4}p|DVDRip|BluRay))[^)]*\)\s*$/i, '')
    .replace(/\s*\[(?:STEiNO|YTS[^\]]*|YIFY|EtMovies|TGx)\]/gi, '')
    .replace(/\s+Salman Sk Silver(?: RG)?\s*$/i, '')
    .replace(/\s*(?:[ .-](?:REPACK|\d{3,4}p|WEB[ .-]?DL|WEBRip|HDTV|Blu[ .-]?Ray|BRRip|DVDRip|x26[45]|H26[45]|HEVC|AAC|DDP)\b).*$/i, '').trim();
}
function derive(file, root) {
  const relative = path.relative(root, file), dirs = relative.split(path.sep).slice(0, -1), ext = path.extname(file);
  const original = path.basename(file, ext), info = C.mediaName(original), warnings = [];
  if (/^\((film|tv show|extra content|trailers)\)/i.test(original)) return { name: path.basename(file), warnings: ['Already labelled, preserved'], kind: info.kind };
  const parentHints = dirs.slice().reverse().join(' '), parentSources = new Set((parentHints.match(/\b(WEB[ .-]?DL|WEBRip|HDTV|Blu[ .-]?Ray|BRRip|DVDRip)\b/gi) || []).map(s => s.toLowerCase()));
  const q = quality(original) || (parentSources.size > 1 ? ((parentHints.match(/\b\d{3,4}p\b/i) || [])[0] || '') : quality(parentHints));
  const clean = tidy(trimRelease(original.replace(/^\d+\.\s+/, '')));
  let kind = 'film', title = clean, year = '', episode = clean.match(/^(.*?)\s*(?:-\s*)?S(\d{1,2})\s*E(\d{1,3})(\s*-\s*E\d+)?(?:\s*[- ]\s*)?(.*)$/i);
  const seasonIndex = dirs.findLastIndex(d => /\bSeason\s*\d+\b/i.test(d));
  const seasonFolder = seasonIndex >= 0 ? dirs[seasonIndex] : '';
  if (episode) {
    kind = 'tv show';
    let series = episode[1].replace(/\s*-\s*$/, '').trim();
    if (!series) series = tidy(dirs[dirs.length - 1].split(/\s*\((?:19|20)\d{2}\)|\s+-\s+Complete|\s+Season\b/i)[0]);
    const number = 'S' + episode[2].padStart(2, '0') + 'E' + episode[3].padStart(2, '0') + (episode[4] ? episode[4].replace(/\s/g, '') : '');
    title = series + ' - ' + number + (episode[5] ? ' - ' + episode[5] : '');
  } else if (seasonFolder && /^\d{1,3}(?:\s*&\s*\d{1,3})?\s*-/.test(clean)) {
    kind = 'tv show';
    const season = seasonFolder.match(/\bSeason\s*(\d+)/i)[1], number = clean.match(/^(\d+)(?:\s*&\s*(\d+))?\s*-\s*(.*)$/);
    let series = tidy(seasonFolder.replace(/\s*(?:-\s*)?(?:Complete\s+)?Season\s*\d+.*$/i, '')) || tidy(dirs[seasonIndex - 1] || '');
    title = series + ' - S' + season.padStart(2, '0') + 'E' + number[1].padStart(2, '0') + (number[2] ? '-E' + number[2].padStart(2, '0') : '') + ' - ' + number[3];
  } else if (dirs.includes('Curious George') && /^\d+\s*-/.test(clean)) {
    kind = 'tv show'; title = 'Curious George - ' + dirs[dirs.length - 1] + ' - ' + clean.replace(/^(\d+)\s*-\s*/, '$1 - ');
    warnings.push('Collection order retained; broadcast season/episode and year unknown');
  } else if (dirs.some(d => /^Ben 10 Ultimate Alien$/i.test(d))) {
    kind = 'tv show'; title = 'Ben 10 Ultimate Alien - ' + clean; warnings.push('Season unconfirmed, original episode labels retained');
  } else if (dirs.some(d => /^Extra Episod/i.test(d))) {
    kind = 'extra content'; title = 'Ben 10 - ' + clean; warnings.push('Bonus episode identity/order unconfirmed');
  } else {
    const yearMatch = clean.match(/(?:^|\s|\()((?:19|20)\d{2})(?:\)|\s|$)/);
    if (yearMatch) { year = yearMatch[1]; title = clean.slice(0, yearMatch.index).trim(); if (!title) title = clean.slice(yearMatch.index + yearMatch[0].length).trim(); }
    else { year = (original.match(/\b((?:19|20)\d{2})\b/) || [])[1] || ''; }
    // An existing numbered movie list is not an episode number.
    title = title.replace(/^\d+\s*-\s*/, '');
    const inlineYear = title.match(/\(((?:19|20)\d{2})\s*-\s*[^)]*\)/);
    if (inlineYear) { year = inlineYear[1]; title = title.slice(0, inlineYear.index).trim(); }
    if (/^BBC Schools - Numbertime/i.test(title)) { kind = 'tv show'; warnings.push('Educational collection, exact release year unconfirmed'); }
    if (!year) warnings.push('Release year unconfirmed; not invented');
  }
  if (!title) throw new Error('Empty derived title: ' + relative);
  if (title === title.toLowerCase()) title = title.replace(/\b[a-z]/g, c => c.toUpperCase());
  if (!q) warnings.push('Quality/source unconfirmed; no guessed label');
  if (year) warnings.push('Year retained from existing name, not independently verified');
  if (/deadpool/i.test(title) && !/shaun/i.test(title)) warnings.push('Known adult-title curation pending; DO NOT relocate during naming pass');
  const name = ('(' + kind + ') ' + (year ? '(' + year + ') ' : '') + title + (q ? ' (' + q + ')' : '')).replace(/[<>:"/\\|?*]/g, '-') + ext.toLowerCase();
  return { name, kind, warnings };
}
function inventory(root) {
  root = fs.realpathSync(root); const entries = [], stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.isSymbolicLink()) continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) { if (!/^DVD-(Reviewed|Incoming|Excluded|Adverts|Needs-Attention)$/i.test(item.name)) stack.push(file); }
      else if (video.test(item.name)) {
        const stat = fs.statSync(file), plan = derive(file, root);
        entries.push({ source: file, destination: path.join(dir, plan.name), bytes: stat.size, modified: stat.mtime.toISOString(), modifiedNs: String(fs.statSync(file, { bigint: true }).mtimeNs), kind: plan.kind, warnings: plan.warnings });
      }
    }
  }
  const destinations = new Set();
  for (const entry of entries) {
    let lower = entry.destination.toLowerCase();
    if (destinations.has(lower) || (fs.existsSync(entry.destination) && lower !== entry.source.toLowerCase())) {
      const ext = path.extname(entry.destination), suffix = crypto.createHash('sha256').update(entry.source).digest('hex').slice(0, 8);
      entry.destination = entry.destination.slice(0, -ext.length) + ' - Source Variant ' + suffix + ext;
      entry.warnings.push('Name collision; distinct source retained, no duplicate deletion'); lower = entry.destination.toLowerCase();
    }
    if (destinations.has(lower) || path.basename(entry.destination).length >= 240) throw new Error('Unsafe destination component/collision: ' + entry.source);
    if (entry.destination.length >= 260) entry.warnings.push('Existing deep folder path; native long-path preflight required');
    destinations.add(lower);
  }
  return entries;
}
function companions(entries) {
  const result = [], seen = new Set(), listings = new Map();
  const list = dir => { if (!listings.has(dir)) listings.set(dir, fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name) : []); return listings.get(dir); };
  const episodeKey = name => {
    const m = name.match(/S(\d{1,2})\s*E(\d{1,3})(?:[- .&]*E?(\d{1,3}))?/i);
    return m ? [Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : ''].join(':') : '';
  };
  for (const entry of entries) {
    const dir = path.dirname(entry.source), original = path.basename(entry.source, path.extname(entry.source)), renamed = path.basename(entry.destination, path.extname(entry.destination));
    for (const subdir of [dir, path.join(dir, 'Subs')]) {
      for (const name of list(subdir)) {
        if (!/\.(srt|ass|ssa|sub|idx|nfo|jpg|jpeg|png)$/i.test(name)) continue;
        let suffix = name.toLowerCase().startsWith(original.toLowerCase() + '.') || name.toLowerCase().startsWith(original.toLowerCase() + '-poster.') ? name.slice(original.length) : '';
        if (!suffix && subdir !== dir && /\.(srt|ass|ssa|sub|idx)$/i.test(name) && episodeKey(original) && episodeKey(name) === episodeKey(original)) suffix = path.extname(name);
        if (!suffix) continue;
        const source = path.join(subdir, name), destination = path.join(subdir, renamed + suffix), key = source.toLowerCase();
        if (seen.has(key)) throw new Error('Ambiguous subtitle/sidecar match: ' + source);
        if (fs.existsSync(destination)) throw new Error('Companion destination already exists: ' + destination);
        seen.add(key); const stat = fs.statSync(source);
        result.push({ source, destination, bytes: stat.size, modified: stat.mtime.toISOString(), modifiedNs: String(fs.statSync(source, { bigint: true }).mtimeNs), kind: 'companion', warnings: [] });
      }
    }
  }
  return result;
}
module.exports = { derive, inventory, quality, companions };
if (require.main === module) {
  const [root, out] = process.argv.slice(2);
  if (!root || !out) throw new Error('Usage: node scripts/library-names.cjs ROOT PRIVATE-OUTPUT-DIRECTORY');
  const output = path.resolve(out), repo = path.resolve(__dirname, '../..');
  if (output === repo || output.startsWith(repo + path.sep)) throw new Error('Keep private inventory outside Git');
  fs.mkdirSync(output, { recursive: true });
  const entries = inventory(root);
  fs.writeFileSync(path.join(output, 'name-plan.json'), JSON.stringify(entries, null, 2), { flag: 'wx' });
  fs.writeFileSync(path.join(output, 'apply-plan.json'), JSON.stringify(entries.concat(companions(entries)), null, 2), { flag: 'wx' });
  const csv = ['Source,Destination,Warnings'].concat(entries.map(e => [e.source, e.destination, e.warnings.join('; ')].map(s => '"' + s.replace(/"/g, '""') + '"').join(','))).join('\r\n');
  fs.writeFileSync(path.join(output, 'name-plan.csv'), csv, { flag: 'wx' });
  console.log(JSON.stringify({ files: entries.length, changed: entries.filter(e => e.source !== e.destination).length, warnings: entries.filter(e => e.warnings.length).length, byKind: entries.reduce((a, e) => { a[e.kind] = (a[e.kind] || 0) + 1; return a; }, {}) }));
}
