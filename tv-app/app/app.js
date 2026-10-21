(function () {
  'use strict';
  var C = window.KidsCore, $ = function (id) { return document.getElementById(id); };
  var server, current = { id: '0', title: 'Your library' }, history = [], cache = {}, viewToken = 0, activeItem = null, lastSave = 0, hudTimer;
  var stored = {}, connection = '', homeFolder = { id: '0', title: 'Your library' }, defaultHome, lastPosition = 0, lastDuration = 0;
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
      var xhr = new XMLHttpRequest(); xhr.open(options.method || 'GET', url); xhr.timeout = 20000;
      Object.keys(options.headers || {}).forEach(function (key) { xhr.setRequestHeader(key, options.headers[key]); });
      xhr.onload = function () { if ((xhr.status >= 200 && xhr.status < 300) || (url === 'connection.json' && xhr.status === 0 && xhr.responseText)) resolve(xhr.responseText); else reject(new Error('UMS returned HTTP ' + xhr.status)); };
      xhr.onerror = function () { reject(new Error('Cannot reach UMS. Check the PC is awake and on the same network.')); };
      xhr.ontimeout = function () { reject(new Error('UMS took too long to reply. Please retry.')); };
      xhr.send(options.body || null);
    });
  }
  var api = C.client(request, window.DOMParser);
  function node(tag, className, value) { var el = document.createElement(tag); if (className) el.className = className; if (value) el.textContent = value; return el; }
  function clearContent() { while ($('content').firstChild) $('content').removeChild($('content').firstChild); }
  function button(label, action, className) { var el = node('button', className, label); el.addEventListener('click', action); return el; }
  function showSetup() { $('setup').classList.remove('hidden'); $('server-url').value = connection; $('server-url').focus(); }
  function hideSetup() { $('setup').classList.add('hidden'); $('settings').focus(); }
  async function connect(url) {
    $('connect').disabled = true; $('connection-error').textContent = ''; status('Connecting…');
    try {
      server = await api.connect(url); connection = server.description; cache = {}; history = [];
      try { localStorage.setItem('kids-tv-server', connection); homeFolder = JSON.parse(localStorage.getItem('kids-tv-home:' + connection) || JSON.stringify(defaultHome || { id: '0', title: 'Your library' })); } catch (e) {}
      $('server-name').textContent = server.name; $('setup').classList.add('hidden');
      await openFolder(homeFolder, false);
    } catch (err) { $('connection-error').textContent = err.message; status('Connection needed'); showSetup(); }
    finally { $('connect').disabled = false; }
  }
  function browse(id) { if (!cache[id]) cache[id] = api.browse(id).catch(function (e) { delete cache[id]; throw e; }); return cache[id]; }
  function key(item) { return C.progressKey(connection, item); }
  function tile(item, onSelect) {
    var el = button('', onSelect || function () { select(item); }, 'tile'), art = node('div', 'tile-art');
    var fallback = node('span', 'fallback', item.folder ? 'COLLECTION' : 'PLAY'); art.appendChild(fallback);
    if (item.artwork) {
      var img = new Image(); img.alt = ''; img.loading = 'lazy'; img.src = item.artwork;
      img.onload = function () { fallback.classList.add('hidden'); }; img.onerror = function () { img.remove(); };
      art.appendChild(img);
    }
    var record = stored[key(item)];
    if (record && (record.watched || record.position > 10)) art.appendChild(node('span', 'badge', record.watched ? 'WATCHED' : 'RESUME'));
    el.appendChild(art); el.appendChild(node('span', 'tile-label', C.cleanTitle(item.title)));
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
    hero.appendChild(node('h1', '', C.cleanTitle(folder.title))); hero.appendChild(node('p', '', 'Pick something good. Settle in together.'));
    if (folder.id !== homeFolder.id) hero.appendChild(button('Use this collection as Home', function () {
      homeFolder = current;
      try { localStorage.setItem('kids-tv-home:' + connection, JSON.stringify(homeFolder)); } catch (e) {}
      history = []; status('Home collection saved');
    }));
    $('content').appendChild(hero);
    try {
      var items = await browse(folder.id); if (token !== viewToken) return;
      var videos = items.filter(function (i) { return !i.folder; }), folders = items.filter(function (i) { return i.folder; });
      var continueItems = Object.keys(stored).map(function (k) { return stored[k]; }).filter(function (s) { return s.server === connection && s.position > 10 && !s.watched; }).sort(function (a, b) { return b.updated - a.updated; }).slice(0, 12).map(function (s) { return s.item; });
      if (folder.id === homeFolder.id) shelf('Continue watching', continueItems);
      shelf('Ready to watch', videos); shelf('Collections', folders);
      if (!items.length) $('content').appendChild(node('p', 'empty', 'Nothing here yet. Try another collection.'));
      status(items.length + ' titles and collections');
      var first = $('content').querySelector('button'); if (first) first.focus(); else $('home').focus();
      // At most six direct collections, sequentially. This is browse-on-demand,
      // not a recursive media scan or metadata extraction job.
      for (var i = 0; i < Math.min(folders.length, 6); i++) {
        var child = folders[i], preview = await browse(child.id); if (token !== viewToken) return;
        var entries = preview.filter(function (item) { return !item.folder; }).slice(0, 16);
        if (entries.length) (function (f) { shelf(C.cleanTitle(f.title), entries, function () { openFolder(f, true); }); }(child));
      }
    } catch (err) { if (token === viewToken) { status(err.message); $('home').focus(); } }
  }
  function select(item) { if (item.folder) openFolder(item, true); else play(item); }
  function showHud() { $('player-hud').classList.remove('hidden'); clearTimeout(hudTimer); hudTimer = setTimeout(function () { if (activeItem && !$('player-message').textContent) $('player-hud').classList.add('hidden'); }, 6500); }
  function saveProgress(position, duration, ended) {
    if (!activeItem) return;
    var value = C.progress(position, duration); if (ended) value.watched = true;
    value.item = activeItem; value.server = connection; value.updated = Date.now(); stored[key(activeItem)] = value; persist();
  }
  var player = window.createKidsPlayer(window.webapis && window.webapis.avplay, $('browser-player'), {
    time: function (position, duration) {
      lastPosition = position; lastDuration = duration;
      $('play-progress').style.width = (duration > 0 ? Math.min(100, position / duration * 100) : 0) + '%';
      if (Date.now() - lastSave > 5000) { saveProgress(position, duration, false); lastSave = Date.now(); }
    },
    message: function (value) { $('player-message').textContent = value; if (value) showHud(); },
    error: function (message) { $('player-message').textContent = message; showHud(); $('stop').focus(); },
    ended: function () { if (activeItem) { saveProgress(lastDuration || lastPosition, lastDuration, true); stop(true); } }
  });
  async function play(item) {
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
    } catch (err) { status(err.message); }
  }
  function stop(completed) {
    if (activeItem && !completed) saveProgress(lastPosition, lastDuration, false);
    player.stop(); activeItem = null; clearTimeout(hudTimer); $('playback').classList.add('hidden');
    document.body.classList.remove('playing'); $('shell').classList.remove('hidden'); openFolder(current, false);
  }
  function back() {
    viewToken++;
    if (activeItem) stop();
    else if (!$('setup').classList.contains('hidden')) hideSetup();
    else if (!$('search-panel').classList.contains('hidden')) { $('search-panel').classList.add('hidden'); $('search').focus(); }
    else if (history.length) openFolder(history.pop(), false);
    else if (window.tizen && window.confirm('Exit ' + document.title + '?')) window.tizen.application.getCurrentApplication().exit();
  }
  function moveFocus(direction) {
    var focused = document.activeElement, rect = focused.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    var area = activeItem ? $('playback') : !$('setup').classList.contains('hidden') ? $('setup') : !$('search-panel').classList.contains('hidden') ? $('search-panel') : $('shell');
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
  $('home').onclick = function () { history = []; cache = {}; openFolder(homeFolder, false); };
  $('settings').onclick = showSetup; $('connect').onclick = function () { connect($('server-url').value.trim()); };
  $('cancel-setup').onclick = hideSetup; $('search').onclick = function () { $('search-panel').classList.remove('hidden'); $('query').focus(); };
  $('do-search').onclick = search; $('cancel-search').onclick = back;
  $('pause').onclick = function () { player.toggle(); showHud(); }; $('rewind').onclick = function () { player.seek(-30); showHud(); };
  $('forward').onclick = function () { player.seek(30); showHud(); }; $('stop').onclick = stop;
  document.addEventListener('keydown', function (event) {
    var code = event.keyCode;
    if (code === 10009 || code === 27 || (code === 8 && document.activeElement.tagName !== 'INPUT')) { event.preventDefault(); back(); return; }
    if (document.activeElement.tagName === 'INPUT') {
      if (code === 13 || code === 65376) { event.preventDefault(); if (document.activeElement.id === 'query') search(); else connect($('server-url').value.trim()); }
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
  document.addEventListener('visibilitychange', function () { if (document.hidden && activeItem) stop(); });
  if (window.tizen && window.tizen.tvinputdevice) ['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop', 'MediaFastForward', 'MediaRewind'].forEach(function (name) { try { window.tizen.tvinputdevice.registerKey(name); } catch (e) {} });
  request('connection.json', {}).then(function (text) {
    var config = JSON.parse(text); defaultHome = config.homeFolder;
    if (config.displayName) { document.title = config.displayName; $('brand-name').textContent = config.displayName; }
    if (connection || config.descriptionUrl) connect(connection || config.descriptionUrl); else showSetup();
  }).catch(function () { if (connection) connect(connection); else showSetup(); });
}());
