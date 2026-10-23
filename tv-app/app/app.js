(function () {
  'use strict';
  var C = window.KidsCore, $ = function (id) { return document.getElementById(id); };
  var server, current = { id: '0', title: 'Your library' }, history = [], cache = {}, viewToken = 0, activeItem = null, lastSave = 0, hudTimer;
  var stored = {}, connection = '', homeFolder = { id: '0', title: 'Your library' }, defaultHome, wakeSettings, lastPosition = 0, lastDuration = 0;
  var familyUI, playQueue = [];
  var chosenArtwork = Object.create(null);
  var sourceNames = {}, titleAliases = [], rejectedArtwork = [], namesServer = '';
  try { stored = JSON.parse(localStorage.getItem('kids-tv-progress') || '{}'); connection = localStorage.getItem('kids-tv-server') || ''; } catch (e) {}
  function persist() {
    try {
      // Bound private TV-local state. No thumbnails or media bytes are stored.
      var keys = Object.keys(stored).sort(function (a, b) { return stored[b].updated - stored[a].updated; });
      keys.slice(100).forEach(function (key) { delete stored[key]; });
      localStorage.setItem('kids-tv-progress', JSON.stringify(stored));
    } catch (e) { status('TV storage is full. Progress could not be saved.'); }
  }
  function status(message) { $('status').textContent = message || ''; }
  function request(url, options) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest(); xhr.open(options.method || 'GET', url); xhr.timeout = options.timeout || 20000;
      Object.keys(options.headers || {}).forEach(function (key) { xhr.setRequestHeader(key, options.headers[key]); });
      xhr.onload = function () {
        if ((xhr.status >= 200 && xhr.status < 300) || (url === 'connection.json' && xhr.status === 0 && xhr.responseText)) resolve(xhr.responseText);
        else { var error = new Error('UMS returned HTTP ' + xhr.status); error.retryable = xhr.status === 0 || xhr.status >= 500; error.serverReachable = xhr.status > 0; reject(error); }
      };
      xhr.onerror = function () { var error = new Error('Cannot reach UMS. Check the PC is awake and on the same network.'); error.retryable = true; reject(error); };
      xhr.ontimeout = function () { var error = new Error('UMS took too long to reply. Please retry.'); error.retryable = true; reject(error); };
      xhr.send(options.body || null);
    });
  }
  var api = C.client(request, window.DOMParser);
  function node(tag, className, value) { var el = document.createElement(tag); if (className) el.className = className; if (value) el.textContent = value; return el; }
  function clearContent() { while ($('content').firstChild) $('content').removeChild($('content').firstChild); }
  function button(label, action, className) { var el = node('button', className, label); el.addEventListener('click', action); return el; }
  function showSetup() {
    if (familyUI && familyUI.isKids()) { status('A parent can check the connection.'); return; }
    startup.stop(); $('setup').classList.remove('hidden'); $('server-url').value = connection; $('server-url').focus();
  }
  function hideSetup() { $('setup').classList.add('hidden'); $('settings').focus(); if (!server && connection) connect(connection); }
  function waitingMessage(value) {
    var el = $('startup-message');
    if (!el) {
      clearContent(); var hero = node('section', 'hero'); hero.appendChild(node('h1', '', 'Getting your films ready…'));
      el = node('p'); el.id = 'startup-message'; hero.appendChild(el); $('content').appendChild(hero);
    }
    el.textContent = value; status(value);
  }
  var startup = window.KidsStartup.recovery({
    load: async function (url) {
      // Each probe owns its client. A stale connection must never replace the
      // active renderer URLs, home folder or cache after a settings change.
      var candidate = C.client(function (endpoint, options) { options.timeout = options.method ? 20000 : 5000; return request(endpoint, options); }, window.DOMParser);
      candidate.setNames(sourceNames, namesServer, rejectedArtwork);
      var info;
      try { info = await candidate.connect(url); }
      catch (err) { if (err.retryable === undefined) err.retryable = false; throw err; }
      // Health probes never follow an old adult Home before the gate opens.
      // The family UI resolves its explicit role path after connecting.
      var home = familyUI ? { id: '0', title: 'Your library' } : defaultHome || { id: '0', title: 'Your library' };
      if (!familyUI) try { home = JSON.parse(localStorage.getItem('kids-tv-home:' + info.description) || JSON.stringify(home)); } catch (e) {}
      var items;
      try { items = await candidate.browse(home.id); }
      catch (err) {
        err.serverReachable = true;
        if (!/701|No Such Object/i.test(err.message) || home.id === '0') { if (err.retryable === undefined) err.retryable = false; throw err; }
        home = { id: '0', title: 'Your library' }; items = await candidate.browse('0');
      }
      return { api: candidate, server: info, home: home, items: items, empty: items.length === 0 };
    },
    wake: function (url, isCurrent) {
      // A different manually selected server must not wake the private default PC.
      if (wakeSettings && url === wakeSettings.server) return window.KidsStartup.wakeRouter(request, window.DOMParser, wakeSettings.config, isCurrent);
    },
    state: function (value) {
      $('search').disabled = value.phase !== 'ready';
      if (value.phase === 'ready' || value.phase === 'error') return;
      waitingMessage(value.phase === 'loading' ? 'The library is starting. We will refresh it for you.' : value.wakeError ? 'Still waiting for the media PC. A grown-up can also wake it using the phone app.' : 'Waiting for the media PC. Your films will appear automatically.');
    },
    ready: function (value) {
      api = value.api; server = value.server; connection = server.description; homeFolder = value.home; cache = {}; history = []; chosenArtwork = Object.create(null);
      cache[homeFolder.id] = Promise.resolve(value.items);
      try { localStorage.setItem('kids-tv-server', connection); } catch (e) {}
      $('server-name').textContent = server.name; $('setup').classList.add('hidden');
      if (familyUI) familyUI.ready(connection); else openFolder(homeFolder, false);
    },
    error: function (err) { $('connection-error').textContent = err.message; status('Connection settings need checking'); showSetup(); }
  });
  function connect(url) {
    try {
      url = C.httpUrl(url); connection = url; viewToken++; server = null;
      $('connection-error').textContent = ''; $('setup').classList.add('hidden'); cache = {};
      if (!document.hidden) startup.start(url); else startup.stop();
    } catch (err) { $('connection-error').textContent = err.message; showSetup(); }
  }
  function browse(id) { if (!cache[id]) cache[id] = api.browse(id).catch(function (e) { delete cache[id]; throw e; }); return cache[id]; }
  function key(item) { return C.progressKey(connection, item); }
  function migrateProgress(items, audience) {
    if (connection !== namesServer) return;
    var changed = false;
    Object.keys(stored).forEach(function (oldKey) {
      var record = stored[oldKey]; if (!record || record.server !== connection || !record.item) return;
      var aliases = titleAliases.filter(function (alias) { return alias.oldTitle === record.item.title && String(alias.oldParentId).split('#')[0] === String(record.item.parentId).split('#')[0]; });
      var matches = items.filter(function (item) { return !item.folder && aliases.some(function (alias) { return alias.newTitle === item.title; }); });
      if (matches.length !== 1) return; // Never guess between cuts/duplicate editions.
      var item = matches[0], newKey = key(item);
      if (!stored[newKey] || stored[newKey].updated <= record.updated) stored[newKey] = Object.assign({}, record, { item: item, audience: audience });
      if (newKey !== oldKey) delete stored[oldKey]; changed = true;
    });
    if (changed) persist();
  }
  function tile(item, onSelect) {
    if (Object.prototype.hasOwnProperty.call(chosenArtwork, item.id)) item = Object.assign({}, item, { artwork: chosenArtwork[item.id] });
    var el = button('', onSelect || function () { select(item); }, 'tile'), art = node('div', 'tile-art');
    var fallback = node('span', 'fallback', item.folder ? 'COLLECTION' : 'PLAY'); art.appendChild(fallback);
    if (item.artwork) {
      var img = new Image(); img.alt = ''; img.loading = 'lazy'; img.src = item.artwork;
      img.onload = function () { fallback.classList.add('hidden'); }; img.onerror = function () { img.remove(); };
      art.appendChild(img);
    }
    var record = stored[key(item)];
    if (record && (record.watched || record.position > 10)) art.appendChild(node('span', 'badge', record.watched ? 'WATCHED' : 'RESUME'));
    el.appendChild(art); el.appendChild(node('span', 'tile-label', item.folder ? C.collectionTitle(item.title) : C.cleanTitle(item.title)));
    el.appendChild(node('small', '', item.folder ? 'Explore collection' : (record && record.position > 10 && !record.watched ? Math.floor(record.position / 60) + ' min watched' : 'Press OK to watch')));
    el.title = item.title; return el;
  }
  function shelf(title, items, more) {
    if (!items.length) return;
    var section = node('section'), heading = node('div', 'row-heading'); heading.appendChild(node('h2', '', title));
    if (more) heading.appendChild(button('View all ›', more)); section.appendChild(heading);
    var row = node('div', 'shelf'); items.forEach(function (item) { row.appendChild(tile(item)); }); section.appendChild(row); $('content').appendChild(section);
  }
  async function openFolder(folder, remember) {
    var token = ++viewToken;
    if (remember) history.push(current); current = { id: folder.id, title: folder.title };
    clearContent(); status('Loading library…');
    var hero = node('section', 'hero'); hero.appendChild(node('div', 'eyebrow', 'YOUR FAVOURITES. YOUR LITTLE CINEMA.'));
    hero.appendChild(node('h1', '', C.collectionTitle(folder.title))); hero.appendChild(node('p', '', 'Pick something good. Settle in together.'));
    if (folder.id !== homeFolder.id) hero.appendChild(button('Use this collection as Home', function () {
      homeFolder = current;
      try { localStorage.setItem('kids-tv-parent-home:' + connection, JSON.stringify(homeFolder)); } catch (e) { status('The TV could not save Home.'); return; }
      history = []; status('Home collection saved');
    }));
    $('content').appendChild(hero);
    try {
      var items = await browse(folder.id); if (token !== viewToken) return;
      migrateProgress(items, 'adults');
      var videos = items.filter(function (i) { return !i.folder && !i.artworkOnly; }), folders = items.filter(function (i) { return i.folder; });
      var continueItems = Object.keys(stored).map(function (k) { return stored[k]; }).filter(function (s) { return s.server === connection && s.audience === 'adults' && s.position > 10 && !s.watched; }).sort(function (a, b) { return b.updated - a.updated; }).slice(0, 12).map(function (s) { return s.item; });
      if (folder.id === homeFolder.id) shelf('Continue watching', continueItems);
      shelf('Ready to watch', videos); shelf('Collections', folders);
      if (!items.length) $('content').appendChild(node('p', 'empty', 'Nothing here yet. Try another collection.'));
      status(items.length + ' titles and collections');
      var first = $('content').querySelector('button'); if (first) first.focus(); else $('home').focus();
      // At most six direct collections, sequentially. This is browse-on-demand,
      // not a recursive media scan or metadata extraction job.
      for (var i = 0; i < Math.min(folders.length, 6); i++) {
        var child = folders[i], preview;
        try { preview = await browse(child.id); }
        catch (err) { if (token === viewToken) status('A collection preview is unavailable. You can still open other collections.'); break; }
        if (token !== viewToken) return;
        var entries = preview.filter(function (item) { return !item.folder && !item.artworkOnly; }).slice(0, 16);
        if (entries.length) (function (f) { shelf(C.collectionTitle(f.title), entries, function () { openFolder(f, true); }); }(child));
      }
    } catch (err) { if (token === viewToken) { if (!document.hidden && !activeItem && err.retryable === true) connect(connection); else { status(err.message); $('home').focus(); } } }
  }
  function select(item) { if (item.artworkOnly) return; if (item.folder) openFolder(item, true); else play(item); }
  function showHud() { $('player-hud').classList.remove('hidden'); clearTimeout(hudTimer); hudTimer = setTimeout(function () { if (activeItem && !$('player-message').textContent) $('player-hud').classList.add('hidden'); }, 6500); }
  function saveProgress(position, duration, ended) {
    if (!activeItem) return;
    var value = C.progress(position, duration); if (ended) value.watched = true;
    value.item = activeItem; value.server = connection; value.audience = familyUI && familyUI.isKids() ? 'kids' : 'adults'; value.updated = Date.now(); stored[key(activeItem)] = value; persist();
  }
  var player = window.createKidsPlayer(window.webapis && window.webapis.avplay, $('browser-player'), {
    time: function (position, duration) {
      lastPosition = position; lastDuration = duration;
      $('play-progress').style.width = (duration > 0 ? Math.min(100, position / duration * 100) : 0) + '%';
      if (Date.now() - lastSave > 5000) { saveProgress(position, duration, false); lastSave = Date.now(); }
    },
    message: function (value) { $('player-message').textContent = value; if (value) showHud(); },
    error: function (message) { $('player-message').textContent = message; showHud(); $('stop').focus(); },
    ended: function () {
      if (!activeItem) return;
      saveProgress(lastDuration || lastPosition, lastDuration, true);
      if (playQueue.length > 1) { playQueue.shift(); play(playQueue[0], true); }
      else { playQueue = []; stop(true); }
    }
  });
  async function play(item, queued) {
    if (!item || item.artworkOnly) return;
    if (!queued) playQueue = [];
    var token = ++viewToken;
    status('Opening film…');
    try {
      // Refresh URLs for continue-watching entries, whose renderer/ID may have
      // changed after a UMS restart. Never replay an old URL from local storage.
      var latest = await api.browse(item.parentId || current.id);
      if (token !== viewToken) return;
      item = latest.filter(function (i) { return !i.folder && i.title === item.title; })[0];
      if (!item) throw new Error('That title moved or is no longer available. Reopen its collection.');
      var record = stored[key(item)], resume = record && !record.watched ? record.position : 0;
      activeItem = item; lastSave = 0; lastPosition = resume || 0; lastDuration = record ? record.duration : 0;
      $('playing-title').textContent = C.cleanTitle(item.title); $('player-message').textContent = 'Opening…';
      $('shell').classList.add('hidden'); document.body.classList.add('playing'); $('playback').classList.remove('hidden');
      $('browser-player').style.display = window.webapis && window.webapis.avplay ? 'none' : 'block';
      showHud(); $('pause').focus(); player.open(item.url, resume); status('');
    } catch (err) { playQueue = []; if (activeItem) stop(); status(err.message); }
  }
  function stop(completed) {
    playQueue = [];
    if (activeItem && !completed) saveProgress(lastPosition, lastDuration, false);
    player.stop(); activeItem = null; clearTimeout(hudTimer); $('playback').classList.add('hidden');
    document.body.classList.remove('playing'); $('shell').classList.remove('hidden');
    if (!document.hidden && !(familyUI && familyUI.restore())) openFolder(current, false);
  }
  function back() {
    viewToken++;
    if (activeItem) stop();
    else if (familyUI && familyUI.back()) return;
    else if (!$('setup').classList.contains('hidden')) hideSetup();
    else if (!$('search-panel').classList.contains('hidden')) { $('search-panel').classList.add('hidden'); $('search').focus(); }
    else if (!(familyUI && familyUI.isKids()) && history.length) openFolder(history.pop(), false);
    else if (window.tizen && window.confirm('Exit ' + document.title + '?')) window.tizen.application.getCurrentApplication().exit();
  }
  function moveFocus(direction) {
    var focused = document.activeElement, rect = focused.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    var area = activeItem ? $('playback') : familyUI && familyUI.overlay() ? familyUI.overlay() : !$('setup').classList.contains('hidden') ? $('setup') : !$('search-panel').classList.contains('hidden') ? $('search-panel') : $('shell');
    var best, score = Infinity;
    Array.prototype.forEach.call(area.querySelectorAll('button,input'), function (el) {
      if (el === focused || el.disabled || !el.getClientRects().length) return;
      var r = el.getBoundingClientRect(), dx = r.left + r.width / 2 - x, dy = r.top + r.height / 2 - y;
      var primary = direction === 'left' ? -dx : direction === 'right' ? dx : direction === 'up' ? -dy : dy;
      var secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      if (primary > 10 && primary + secondary * 4 < score) { best = el; score = primary + secondary * 4; }
    });
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  async function search() {
    var query = $('query').value.trim(); if (!query) return;
    $('search-panel').classList.add('hidden'); var token = ++viewToken; status('Searching UMS…');
    try {
      var items = await api.search(homeFolder.id, query); if (token !== viewToken) return;
      history.push(current); clearContent(); var hero = node('section', 'hero'); hero.appendChild(node('h1', '', 'Results for “' + query + '”')); $('content').appendChild(hero);
      shelf('Found in your library', items);
      if (!items.length) $('content').appendChild(node('p', 'empty', 'No matches in this library. Try a shorter title.'));
      status(items.length + ' results'); var first = $('content').querySelector('button'); (first || $('search')).focus();
    } catch (err) { status('Search unavailable: ' + err.message + ' You can still browse collections.'); $('search').focus(); }
  }
  $('home').onclick = function () { if (startup.isWaiting() || !server) return; history = []; cache = {}; openFolder(homeFolder, false); };
  $('settings').onclick = function () { familyUI.settings(); }; $('connect').onclick = function () { connect($('server-url').value.trim()); };
  $('cancel-setup').onclick = hideSetup; $('search').onclick = function () { $('search-panel').classList.remove('hidden'); $('query').focus(); };
  $('do-search').onclick = search; $('cancel-search').onclick = back;
  $('pause').onclick = function () { player.toggle(); showHud(); }; $('rewind').onclick = function () { player.seek(-30); showHud(); };
  $('forward').onclick = function () { player.seek(30); showHud(); }; $('stop').onclick = stop;
  // Each modal owns focus and scrolling. Observe visibility changes centrally
  // so setup/search/code/settings cannot leave a stale backdrop on close.
  var overlayIds = ['parent-panel', 'pin-panel', 'artwork-panel', 'setup', 'search-panel'];
  function syncOverlay() {
    var open = overlayIds.some(function (id) { return !$(id).classList.contains('hidden'); });
    document.body.classList.toggle('modal-open', open);
    // A close handler cannot focus the hidden shell until the backdrop state
    // has been removed. Restore focus after that state transition, not before.
    if (!open && !document.activeElement.getClientRects().length) (familyUI && familyUI.isKids() ? $('wall-focus') : $('settings')).focus();
  }
  var overlayObserver = new MutationObserver(syncOverlay);
  overlayIds.forEach(function (id) { overlayObserver.observe($(id), { attributes: true, attributeFilter: ['class'] }); });
  syncOverlay();
  document.addEventListener('keydown', function (event) {
    var code = event.keyCode;
    if (familyUI && familyUI.key(event)) return;
    if (code === 10009 || code === 27 || (code === 8 && document.activeElement.tagName !== 'INPUT')) { event.preventDefault(); back(); return; }
    if (document.activeElement.tagName === 'INPUT') {
      if (code === 13 || code === 65376) {
        event.preventDefault();
        if (document.activeElement.id === 'query') search();
        else if (document.activeElement.id === 'server-url') connect($('server-url').value.trim());
        else if (document.activeElement.id === 'old-code') $('new-code').focus();
        else if (document.activeElement.id === 'new-code') $('confirm-code').focus();
        else if (document.activeElement.id === 'confirm-code') $('save-code').focus();
        else moveFocus('right');
      }
      else if (code === 40) { event.preventDefault(); moveFocus('down'); }
      return;
    }
    if (activeItem) {
      if (code === 13 || code === 10252 || code === 415 || code === 19 || code === 32) { event.preventDefault(); player.toggle(); showHud(); }
      else if (code === 37 || code === 412) { event.preventDefault(); player.seek(-30); showHud(); }
      else if (code === 39 || code === 417) { event.preventDefault(); player.seek(30); showHud(); }
      else if (code === 413) stop(); else showHud(); return;
    }
    if (code >= 37 && code <= 40) { event.preventDefault(); moveFocus({ 37: 'left', 38: 'up', 39: 'right', 40: 'down' }[code]); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { startup.stop(); viewToken++; if (activeItem) stop(); if (familyUI) familyUI.lock(); }
    else if (connection && $('setup').classList.contains('hidden')) connect(connection);
  });
  window.addEventListener('pagehide', function () { startup.stop(); if (familyUI) familyUI.lock(); });
  familyUI = window.createFamilyUI({
    status: status, browse: browse, refresh: function () { cache = {}; }, migrate: function (items) { migrateProgress(items, 'kids'); }, connected: function () { return !!server && !startup.isWaiting(); }, playing: function () { return !!activeItem; },
    artwork: function (items) { chosenArtwork = Object.create(null); items.forEach(function (item) { if (item.artworkSource || item.sourceId) chosenArtwork[item.id] = item.artwork; }); },
    setup: showSetup, play: play,
    queue: function (items) { playQueue = items.slice(); play(playQueue[0], true); },
    parentHome: function (folder) { homeFolder = folder; history = []; openFolder(homeFolder, false); }
  });
  if (window.tizen && window.tizen.tvinputdevice) ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop', 'MediaFastForward', 'MediaRewind'].forEach(function (name) { try { window.tizen.tvinputdevice.registerKey(name); } catch (e) {} });
  request('connection.json', {}).then(function (text) {
    var config = JSON.parse(text); defaultHome = config.homeFolder; familyUI.start(config);
    sourceNames = config.sourceNames || {}; titleAliases = config.titleAliases || []; rejectedArtwork = config.rejectedArtwork || []; namesServer = config.descriptionUrl ? C.httpUrl(config.descriptionUrl) : '';
    if (config.wake && config.descriptionUrl) wakeSettings = { server: C.httpUrl(config.descriptionUrl), config: config.wake };
    if (config.displayName) { document.title = config.displayName; $('brand-name').textContent = config.displayName; }
    if (connection || config.descriptionUrl) connect(connection || config.descriptionUrl); else showSetup();
  }).catch(function () { if (connection) connect(connection); else showSetup(); });
}());
