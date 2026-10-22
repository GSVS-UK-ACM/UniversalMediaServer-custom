/* Fixed-centre artwork wall and device-local parental entry. */
(function () {
  'use strict';
  window.createFamilyUI = function (hooks) {
    var C = window.KidsCore, F = window.KidsFamily, $ = function (id) { return document.getElementById(id); };
    var parents = false, config = {}, connection = '', model, catalogue = [], roots = {}, generation = 0;
    var dwellTimer, motionTimer, pendingDirection = '', moving = false, codeGate, record, recordError = '', pinPurpose = 'setup', inputGeneration = 0;
    var dimensions = { columns: 7, rows: 5 }, storage = window.localStorage;
    try { dimensions = JSON.parse(storage.getItem('kids-tv-density') || JSON.stringify(dimensions)); dimensions = F.density(dimensions.columns, dimensions.rows); } catch (e) { dimensions = { columns: 7, rows: 5 }; }
    // A corrupt saved credential is NOT equivalent to first launch. Never
    // silently restore the public bootstrap code over existing parental state.
    try {
      var raw = storage.getItem('kids-tv-parent-code'); record = raw === null ? null : JSON.parse(raw);
      if (raw !== null && !F.codeRecord(record)) throw new Error('Saved parental code is invalid.');
    } catch (e) { recordError = 'Parental code storage needs recovery. Do not clear TV storage or uninstall.'; }
    function message(value) { hooks.status(value); }
    function hideDetails() { clearTimeout(dwellTimer); $('tile-details').classList.add('hidden'); }
    function refreshGate() {
      codeGate = F.gate(record ? record.length : 5, function (value) {
        if (recordError) throw new Error(recordError);
        return F.checkCode(value, record, window.crypto);
      });
    }
    refreshGate();
    function classes() {
      document.body.classList.toggle('kids-mode', !parents);
      $('kids-view').classList.toggle('hidden', parents);
      $('content').classList.toggle('hidden', !parents);
    }
    function element(tag, cls, text) { var value = document.createElement(tag); value.className = cls || ''; if (text) value.textContent = text; return value; }
    function cancelMotion() { clearTimeout(motionTimer); moving = false; pendingDirection = ''; $('wall-layer').style.transition = 'none'; $('wall-layer').style.transform = 'translate(0,0)'; }
    function details() {
      if (!model || parents || document.hidden || hooks.playing() || !$('pin-panel').classList.contains('hidden')) return;
      var selected = model.selected(); if (!selected) return;
      $('detail-title').textContent = C.cleanTitle(selected.title);
      $('detail-meta').textContent = F.label(selected);
      $('detail-description').textContent = selected.description ? selected.description.slice(0, 420) : selected.items ? selected.items.length + ' videos. Press OK to watch.' : 'Press OK to watch.';
      $('tile-details').classList.remove('hidden');
    }
    function render() {
      hideDetails();
      var layer = $('wall-layer'); while (layer.firstChild) layer.removeChild(layer.firstChild);
      if (!model || !model.order.length) { $('wall-caption').textContent = 'Your films will appear here.'; return; }
      layer.style.transition = 'none'; layer.style.transform = 'translate(0,0)';
      model.cells(1).forEach(function (cell) {
        if (!cell.item) return;
        var tile = element('div', 'wall-tile' + (cell.centre ? ' wall-selected' : ''));
        tile.style.left = (cell.x * 100 / dimensions.columns) + '%'; tile.style.top = (cell.y * 100 / dimensions.rows) + '%';
        tile.style.width = (100 / dimensions.columns) + '%'; tile.style.height = (100 / dimensions.rows) + '%';
        var art = element('div', 'wall-art'), fallback = element('span', 'wall-fallback', C.cleanTitle(cell.item.title));
        art.appendChild(fallback);
        if (cell.item.artwork) {
          var img = new Image(); img.alt = ''; img.onload = function () { fallback.classList.add('hidden'); };
          img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };
          img.src = cell.item.artwork; art.appendChild(img);
        }
        tile.appendChild(art); layer.appendChild(tile);
      });
      var focus = $('wall-focus');
      focus.style.width = (100 / dimensions.columns) + '%'; focus.style.height = (100 / dimensions.rows) + '%';
      focus.style.left = ((dimensions.columns - 1) * 50 / dimensions.columns) + '%'; focus.style.top = ((dimensions.rows - 1) * 50 / dimensions.rows) + '%';
      focus.setAttribute('aria-label', F.label(model.selected())); focus.setAttribute('data-selected', model.selected().id);
      $('wall-caption').textContent = F.label(model.selected());
      dwellTimer = setTimeout(details, 1000);
      if (!parents && !hooks.playing() && $('pin-panel').classList.contains('hidden')) focus.focus();
    }
    function move(direction) {
      hideDetails(); if (!model || !model.order.length) return;
      if (moving) { pendingDirection = direction; return; }
      moving = true;
      var rect = $('wall-viewport').getBoundingClientRect(), dx = direction === 'left' ? 1 : direction === 'right' ? -1 : 0, dy = direction === 'up' ? 1 : direction === 'down' ? -1 : 0;
      $('wall-layer').style.transition = 'transform 150ms ease-out';
      $('wall-layer').style.transform = 'translate(' + dx * rect.width / dimensions.columns + 'px,' + dy * rect.height / dimensions.rows + 'px)';
      motionTimer = setTimeout(function () {
        model.move(direction); moving = false; render();
        if (pendingDirection) { var next = pendingDirection; pendingDirection = ''; move(next); }
      }, 155);
    }
    async function resolvePath(path) {
      if (!Array.isArray(path) || !path.length || path.length > 8) throw new Error('A parent needs to select the library roots.');
      var folder = { id: '0', title: 'Your library' };
      for (var i = 0; i < path.length; i++) {
        var items = await hooks.browse(folder.id);
        var matches = items.filter(function (item) { return item.folder && item.title.toLowerCase() === String(path[i]).toLowerCase(); });
        if (matches.length !== 1) throw new Error('The ' + path[i] + ' collection was not found uniquely. A parent can check library settings.');
        folder = matches[0];
      }
      return folder;
    }
    async function loadKids() {
      var token = ++generation; hideDetails(); cancelMotion(); classes();
      if (model && model.order.length) render(); else message('Getting your films ready…');
      try {
        var root = await resolvePath((config.libraryPaths || {}).kids);
        if (token !== generation || parents || document.hidden) return;
        roots.kids = root;
        var entries = await F.catalogue(hooks.browse, root, { isCurrent: function () { return token === generation && !parents && !document.hidden; } });
        if (token !== generation || parents || document.hidden) return;
        if (hooks.migrate) hooks.migrate(entries.reduce(function (all, item) { return all.concat(item.items || [item]); }, []));
        catalogue = entries; model = F.wall(catalogue, dimensions.columns, dimensions.rows); render();
        message(entries.length ? '' : 'No films are ready here yet. A parent can check the library.');
      } catch (error) { if (token === generation && !parents && !document.hidden) { message(error.message); $('wall-focus').focus(); } }
    }
    async function openParents() {
      var token = ++generation; inputGeneration++; hideDetails(); cancelMotion(); parents = true; classes();
      $('pin-panel').classList.add('hidden');
      if (!hooks.connected()) { hooks.setup(); return; }
      try {
        var adultRoot = await resolvePath((config.libraryPaths || {}).adults);
        if (token !== generation || !parents || document.hidden) return;
        roots.adults = adultRoot;
        // Role labels are independent of physical folder names. An owner may
        // defer a locked-folder rename without losing the adult UI boundary.
        roots.adults = Object.assign({}, roots.adults, { title: 'Adults' });
        if (!parents || document.hidden) return;
        var home = roots.adults;
        try { home = JSON.parse(storage.getItem('kids-tv-parent-home:' + connection) || JSON.stringify(home)); } catch (e) {}
        hooks.parentHome(home, roots.adults);
      } catch (error) { message(error.message); hooks.setup(); }
    }
    function pinForm(purpose) {
      pinPurpose = purpose; hideDetails(); codeGate.reset();
      $('pin-heading').textContent = purpose === 'setup' ? 'Choose your parental code' : 'Change parental code';
      $('old-code-row').classList.toggle('hidden', purpose === 'setup');
      ['old-code', 'new-code', 'confirm-code'].forEach(function (id) { $(id).value = ''; });
      $('pin-error').textContent = ''; $('pin-panel').classList.remove('hidden');
      $(purpose === 'setup' ? 'new-code' : 'old-code').focus();
    }
    async function saveCode() {
      var token = inputGeneration; $('save-code').disabled = true;
      try {
        if (pinPurpose === 'change' && !await F.checkCode($('old-code').value, record, window.crypto)) throw new Error('The current code is not correct.');
        var next = await F.newCode($('new-code').value, $('confirm-code').value, window.crypto);
        if (token !== inputGeneration || document.hidden || $('pin-panel').classList.contains('hidden')) return;
        // Commit before granting access. Storage-full failures must not leave
        // an apparently configured app that actually still accepts bootstrap.
        storage.setItem('kids-tv-parent-code', JSON.stringify(next));
        if (storage.getItem('kids-tv-parent-code') !== JSON.stringify(next)) throw new Error('The new code could not be saved.');
        record = next; recordError = ''; refreshGate();
        ['old-code', 'new-code', 'confirm-code'].forEach(function (id) { $(id).value = ''; });
        $('pin-panel').classList.add('hidden');
        if (pinPurpose === 'setup') await openParents(); else { $('parent-panel').classList.remove('hidden'); $('change-code').focus(); }
      } catch (error) { if (token === inputGeneration) $('pin-error').textContent = error.message; }
      finally { $('save-code').disabled = false; }
    }
    function settings() {
      if (!parents) return;
      $('density-columns').value = dimensions.columns; $('density-rows').value = dimensions.rows;
      $('parent-error').textContent = ''; $('parent-panel').classList.remove('hidden'); $('reset-home').focus();
    }
    function returnKids(reload) {
      generation++; inputGeneration++; parents = false; codeGate.reset(); hideDetails(); cancelMotion();
      ['parent-panel', 'pin-panel', 'setup', 'search-panel'].forEach(function (id) { $(id).classList.add('hidden'); });
      ['old-code', 'new-code', 'confirm-code'].forEach(function (id) { $(id).value = ''; });
      classes(); if (model) render();
      if (reload && hooks.connected() && !document.hidden) loadKids();
    }
    function playSelected() {
      hideDetails(); if (moving || !model) return;
      var item = model.selected(); if (!item) return;
      if (!item.items) { hooks.play(item); return; }
      var queueKey = 'kids-tv-collection-start:' + connection + '|' + item.id, start = 0;
      try { start = Number(storage.getItem(queueKey)) || 0; } catch (e) {}
      var result = F.queue(item.items, item.kind, start);
      try { storage.setItem(queueKey, String(result.nextStart)); } catch (e) { message('The TV could not save the next episode start.'); }
      if (result.items.length) hooks.queue(result.items);
    }
    function overlayBack() {
      if (!$('pin-panel').classList.contains('hidden')) {
        inputGeneration++; $('pin-panel').classList.add('hidden');
        ['old-code', 'new-code', 'confirm-code'].forEach(function (id) { $(id).value = ''; });
        if (parents) settings(); else if (model) render();
        return true;
      }
      if (!$('parent-panel').classList.contains('hidden')) { $('parent-panel').classList.add('hidden'); $('settings').focus(); return true; }
      return false;
    }
    async function digit(event) {
      var key = /^[0-9]$/.test(event.key || '') ? event.key : event.keyCode >= 48 && event.keyCode <= 57 ? String(event.keyCode - 48) : event.keyCode >= 96 && event.keyCode <= 105 ? String(event.keyCode - 96) : '';
      if (!key || parents || hooks.playing() || !$('pin-panel').classList.contains('hidden')) return false;
      event.preventDefault(); if (event.repeat) return true;
      var token = inputGeneration;
      try {
        if (await codeGate.digit(key)) {
          if (token !== inputGeneration || parents || document.hidden || hooks.playing()) return true;
          if (!record) pinForm('setup'); else await openParents();
        }
      } catch (error) { message(error.message); }
      return true;
    }
    $('wall-focus').onclick = playSelected;
    $('save-code').onclick = saveCode;
    $('cancel-code').onclick = overlayBack;
    $('change-code').onclick = function () { $('parent-panel').classList.add('hidden'); pinForm('change'); };
    $('parent-close').onclick = overlayBack;
    $('parent-connection').onclick = function () { $('parent-panel').classList.add('hidden'); hooks.setup(); };
    $('back-to-kids').onclick = function () { returnKids(true); };
    $('reset-home').onclick = function () {
      try { storage.removeItem('kids-tv-parent-home:' + connection); storage.removeItem('kids-tv-home:' + connection); }
      catch (e) { $('parent-error').textContent = 'Home could not be reset in TV storage.'; return; }
      $('parent-panel').classList.add('hidden'); if (roots.adults) hooks.parentHome(roots.adults, roots.adults);
    };
    $('save-density').onclick = function () {
      try {
        var next = F.density($('density-columns').value, $('density-rows').value);
        storage.setItem('kids-tv-density', JSON.stringify(next)); dimensions = next;
        if (model) model = F.wall(model.order, dimensions.columns, dimensions.rows, true);
        $('parent-error').textContent = 'Tile size saved. Return to kids to try it.';
      } catch (e) { $('parent-error').textContent = e.message; }
    };
    classes();
    return {
      isKids: function () { return !parents; },
      start: function (value) { config = value || {}; },
      ready: function (url) { connection = url; if (parents) openParents(); else loadKids(); },
      settings: settings,
      overlay: function () { return !$('pin-panel').classList.contains('hidden') ? $('pin-panel') : !$('parent-panel').classList.contains('hidden') ? $('parent-panel') : null; },
      back: overlayBack,
      restore: function () { if (!parents) { render(); return true; } return false; },
      lock: function () { returnKids(false); },
      key: function (event) {
        var code = event.keyCode, numeric = /^[0-9]$/.test(event.key || '') || code >= 48 && code <= 57 || code >= 96 && code <= 105;
        if (numeric && !parents && !hooks.playing() && $('pin-panel').classList.contains('hidden')) { digit(event); return true; }
        codeGate.reset();
        if (!parents && !hooks.playing() && $('pin-panel').classList.contains('hidden')) inputGeneration++;
        if (parents || hooks.playing() || !$('pin-panel').classList.contains('hidden')) return false;
        if (code >= 37 && code <= 40) { event.preventDefault(); move({ 37: 'left', 38: 'up', 39: 'right', 40: 'down' }[code]); return true; }
        if (code === 13 || code === 65376) { event.preventDefault(); playSelected(); return true; }
        return false;
      }
    };
  };
}());
