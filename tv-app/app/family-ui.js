/* Fixed-centre artwork wall and device-local parental entry. */
(function () {
  'use strict';
  window.createFamilyUI = function (hooks) {
    var C = window.KidsCore, F = window.KidsFamily, $ = function (id) { return document.getElementById(id); };
    var parents = false, config = {}, connection = '', model, catalogue = [], roots = {}, generation = 0;
    var dwellTimer, motionTimer, pendingDirection = '', moving = false, codeGate, record, recordError = '', pinPurpose = 'setup', inputGeneration = 0;
    var dimensions = { columns: 5, rows: 3 }, draftDimensions, authenticating = false, storage = window.localStorage;
    var artworkRevision = Date.now();
    try { dimensions = JSON.parse(storage.getItem('kids-tv-density') || JSON.stringify(dimensions)); dimensions = F.density(dimensions.columns, dimensions.rows); } catch (e) { dimensions = { columns: 5, rows: 3 }; }
    // A corrupt saved credential is NOT equivalent to first launch. Never
    // silently restore the public bootstrap code over existing parental state.
    try {
      var raw = storage.getItem('kids-tv-parent-code'); record = raw === null ? null : JSON.parse(raw);
      if (raw !== null && !F.codeRecord(record)) throw new Error('Saved parental code is invalid.');
    } catch (e) { recordError = 'Parental code storage needs recovery. Do not clear TV storage or uninstall.'; }
    function message(value) { hooks.status(value); }
    function hideDetails() { clearTimeout(dwellTimer); $('tile-details').classList.add('hidden'); }
    function refreshGate() {
      codeGate = F.gate(record ? record.length : 5, async function (value) {
        if (recordError) throw new Error(recordError);
        authenticating = true; message('Checking parental code…');
        try { var ok = await F.checkCode(value, record, window.crypto); message(ok ? '' : 'Code not recognised. Press an arrow, then try again.'); return ok; }
        finally { authenticating = false; }
      });
    }
    refreshGate();
    // Decode each explicit image once per refresh. A bounded failure shows a
    // diagnostic/text fallback, not a scraper image or an endless load spinner.
    function artworkValidator() {
      var pending = Object.create(null);
      return function (url) {
        if (!pending[url]) pending[url] = new Promise(function (resolve) {
          var image = new Image(), timer = setTimeout(function () { done(false); }, 5000);
          function done(ok) { clearTimeout(timer); image.onload = image.onerror = null; resolve(ok); }
          image.onload = function () { done(image.naturalWidth > 0 && image.naturalHeight > 0); };
          image.onerror = function () { done(false); }; image.src = url;
        });
        return pending[url];
      };
    }
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
        var caption = element('div', 'wall-tile-caption');
        caption.appendChild(element('span', 'wall-tile-title', C.cleanTitle(cell.item.title)));
        caption.appendChild(element('span', 'wall-tile-meta', F.metadata(cell.item)));
        tile.appendChild(art); tile.appendChild(caption); layer.appendChild(tile);
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
        var entries = await F.catalogue(hooks.browse, root, { artworkRevision: artworkRevision, validateArtwork: artworkValidator(), isCurrent: function () { return token === generation && !parents && !document.hidden; } });
        if (token !== generation || parents || document.hidden) return;
        if (hooks.migrate) hooks.migrate(entries.reduce(function (all, item) { return all.concat(item.items || [item]); }, []));
        catalogue = entries;
        // Artwork-only refreshes must not reshuffle the wall or move the
        // selection. Queue/progress identities stay independent of images.
        var selected = model && model.selected(), remaining = entries.slice(), order = [];
        if (model) model.order.forEach(function (old) { var index = remaining.findIndex(function (item) { return item.id === old.id; }); if (index >= 0) order.push(remaining.splice(index, 1)[0]); });
        model = F.wall(order.concat(remaining), dimensions.columns, dimensions.rows, !!order.length);
        if (selected) model.select(selected.id); render();
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
        var folderArt = [], adultEntries = await F.catalogue(hooks.browse, roots.adults, {
          artworkRevision: artworkRevision, validateArtwork: artworkValidator(),
          isCurrent: function () { return token === generation && parents && !document.hidden; },
          folderArtwork: function (row) { if (row.sourceId) folderArt.push(row); }
        });
        if (token !== generation || !parents || document.hidden) return;
        if (hooks.artwork) hooks.artwork(folderArt.concat(adultEntries.reduce(function (all, item) { return all.concat(item.items || [item]); }, [])));
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
      draftDimensions = { columns: dimensions.columns, rows: dimensions.rows }; densityLabels();
      $('parent-error').textContent = ''; $('parent-panel').classList.remove('hidden'); $('reset-home').focus();
    }
    async function inspectArtwork(refresh) {
      if (!parents || !hooks.connected()) return;
      var token = ++generation;
      $('parent-panel').classList.add('hidden'); $('artwork-panel').classList.remove('hidden');
      $('refresh-artwork').focus(); $('artwork-status').textContent = 'Checking family pictures…';
      $('refresh-artwork').disabled = true;
      if (refresh && hooks.refresh) { artworkRevision = Date.now(); hooks.refresh(); }
      var rows = [], validate = artworkValidator();
      try {
        for (var role of ['kids', 'adults']) {
          var root = await resolvePath((config.libraryPaths || {})[role]);
          if (token !== generation || !parents || document.hidden) return;
          var scanned = await F.catalogue(hooks.browse, root, {
            artworkRevision: artworkRevision, validateArtwork: validate,
            isCurrent: function () { return token === generation && parents && !document.hidden; },
            folderArtwork: function (row) { if (row.path.length === 2 || row.explicit) rows.push(Object.assign({}, row, { role: role })); }
          });
          if (role === 'adults' && token === generation && hooks.artwork) hooks.artwork(rows.filter(function (row) { return row.role === 'adults'; }).concat(scanned.reduce(function (all, item) { return all.concat(item.items || [item]); }, [])));
        }
        if (token !== generation || !parents || document.hidden) return;
        var list = $('artwork-list'); while (list.firstChild) list.removeChild(list.firstChild);
        rows.forEach(function (row) {
          var card = element('button', 'artwork-row'); card.type = 'button';
          if (row.artwork) { var image = new Image(); image.alt = ''; image.src = row.artwork; card.appendChild(image); }
          card.appendChild(element('span', '', row.role + ' / ' + row.path.slice(1).map(C.collectionTitle).join(' / ') + ': ' + (row.issue || (row.artwork ? row.explicit ? 'Chosen folder image' : 'Inherited image' : 'No family image yet'))));
          list.appendChild(card);
        });
        $('artwork-status').textContent = rows.filter(function (row) { return !!row.artwork; }).length + ' of ' + rows.length + ' folders have a family picture. Return to kids to see refreshed tiles.';
      } catch (error) { if (token === generation && parents) $('artwork-status').textContent = error.message; }
      finally { $('refresh-artwork').disabled = false; }
    }
    function densityLabels() {
      ['columns', 'rows'].forEach(function (axis) {
        var control = $('density-' + axis), name = axis === 'columns' ? 'Columns' : 'Rows';
        control.textContent = name + ': ' + draftDimensions[axis];
        control.setAttribute('aria-label', name + ': ' + draftDimensions[axis] + '. Left or right to adjust.');
      });
    }
    function adjustDensity(axis, change, wrap) {
      var maximum = axis === 'columns' ? 11 : 7, value = draftDimensions[axis] + change;
      draftDimensions[axis] = wrap && value > maximum ? 3 : Math.max(3, Math.min(maximum, value));
      densityLabels(); $('parent-error').textContent = 'Not saved yet. Press Down to reach Save tile size.';
    }
    /** Number inputs enter Samsung's text-edit mode and swallow arrows. These
     * buttons keep adjustment and every exit on an explicit remote focus path.
     * Only the panel scrolls; scrollIntoView can also scroll the page/library.
     */
    function settingsKey(event) {
      if ($('parent-panel').classList.contains('hidden')) return false;
      var code = event.keyCode, focused = document.activeElement.id;
      if (code === 13 || code === 65376) {
        event.preventDefault(); if (document.activeElement.tagName === 'BUTTON') document.activeElement.click(); return true;
      }
      if (code < 37 || code > 40) return false;
      event.preventDefault();
      if ((focused === 'density-columns' || focused === 'density-rows') && (code === 37 || code === 39)) {
        adjustDensity(focused.slice(8), code === 37 ? -2 : 2); return true;
      }
      var paths = {
        'reset-home': { 39: 'change-code', 40: 'density-columns' },
        'change-code': { 37: 'reset-home', 39: 'parent-connection', 40: 'density-columns' },
        'parent-connection': { 37: 'change-code', 40: 'density-rows' },
        'density-columns': { 38: 'reset-home', 40: 'density-rows' },
        'density-rows': { 38: 'density-columns', 40: 'save-density' },
        'save-density': { 38: 'density-rows', 39: 'family-artwork', 40: 'back-to-kids' },
        'family-artwork': { 38: 'save-density', 37: 'save-density', 40: 'back-to-kids' },
        'back-to-kids': { 38: 'save-density', 39: 'parent-close' },
        'parent-close': { 37: 'back-to-kids', 38: 'save-density' }
      };
      var target = $((paths[focused] || {})[code] || focused || 'reset-home');
      if (target) {
        target.focus();
        var panel = $('parent-panel').querySelector('.panel'), bounds = panel.getBoundingClientRect(), rect = target.getBoundingClientRect();
        if (rect.top < bounds.top + 16) panel.scrollTop += rect.top - bounds.top - 16;
        if (rect.bottom > bounds.bottom - 16) panel.scrollTop += rect.bottom - bounds.bottom + 16;
      }
      return true;
    }
    function returnKids(reload) {
      generation++; inputGeneration++; parents = false; codeGate.reset(); hideDetails(); cancelMotion();
      ['parent-panel', 'pin-panel', 'artwork-panel', 'setup', 'search-panel'].forEach(function (id) { $(id).classList.add('hidden'); });
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
      if (!$('artwork-panel').classList.contains('hidden')) { generation++; $('artwork-panel').classList.add('hidden'); settings(); return true; }
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
    $('family-artwork').onclick = function () { inspectArtwork(false); };
    $('refresh-artwork').onclick = function () { inspectArtwork(true); };
    $('close-artwork').onclick = overlayBack;
    $('save-code').onclick = saveCode;
    $('cancel-code').onclick = overlayBack;
    $('change-code').onclick = function () { $('parent-panel').classList.add('hidden'); pinForm('change'); };
    $('parent-close').onclick = overlayBack;
    $('density-columns').onclick = function () { adjustDensity('columns', 2, true); };
    $('density-rows').onclick = function () { adjustDensity('rows', 2, true); };
    $('parent-connection').onclick = function () { $('parent-panel').classList.add('hidden'); hooks.setup(); };
    $('back-to-kids').onclick = function () { returnKids(true); };
    $('reset-home').onclick = function () {
      try { storage.removeItem('kids-tv-parent-home:' + connection); storage.removeItem('kids-tv-home:' + connection); }
      catch (e) { $('parent-error').textContent = 'Home could not be reset in TV storage.'; return; }
      $('parent-panel').classList.add('hidden'); if (roots.adults) hooks.parentHome(roots.adults, roots.adults);
    };
    $('save-density').onclick = function () {
      try {
        var next = F.density(draftDimensions.columns, draftDimensions.rows);
        storage.setItem('kids-tv-density', JSON.stringify(next)); dimensions = next;
        if (model) model = F.wall(model.order, dimensions.columns, dimensions.rows, true);
        $('parent-error').textContent = 'Tile size saved. Return to kids to try it.';
      } catch (e) { $('parent-error').textContent = e.message; }
    };
    classes();
    return {
      isKids: function () { return !parents; },
      start: function (value) {
        config = value || {};
        try {
          if (F.recoverCode(storage, config.parentalRecoveryNonce)) {
            record = null; recordError = ''; inputGeneration++; refreshGate();
            message('Parental code reset. Enter 12345 to choose a new code.');
          }
        } catch (error) { recordError = error.message; message(recordError); }
      },
      ready: function (url) { if (url !== connection) model = null; connection = url; if (parents) openParents(); else loadKids(); },
      settings: settings,
      overlay: function () { return !$('pin-panel').classList.contains('hidden') ? $('pin-panel') : !$('artwork-panel').classList.contains('hidden') ? $('artwork-panel') : !$('parent-panel').classList.contains('hidden') ? $('parent-panel') : null; },
      back: overlayBack,
      restore: function () { if (!parents) { render(); return true; } return false; },
      lock: function () { returnKids(false); },
      key: function (event) {
        if (settingsKey(event)) return true;
        var code = event.keyCode, numeric = /^[0-9]$/.test(event.key || '') || code >= 48 && code <= 57 || code >= 96 && code <= 105;
        // On a slower TV PBKDF2 is still pending when a user presses OK after
        // the final digit. Do not cancel that result and start the centred film.
        if (authenticating && (code === 13 || code === 65376)) { event.preventDefault(); return true; }
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
