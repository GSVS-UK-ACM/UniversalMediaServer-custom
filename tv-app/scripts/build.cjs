const fs = require('node:fs');
const path = require('node:path');
const Startup = require('../app/startup.js');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
// Only overwrite this app's rebuildable output. Never touch live UMS files.
fs.mkdirSync(out, { recursive: true });
for (const name of fs.readdirSync(path.join(root, 'app'))) {
  fs.copyFileSync(path.join(root, 'app', name), path.join(out, name));
}
const configPath = path.join(root, 'connection.local.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : { descriptionUrl: '' };
if (config.descriptionUrl) {
  const url = new URL(config.descriptionUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid private connection URL');
}
// Like private launcher artwork, generated filename/legacy-progress overlays
// stay outside Git. Only the data, never its workstation path, enters the app.
const privateNames = config.privateNamesFile ? JSON.parse(fs.readFileSync(path.resolve(root, config.privateNamesFile), 'utf8')) : {};
const runtimeConfig = { descriptionUrl: config.descriptionUrl || '', displayName: config.displayName || 'UMS TV', homeFolder: config.homeFolder, libraryPaths: config.libraryPaths || {}, sourceNames: privateNames.sourceNames || config.sourceNames || {}, titleAliases: privateNames.titleAliases || config.titleAliases || [], wake: Startup.wakeConfig(config.wake) };
// Administrative code recovery is explicit private build configuration, not a
// public fallback PIN. A consumed token never resets a later replacement code.
if (config.parentalRecoveryNonce) {
  if (!/^[a-f0-9]{32}$/.test(config.parentalRecoveryNonce)) throw new Error('Invalid private parental recovery nonce');
  runtimeConfig.parentalRecoveryNonce = config.parentalRecoveryNonce;
}
fs.writeFileSync(path.join(out, 'connection.json'), JSON.stringify(runtimeConfig));
if (config.displayName) {
  const escaped = String(config.displayName).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
  const manifestPath = path.join(out, 'config.xml');
  fs.writeFileSync(manifestPath, fs.readFileSync(manifestPath, 'utf8').replace('<name>UMS TV Client</name>', '<name>' + escaped + '</name>'));
}
// Provide a deterministic, code-generated PNG icon without copying private
// character artwork into the source repository or public application package.
const zlib = require('node:zlib');
function crc32(buf) { let crc = 0xffffffff; for (const b of buf) { crc ^= b; for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const tag = Buffer.from(type); const size = Buffer.alloc(4); size.writeUInt32BE(data.length); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc32(Buffer.concat([tag, data]))); return Buffer.concat([size, tag, data, sum]); }
const size = 117, scan = Buffer.alloc((size * 3 + 1) * size);
for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  const play = x > 38 && x < 85 && Math.abs(y - 58) < (85 - x) * 0.63;
  const i = y * (size * 3 + 1) + x * 3 + 1;
  scan[i] = play ? 11 : 125; scan[i + 1] = play ? 30 : 230; scan[i + 2] = play ? 32 : 208;
}
const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
fs.writeFileSync(path.join(out, 'icon.png'), Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(scan)), chunk('IEND', Buffer.alloc(0))]));
if (config.iconFile) {
  const artwork = fs.readFileSync(path.resolve(root, config.iconFile));
  if (artwork.length > 1024 * 1024 || !artwork.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Private app icon must be a PNG smaller than 1 MiB');
  fs.writeFileSync(path.join(out, 'icon.png'), artwork);
}
console.log('Built TV web app in tv-app/dist. This is not signed or installed.');
