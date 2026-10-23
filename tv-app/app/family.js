/* Pure family-library contracts. No network, media changes or device globals. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.KidsFamily = factory(root.KidsCore);
}(this, function (C) {
  'use strict';
  function mod(value, count) { return ((value % count) + count) % count; }
  function density(columns, rows) {
    columns = Number(columns); rows = Number(rows);
    if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 3 || columns > 11 || rows < 3 || rows > 7 || columns % 2 !== 1 || rows % 2 !== 1) throw new Error('Use odd dimensions: 3-11 columns and 3-7 rows.');
    return { columns: columns, rows: rows };
  }
  function shuffled(items, random) {
    var result = items.slice(); random = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) { var j = Math.floor(random() * (i + 1)), tmp = result[i]; result[i] = result[j]; result[j] = tmp; }
    return result;
  }
  function family(item) {
    return String(item.franchise || item.series || C.cleanTitle(item.title)).toLowerCase().replace(/\b(?:the|and|part|volume|vol|\d+)\b/g, '').replace(/[^a-z]+/g, ' ').trim().split(' ').slice(0, 2).join(' ');
  }
  /** Soft spacing, not a genre partition. A tiny/one-franchise library still works. */
  function spread(items, columns, random) {
    var remaining = shuffled(items, random), result = [];
    while (remaining.length) {
      var best = 0, score = Infinity;
      for (var i = 0; i < remaining.length; i++) {
        var candidate = remaining[i], cost = 0;
        [result.length - 1, result.length - 2, result.length - columns].forEach(function (index) {
          if (index >= 0) { if (family(result[index]) === family(candidate)) cost += 8; if (result[index].kind === candidate.kind) cost += 1; }
        });
        if (cost < score) { score = cost; best = i; if (!score) break; }
      }
      result.push(remaining.splice(best, 1)[0]);
    }
    return result;
  }
  /** The visible grid is a window on the WHOLE ring, not separate short rows.
   * Horizontal movement advances one item, vertical movement one window row.
   * Inverses are exact and no rerandomisation occurs on a movement or playback.
   */
  function wall(items, columns, rows, existing) {
    var size = density(columns, rows), order = existing ? items.slice() : spread(items, size.columns);
    var position = 0;
    return {
      order: order,
      dimensions: size,
      position: function () { return position; },
      selected: function () { return order.length ? order[mod(position, order.length)] : null; },
      move: function (direction) { position += { left: -1, right: 1, up: -size.columns, down: size.columns }[direction] || 0; position = order.length ? mod(position, order.length) : 0; },
      cells: function (margin) {
        var cells = [];
        margin = margin || 0;
        for (var y = -margin; y < size.rows + margin; y++) for (var x = -margin; x < size.columns + margin; x++) {
          var offset = (y - (size.rows - 1) / 2) * size.columns + x - (size.columns - 1) / 2;
          cells.push({ x: x, y: y, centre: offset === 0, item: order.length ? order[mod(position + offset, order.length)] : null });
        }
        return cells;
      }
    };
  }
  function metadata(item) {
    var info = C.mediaName(item.title), kind = item.kind || info.kind;
    return [info.year || item.year, kind === 'tv show' ? 'Series' : kind === 'extra content' ? 'Bonus content' : kind === 'film' ? 'Film' : item.folder ? 'Collection' : 'Video'].filter(Boolean).join(' - ');
  }
  function label(item) { return C.cleanTitle(item.title) + ' - ' + metadata(item); }
  function episodeOrder(a, b) {
    var x = C.mediaName(a.title), y = C.mediaName(b.title);
    if (a.season !== '' && a.season != null && b.season !== '' && b.season != null && a.episode && b.episode) return Number(a.season) - Number(b.season) || parseInt(a.episode, 10) - parseInt(b.episode, 10) || x.title.localeCompare(y.title);
    if (x.season !== null && y.season !== null) return x.season - y.season || x.episode - y.episode || x.title.localeCompare(y.title);
    return x.title.localeCompare(y.title, undefined, { numeric: true });
  }
  /** Each click advances the starting episode, not the queue's episode order. */
  function queue(items, kind, nextStart, random) {
    var order = items.slice().sort(episodeOrder), start = order.length ? mod(Number(nextStart) || 0, order.length) : 0;
    if (kind === 'extra content') return { items: shuffled(order, random), nextStart: 0 };
    return { items: order.slice(start).concat(order.slice(0, start)), nextStart: order.length ? mod(start + 1, order.length) : 0 };
  }
  function ignored(item) { return /^#.*#$/.test(item.title) || /^(DVD-(Reviewed|Incoming|Adverts|Excluded|Needs-Attention)|Extras?\s*[- ]\s*Excluded)$/i.test(item.title); }
  /** Bounded, serial catalogue read of the explicitly selected CHILD root only.
   * Cancellation is checked after every await. Partial/failed traversals must
   * not replace a previously complete wall or spill into sibling adult shares.
   */
  async function catalogue(browse, root, options) {
    options = options || {};
    var pending = [{ folder: root, ancestors: [] }], seen = {}, files = [], visited = 0;
    while (pending.length) {
      if (options.isCurrent && !options.isCurrent()) throw new Error('Catalogue cancelled');
      var task = pending.shift();
      if (seen[task.folder.id]) continue;
      seen[task.folder.id] = true;
      if (++visited > (options.maxFolders || 400) || task.ancestors.length > 12) throw new Error('Kids library exceeds the safe catalogue limit. Choose a smaller root.');
      var children = await browse(task.folder.id);
      if (options.isCurrent && !options.isCurrent()) throw new Error('Catalogue cancelled');
      children.forEach(function (item) {
        if (ignored(item)) return;
        if (item.folder) pending.push({ folder: item, ancestors: task.ancestors.concat([task.folder]) });
        else files.push({ item: item, folder: task.folder, ancestors: task.ancestors });
      });
      if (files.length > (options.maxItems || 10000)) throw new Error('Kids library exceeds the safe title limit.');
      if (options.progress) options.progress(visited, files.length);
    }
    var entries = [], groups = {};
    files.forEach(function (row) {
      var info = C.mediaName(row.item.title), folders = row.ancestors.concat([row.folder]);
      var extras = info.kind === 'extra content' || folders.some(function (f) { return /^(extras?|bonus(?: content)?)$/i.test(C.cleanTitle(f.title)); });
      if (info.kind === 'trailers') return;
      var series = info.series || row.item.series || (info.kind === 'tv show' && info.title.indexOf(' - ') >= 0 ? info.title.split(' - ')[0] : '') || ((info.kind === 'tv show' || /episode/i.test(row.item.className || '')) ? C.cleanTitle(row.folder.title) : '');
      if (info.kind === 'film') series = '';
      var kind = extras ? 'extra content' : (info.kind === 'tv show' || series ? 'tv show' : 'film');
      if (kind === 'film') { entries.push(Object.assign({}, row.item, { kind: kind })); return; }
      var parent = row.folder;
      if (extras && /^(extras?|bonus(?: content)?)$/i.test(C.cleanTitle(parent.title)) && row.ancestors.length) parent = row.ancestors[row.ancestors.length - 1];
      var title = series || C.cleanTitle(parent.title), groupKey = kind + '|' + title.toLowerCase();
      if (!groups[groupKey]) {
        // UMS inherits a folder's image from its first child. If that child
        // was misidentified online, the same bad poster can contaminate every
        // collection. Only use child artwork that survived filename checks.
        groups[groupKey] = { id: 'collection:' + groupKey, title: title, kind: kind, series: series || title, artwork: row.item.artwork || '', description: '', year: info.year || row.item.year || '', items: [], folder: true };
        entries.push(groups[groupKey]);
      }
      groups[groupKey].items.push(row.item);
      if (!groups[groupKey].artwork && row.item.artwork) groups[groupKey].artwork = row.item.artwork;
    });
    return entries;
  }
  function validCode(value) { return /^\d{5,10}$/.test(value); }
  function codeRecord(value) {
    return value && value.version === 1 && Number.isInteger(value.length) && value.length >= 5 && value.length <= 10 && /^[0-9a-f]{32}$/.test(value.salt) && /^[0-9a-f]{64}$/.test(value.digest) && value.iterations === 100000;
  }
  function hex(bytes) { return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  async function codeDigest(code, salt, crypto) {
    if (!crypto || !crypto.subtle || !crypto.getRandomValues) throw new Error('Secure code storage is unavailable on this device.');
    var bytes = new Uint8Array(code.split('').map(function (c) { return c.charCodeAt(0); }));
    var saltBytes = new Uint8Array(salt.match(/../g).map(function (n) { return parseInt(n, 16); }));
    var material = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
    return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' }, material, 256)));
  }
  async function newCode(code, confirmation, crypto) {
    if (!validCode(code)) throw new Error('Use 5 to 10 digits.');
    if (code === '12345') throw new Error('Choose your own code, not the starter code.');
    if (code !== confirmation) throw new Error('The two codes do not match.');
    var salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    return { version: 1, length: code.length, salt: salt, iterations: 100000, digest: await codeDigest(code, salt, crypto) };
  }
  async function checkCode(code, record, crypto) {
    if (!record) return code === '12345';
    if (!codeRecord(record)) throw new Error('Saved parental code is invalid. Do not reset TV storage; contact the app administrator.');
    return validCode(code) && code.length === record.length && (await codeDigest(code, record.salt, crypto)) === record.digest;
  }
  /** A private, owner-authorised signed build can request one code-only reset.
   * Consume each nonce before deleting the credential. If storage fails, stay
   * locked and use a new recovery request, never erase unrelated TV state.
   */
  function recoverCode(storage, nonce) {
    if (!nonce) return false;
    if (!/^[a-f0-9]{32}$/.test(nonce)) throw new Error('Invalid parental recovery request.');
    var marker = 'kids-tv-parent-recovery:' + nonce;
    if (storage.getItem(marker) === 'consumed') return false;
    storage.setItem(marker, 'consumed');
    if (storage.getItem(marker) !== 'consumed') throw new Error('Parental recovery could not be saved.');
    storage.removeItem('kids-tv-parent-code');
    if (storage.getItem('kids-tv-parent-code') !== null) throw new Error('Parental code could not be reset.');
    return true;
  }
  /** No visible entry UI on kids home. Navigation, pauses and visibility clear
   * the buffer; repeated attempts receive a bounded local cooldown.
   */
  function gate(length, verify, now) {
    var buffer = '', last = 0, failed = 0, lockedUntil = 0, busy = false;
    now = now || Date.now;
    return {
      reset: function () { buffer = ''; },
      digit: async function (digit) {
        var time = now();
        if (!/^\d$/.test(digit) || busy || time < lockedUntil) return false;
        if (time - last > 15000) buffer = '';
        last = time; buffer += digit;
        if (buffer.length < length) return false;
        var attempt = buffer; buffer = ''; busy = true;
        try {
          var ok = await verify(attempt);
          if (ok) { failed = 0; return true; }
          if (++failed >= 5) { lockedUntil = time + 30000; failed = 0; }
          return false;
        } finally { busy = false; }
      }
    };
  }
  return { density: density, wall: wall, spread: spread, shuffled: shuffled, metadata: metadata, label: label, queue: queue, catalogue: catalogue, ignored: ignored, validCode: validCode, codeRecord: codeRecord, newCode: newCode, checkCode: checkCode, recoverCode: recoverCode, gate: gate };
}));
