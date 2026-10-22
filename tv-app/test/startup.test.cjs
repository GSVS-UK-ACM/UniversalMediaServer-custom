const test = require('node:test');
const assert = require('node:assert/strict');
const { DOMParser } = require('@xmldom/xmldom');
const S = require('../app/startup.js');
const server = 'http://192.0.2.1:5001/dev/test/desc';
const router = { descriptionUrl: 'http://192.168.50.1:49000/tr64desc.xml', macAddress: '02-00-00-00-00-01' };
const description = '<root><service><serviceType>urn:dslforum-org:service:Hosts:1</serviceType><controlURL>/upnp/control/hosts</controlURL></service></root>';
const success = '<Envelope><X_AVM-DE_WakeOnLANByMACAddressResponse/></Envelope>';
const flush = () => new Promise(resolve => setImmediate(resolve));
function harness(overrides = {}) {
  let time = 0, next = 0;
  const pending = new Map(), states = [], ready = [], errors = [], wakes = [];
  const controller = S.recovery({
    schedule(fn, delay) { pending.set(++next, { fn, at: time + delay }); return next; },
    cancel(id) { pending.delete(id); }, now() { return time; },
    load: async () => ({ empty: false }), wake: async url => { wakes.push(url); },
    state: value => states.push(value), ready: value => ready.push(value), error: value => errors.push(value), ...overrides
  });
  return { controller, pending, states, ready, errors, wakes, async tick() {
    assert.equal(pending.size, 1, 'only one probe timer may be scheduled');
    const [id, entry] = pending.entries().next().value;
    pending.delete(id); time = entry.at; entry.fn(); await flush();
  } };
}

