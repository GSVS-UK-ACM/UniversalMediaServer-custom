/* Generate private exact-name/progress aliases from a frozen rename plan and
 * PRE-rename DIDL evidence. Resource slugs are matched within physical parents;
 * ambiguous mappings are not guessed. This script writes generated JSON only.
 */
const fs = require('node:fs');
const path = require('node:path');
const C = require('../app/core.js');
const [planPath, beforePath, output] = process.argv.slice(2);
if (!planPath || !beforePath || !output) throw new Error('Usage: library-overlay.cjs PLAN PRE-RENAME-DIDL PRIVATE-OUTPUT');
const repo = path.resolve(__dirname, '../..'), out = path.resolve(output);
if (out === repo || out.startsWith(repo + path.sep)) throw new Error('Keep private title data outside Git.');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8')).filter(e => e.kind !== 'companion');
const before = JSON.parse(fs.readFileSync(beforePath, 'utf8')).filter(e => !e.item.folder);
const sourceNames = {}, titleAliases = [], unmatched = [];
for (const entry of plan) {
  const name = path.basename(entry.destination), source = path.basename(entry.source);
  const key = C.resourceKey(name);
  if (sourceNames[key] && sourceNames[key] !== name) throw new Error('Ambiguous resource slug, preserve metadata for manual review.');
  sourceNames[key] = name;
  let matches = before.filter(e => C.resourceKey(C.resourceFilename(e.item.url)) === C.resourceKey(source));
  if (matches.length > 1) matches = matches.filter(e => entry.source.toLowerCase().includes(path.join(...e.path).toLowerCase() + path.sep));
  if (matches.length === 1) titleAliases.push({ oldTitle: matches[0].item.title, oldParentId: matches[0].item.parentId, newTitle: name });
  else unmatched.push(entry.source);
}
fs.writeFileSync(out, JSON.stringify({ sourceNames, titleAliases, unmatched }, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ exactNames: Object.keys(sourceNames).length, legacyAliases: titleAliases.length, unmatched: unmatched.length }));
