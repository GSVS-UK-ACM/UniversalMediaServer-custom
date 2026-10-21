const test = require('node:test');
const assert = require('node:assert/strict');
const create = require('../app/player.js');
function fixture() {
  const calls = [], callbacks = { time() {}, message() {}, error(message) { calls.push(['error', message]); }, ended() {} };
  const native = { open(url) { calls.push(['open', url]); }, close() {}, stop() {}, setDisplayRect(...r) { calls.push(['rect', ...r]); }, setDisplayMethod() {}, setListener(l) { this.listener = l; }, prepareAsync(ok, fail) { this.ready = ok; this.fail = fail; }, getDuration() { return 100000; }, play() { calls.push(['play']); }, pause() { calls.push(['pause']); }, seekTo(ms, ok) { calls.push(['seek', ms]); ok(); } };
  return { native, calls, callbacks, player: create(native, null, callbacks) };
}
test('native preparation uses fixed AVPlay display space then starts and resumes', () => {
  const f = fixture(); f.player.open('http://server/movie', 30); assert.equal(f.calls.some(x => x[0] === 'play'), false);
  f.native.ready(); assert.ok(f.calls.some(x => x[0] === 'play')); assert.ok(f.calls.some(x => x[0] === 'seek' && x[1] === 30000));
  assert.deepEqual(f.calls.find(x => x[0] === 'rect'), ['rect', 0, 0, 1920, 1080]);
});
test('cancelled async preparation cannot restart playback after Back', () => {
  const f = fixture(); f.player.open('http://server/movie', 0); f.player.stop(); f.native.ready(); assert.equal(f.calls.some(x => x[0] === 'play'), false);
});
test('seek clamps to timeline and play/pause is reversible', () => {
  const f = fixture(); f.player.open('http://server/movie', 0); f.native.ready(); f.native.listener.oncurrentplaytime(90000); f.player.seek(30);
  assert.ok(f.calls.some(x => x[0] === 'seek' && x[1] === 99000)); f.player.toggle(); f.player.toggle();
  assert.ok(f.calls.some(x => x[0] === 'pause'));
});
test('failed preparation is actionable instead of silently closing', () => {
  const f = fixture(); f.player.open('http://server/movie', 0); f.native.fail('NOT_SUPPORTED'); assert.ok(f.calls.some(x => x[0] === 'error' && x[1].includes('NOT_SUPPORTED')));
});
test('late native events from a stopped stream cannot corrupt the next stream', () => {
  const f = fixture(); let ticks = 0; f.callbacks.time = () => ticks++;
  f.player.open('http://server/first', 0); const previous = f.native.listener;
  f.player.open('http://server/second', 0); previous.oncurrentplaytime(99000); previous.onerror('OLD_STREAM');
  assert.equal(ticks, 0); assert.equal(f.calls.some(x => x[0] === 'error'), false);
});