test('already-online startup loads once, sends no wake and schedules no polling', async () => {
  const h = harness(); h.controller.start(server); await flush();
  assert.equal(h.ready.length, 1); assert.equal(h.wakes.length, 0); assert.equal(h.pending.size, 0);
});
test('offline startup wakes only after first failed probe and recovers without reopening', async () => {
  let probes = 0;
  const h = harness({ load: async () => { if (++probes < 3) throw Error('offline'); return { empty: false }; } });
  h.controller.start(server); assert.equal(h.wakes.length, 0); await flush();
  assert.equal(h.wakes.length, 1); await h.tick(); assert.equal(h.wakes.length, 1);
  await h.tick(); assert.equal(h.ready.length, 1); assert.equal(h.pending.size, 0);
});
test('repeated wake attempts are spaced and capped, connection checks continue', async () => {
  const h = harness({ load: async () => { throw Error('offline'); } });
  h.controller.start(server); await flush();
  for (let i = 0; i < 20; i++) await h.tick();
  assert.equal(h.wakes.length, 3); assert.equal(h.pending.size, 1);
  h.controller.stop(); assert.equal(h.pending.size, 0);
});
test('reachable HTTP errors retry without sending wake packets', async () => {
  const h = harness({ load: async () => { throw Object.assign(Error('503'), { serverReachable: true }); } });
  h.controller.start(server); await flush(); await h.tick();
  assert.equal(h.wakes.length, 0); h.controller.stop();
});
test('empty startup retries briefly without waking, then accepts a genuinely empty library', async () => {
  const h = harness({ load: async () => ({ empty: true }) });
  h.controller.start(server); await flush();
  for (let i = 0; i < 5; i++) await h.tick();
  assert.equal(h.wakes.length, 0); assert.equal(h.ready.length, 1); assert.equal(h.pending.size, 0);
});
test('temporarily empty library automatically populates on a later probe', async () => {
  let probes = 0;
  const h = harness({ load: async () => ({ empty: ++probes < 3 }) });
  h.controller.start(server); await flush(); await h.tick(); await h.tick();
  assert.equal(h.ready[0].empty, false); assert.equal(h.wakes.length, 0);
});
test('pausing cancels pending probes and ignores late results', async () => {
  let finish;
  const h = harness({ load: () => new Promise(resolve => { finish = resolve; }) });
  h.controller.start(server); h.controller.stop(); finish({ empty: false }); await flush();
  assert.equal(h.ready.length, 0); assert.equal(h.wakes.length, 0); assert.equal(h.pending.size, 0);
});
test('a new target ignores the previous in-flight connection result', async () => {
  let finish;
  const h = harness({ load: url => url === server ? new Promise(resolve => { finish = resolve; }) : Promise.resolve({ empty: false, newTarget: true }) });
  h.controller.start(server); h.controller.start('http://192.0.2.2:5001/desc'); await flush();
  finish({ empty: false, oldTarget: true }); await flush();
  assert.deepEqual(h.ready, [{ empty: false, newTarget: true }]);
});
test('stopping before a failed probe settles prevents even the first wake', async () => {
  let fail;
  const h = harness({ load: () => new Promise((resolve, reject) => { fail = reject; }) });
  h.controller.start(server); h.controller.stop(); fail(Error('offline')); await flush();
  assert.equal(h.wakes.length, 0); assert.equal(h.pending.size, 0);
});
test('configuration/authentication errors do not wake or retry forever', async () => {
  const h = harness({ load: async () => { throw Object.assign(Error('401'), { retryable: false }); } });
  h.controller.start(server); await flush();
  assert.equal(h.errors.length, 1); assert.equal(h.wakes.length, 0); assert.equal(h.pending.size, 0);
});
test('wake failures do not stop automatic connection recovery', async () => {
  let probes = 0;
  const h = harness({ wake: async () => { throw Error('router offline'); }, load: async () => { if (++probes < 2) throw Error('PC offline'); return { empty: false }; } });
  h.controller.start(server); await flush(); await h.tick();
  assert.equal(h.ready.length, 1); assert.equal(h.pending.size, 0);
});
test('router overlay rejects public destinations, credentials and invalid/multicast MACs', () => {
  assert.equal(S.wakeConfig(router).macAddress, '02:00:00:00:00:01');
  for (const descriptionUrl of ['https://example.com/tr64desc.xml', 'http://user:secret@fritz.box/desc', 'file:///etc/passwd', 'http://fritz.box/desc?token=secret']) assert.throws(() => S.wakeConfig({ ...router, descriptionUrl }));
  for (const macAddress of ['FF:FF:FF:FF:FF:FF', '00:00:00:00:00:00', 'hello']) assert.throws(() => S.wakeConfig({ ...router, macAddress }));
});
test('FRITZ wake uses only the discovered same-router wake action and configured MAC', async () => {
  const calls = [];
  await S.wakeRouter(async (url, options) => { calls.push({ url, options }); return calls.length === 1 ? description : success; }, DOMParser, router);
  assert.equal(calls.length, 2); assert.equal(calls[1].url, 'http://192.168.50.1:49000/upnp/control/hosts');
  assert.match(calls[1].options.body, /<NewMACAddress>02:00:00:00:00:01<\/NewMACAddress>/);
  assert.equal(calls[1].options.headers.SOAPAction, '"urn:dslforum-org:service:Hosts:1#X_AVM-DE_WakeOnLANByMACAddress"');
  assert.doesNotMatch(calls[1].options.body, /SetAuto|password|Authorization/);
});
test('wake rejects foreign control URLs, SOAP faults and malformed responses', async () => {
  await assert.rejects(S.wakeRouter(async () => description.replace('/upnp/control/hosts', 'https://elsewhere.invalid/wake'), DOMParser, router), /configured router/);
  await assert.rejects(S.wakeRouter(async () => description.replace('/upnp/control/hosts', ''), DOMParser, router), /no control endpoint/);
  for (const reply of ['<Envelope><Fault/></Envelope>', '<root/>']) {
    let calls = 0;
    await assert.rejects(S.wakeRouter(async () => ++calls === 1 ? description : reply, DOMParser, router));
  }
});
test('hiding during router discovery prevents a deferred wake POST', async () => {
  let finish, active = true, calls = 0;
  const pending = S.wakeRouter(async () => { calls++; return new Promise(resolve => { finish = resolve; }); }, DOMParser, router, () => active);
  active = false; finish(description); await pending;
  assert.equal(calls, 1, 'router discovery may finish, but no wake POST is allowed');
});
