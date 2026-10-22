/* Foreground-only recovery. No periodic traffic after a successful library load. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.KidsStartup = factory(root.KidsCore);
}(this, function (C) {
  'use strict';
  var HOSTS = 'urn:dslforum-org:service:Hosts:1';
  var WAKE = 'X_AVM-DE_WakeOnLANByMACAddress';

  /** Validate a private router overlay without permitting credentials or public relays. */
  function wakeConfig(config) {
    if (!config) return null;
    var url = new URL(C.httpUrl(config.descriptionUrl)), host = url.hostname.toLowerCase();
    var octets = host.split('.').map(Number);
    var ipv4 = /^\d+\.\d+\.\d+\.\d+$/.test(host) && octets.every(function (n) { return n >= 0 && n <= 255; });
    var privateIp = ipv4 && (octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168));
    if (!privateIp && host !== 'fritz.box' && !/\.local$/.test(host)) throw new Error('Wake router must be on the local network');
    if (url.search || url.hash) throw new Error('Wake router URL must not contain query parameters');
    var mac = String(config.macAddress || '').replace(/-/g, ':').toUpperCase();
    if (!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac) || /^00(:00){5}$/.test(mac) || (parseInt(mac.slice(0, 2), 16) & 1)) throw new Error('Wake target must be a unicast MAC address');
    return { descriptionUrl: url.href, macAddress: mac };
  }

  /** Ask the always-on FRITZ!Box to wake only the configured PC. Never change router settings. */
  async function wakeRouter(request, Parser, config, isCurrent) {
    config = wakeConfig(config);
    if (!config || (isCurrent && !isCurrent())) return;
    var xml = C.parseXml(await request(config.descriptionUrl, { timeout: 4000 }), Parser);
    var services = Array.prototype.slice.call(xml.getElementsByTagNameNS('*', 'service'));
    function text(node, name) { var el = node.getElementsByTagNameNS('*', name)[0]; return el ? el.textContent : ''; }
    var hosts = services.filter(function (s) { return text(s, 'serviceType') === HOSTS; });
    if (hosts.length !== 1) throw new Error('Wake service is not available on the router');
    var controlPath = text(hosts[0], 'controlURL');
    if (!controlPath) throw new Error('Wake service has no control endpoint');
    var control = C.httpUrl(controlPath, config.descriptionUrl);
    if (new URL(control).origin !== new URL(config.descriptionUrl).origin) throw new Error('Wake endpoint must stay on the configured router');
    // Description retrieval can finish after the TV hides the app. Do not send
    // a deferred magic-packet request after that foreground session has ended.
    if (isCurrent && !isCurrent()) return;
    var body = '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:' + WAKE + ' xmlns:u="' + HOSTS + '"><NewMACAddress>' + config.macAddress + '</NewMACAddress></u:' + WAKE + '></s:Body></s:Envelope>';
    var response = C.parseXml(await request(control, { method: 'POST', timeout: 4000, headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"' + HOSTS + '#' + WAKE + '"' }, body: body }), Parser);
    if (response.getElementsByTagNameNS('*', 'Fault').length || !response.getElementsByTagNameNS('*', WAKE + 'Response').length) throw new Error('The router did not accept the wake request');
  }

  /**
   * One serial connection probe per foreground session. A generation fence keeps
   * late HTTP replies from repainting a different connection or a hidden app.
   * Wake retries are bounded separately from harmless connection retries.
   */
  function recovery(options) {
    var schedule = options.schedule || setTimeout, cancel = options.cancel || clearTimeout, now = options.now || Date.now;
    var timer = null, generation = 0, running = false, attempts = 0, emptyAttempts = 0;
    var wakeCount = 0, lastWake = -Infinity, wakeBusy = false, wakeError = false, target;
    var retryDelay = options.retryDelay || 5000, wakeDelay = options.wakeDelay || 30000;
    function current(token) { return running && token === generation; }
    function state(phase, extra) {
      if (options.state) options.state({ phase: phase, attempts: attempts, wakeCount: wakeCount, wakeError: wakeError, error: extra || '' });
    }
    function clearTimer() { if (timer !== null) { cancel(timer); timer = null; } }
    function stop() { running = false; generation++; clearTimer(); }
    function wake(token) {
      if (!options.wake || wakeBusy || wakeCount >= 3 || now() - lastWake < wakeDelay) return;
      wakeCount++; lastWake = now(); wakeBusy = true;
      Promise.resolve().then(function () { if (current(token)) return options.wake(target, function () { return current(token); }); }).then(function () {
        if (current(token)) { wakeBusy = false; wakeError = false; }
      }, function () { if (current(token)) { wakeBusy = false; wakeError = true; } });
    }
    function later(token) {
      if (current(token)) timer = schedule(function () { timer = null; attempt(token); }, retryDelay);
    }
    async function attempt(token) {
      if (!current(token)) return;
      attempts++; state('connecting');
      try {
        var value = await options.load(target);
        if (!current(token)) return;
        // A reachable but temporarily empty library gets a short, bounded
        // refresh window. It must not wake the PC repeatedly or loop forever.
        if (value.empty && ++emptyAttempts < 6) { state('loading'); later(token); return; }
        running = false; clearTimer(); state('ready'); options.ready(value);
      } catch (err) {
        if (!current(token)) return;
        emptyAttempts = 0;
        if (err.retryable === false) { running = false; state('error', err.message); if (options.error) options.error(err); return; }
        if (!err.serverReachable) wake(token);
        state('waiting'); later(token);
      }
    }
    return {
      start: function (url) {
        stop(); target = C.httpUrl(url); attempts = 0; emptyAttempts = 0;
        wakeCount = 0; lastWake = -Infinity; wakeBusy = false; wakeError = false;
        running = true; attempt(generation);
      },
      stop: stop,
      isWaiting: function () { return running; }
    };
  }
  return { wakeConfig: wakeConfig, wakeRouter: wakeRouter, recovery: recovery };
}));
