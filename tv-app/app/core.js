/* Shared DLNA contracts. No credentials, media files or destructive actions. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KidsCore = api;
}(this, function () {
  'use strict';
  var SERVICE = 'urn:schemas-upnp-org:service:ContentDirectory:1';
  function escapeXml(value) {
    return String(value).replace(/[<>&"']/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]; });
  }
  function elements(node, name) { return Array.prototype.slice.call(node.getElementsByTagNameNS('*', name)); }
  function text(node, name) { var found = elements(node, name)[0]; return found ? found.textContent : ''; }
  function parseXml(value, Parser) {
    // Reject entity declarations, including those the browser might otherwise expand.
    if (/<!DOCTYPE|<!ENTITY/i.test(value)) throw new Error('Unsupported XML declaration');
    var doc = new Parser().parseFromString(value, 'application/xml');
    if (elements(doc, 'parsererror').length || !doc.documentElement) throw new Error('Invalid server XML');
    return doc;
  }
  function httpUrl(value, base) {
    var url = new URL(value, base);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error('Use an HTTP(S) URL without credentials');
    return url.href;
  }
  function sameServerUrl(value, base) {
    if (!value) return '';
    try { var url = httpUrl(value, base); return new URL(url).origin === new URL(base).origin ? url : ''; }
    catch (e) { return ''; }
  }
  function description(xml, url, Parser) {
    var doc = parseXml(xml, Parser), service = elements(doc, 'service').filter(function (s) { return text(s, 'serviceType') === SERVICE; })[0];
    if (!service) throw new Error('This device does not provide a media library');
    var control = sameServerUrl(text(service, 'controlURL'), url);
    if (!control) throw new Error('The library control URL is not on this server');
    return { name: text(doc, 'friendlyName') || 'UMS', control: control, description: httpUrl(url) };
  }
  function isVideoResource(protocol) { return /^http-get:\*:(video\/|application\/vnd\.apple\.mpegurl|application\/x-mpegurl)/i.test(protocol); }
  function resourceFilename(url) {
    try { return decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/_transcoded_to\.[a-z0-9]+$/i, ''); } catch (e) { return ''; }
  }
  function resourceKey(value) { return value.replace(/[^a-z0-9]/gi, '').toLowerCase(); }
  /** UMS sanitises resource filenames into URL slugs. Explicit type/year labels
   * still survive there, even when an unrelated online film lookup wins dc:title.
   * An optional private index restores exact punctuation; newly added schema
   * files work without rebuilding that index using the conservative slug parser.
   */
  function storageName(url, names) {
    var filename = resourceFilename(url), indexed = names && names[resourceKey(filename)];
    if (indexed) return indexed;
    if (/^\((film|tv show|extra content|trailers)\)/i.test(filename)) return filename;
    var match = filename.match(/^-?(film|tv-show|extra-content|trailers)-(.+?)\.(mkv|mp4|avi|m4v|ts|mpg|mpeg|webm|wmv)$/i);
    if (!match) return '';
    var kind = match[1].replace(/-/g, ' '), rest = match[2].replace(/-+$/, ''), year = '', quality = '';
    var date = rest.match(/^((?:19|20)\d{2})-/); if (date) { year = date[1]; rest = rest.slice(date[0].length); }
    var qualityAt = rest.search(/-(?:(?:\d{3,4}p|PAL|NTSC|BluRay|WEBRip|HDTV)(?:-|$)|DVD-(?:Remux|Rip)|WEB-DL)/i);
    if (qualityAt >= 0) { quality = rest.slice(qualityAt + 1).replace(/-/g, ' '); rest = rest.slice(0, qualityAt); }
    return '(' + kind + ') ' + (year ? '(' + year + ') ' : '') + rest.replace(/-/g, ' ') + (quality ? ' (' + quality + ')' : '') + '.' + match[3];
  }
  function titleIdentity(title) { var info = mediaName(title); return resourceKey(info.title) + '|' + info.year; }
  function parseResult(xml, base, Parser, names) {
    var soap = parseXml(xml, Parser), fault = elements(soap, 'Fault')[0];
    if (fault) throw new Error(text(fault, 'errorDescription') || text(fault, 'faultstring') || 'UMS rejected the request');
    var result = parseXml(text(soap, 'Result') || '<DIDL-Lite/>', Parser);
    var nodes = Array.prototype.slice.call(result.documentElement.childNodes).filter(function (n) { return n.nodeType === 1; });
    var items = nodes.map(function (node) {
      var resources = elements(node, 'res').map(function (res) {
        return { url: sameServerUrl(res.textContent, base), protocol: res.getAttribute('protocolInfo') || '', duration: res.getAttribute('duration') || '' };
      });
      var video = resources.filter(function (r) { return r.url && isVideoResource(r.protocol); })[0];
      var art = elements(node, 'albumArtURI').map(function (n) { return sameServerUrl(n.textContent, base); }).filter(Boolean)[0];
      if (!art) art = (resources.filter(function (r) { return /:image\//.test(r.protocol); })[0] || {}).url;
      // UMS dc:date can be the FILE MODIFICATION date, not a release year.
      // Keep release years from the explicit storage/title contract instead.
      var serverTitle = text(node, 'title'), explicit = video ? storageName(video.url, names) : '', info = mediaName(explicit);
      var conflict = explicit && titleIdentity(explicit) !== titleIdentity(serverTitle);
      return { id: node.getAttribute('id'), parentId: node.getAttribute('parentID'), title: explicit || serverTitle, serverTitle: serverTitle, folder: node.localName === 'container', className: text(node, 'class'), description: conflict ? '' : text(node, 'longDescription') || text(node, 'description'), series: explicit ? info.series : text(node, 'seriesTitle'), season: explicit ? info.season : text(node, 'episodeSeason'), episode: explicit ? info.episode : text(node, 'episodeNumber'), artwork: conflict ? '' : art || '', url: video ? video.url : '', duration: video ? video.duration : '' };
    }).filter(function (item) { return item.id !== null && !/^#.*#$/.test(item.title) && (item.folder || item.url); });
    return { items: items, returned: Number(text(soap, 'NumberReturned')), total: Number(text(soap, 'TotalMatches')) };
  }
  function envelope(action, args) {
    return '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:' + action + ' xmlns:u="' + SERVICE + '">' + Object.keys(args).map(function (k) { return '<' + k + '>' + escapeXml(args[k]) + '</' + k + '>'; }).join('') + '</u:' + action + '></s:Body></s:Envelope>';
  }
  function searchCriteria(query) { return 'upnp:class derivedfrom "object.item.videoItem" and dc:title contains "' + String(query).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function client(request, Parser) {
    var server, names, namesServer;
    async function action(name, args) {
      var xml = await request(server.control, { method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"' + SERVICE + '#' + name + '"' }, body: envelope(name, args) });
      return parseResult(xml, server.control, Parser, server.description === namesServer ? names : null);
    }
    async function pages(name, args) {
      var all = [], offset = 0;
      while (offset < 20000) {
        args.StartingIndex = offset; args.RequestedCount = 200;
        var page = await action(name, args);
        if (!Number.isFinite(page.returned) || !Number.isFinite(page.total)) throw new Error('UMS returned invalid pagination');
        all = all.concat(page.items); offset += page.returned;
        if (offset >= page.total || !page.returned) return all;
      }
      throw new Error('This folder exceeds the 20,000-item safety limit. Open a smaller category.');
    }
    return {
      setNames: function (index, descriptionUrl) { names = index; namesServer = descriptionUrl; },
      connect: async function (url) { server = description(await request(httpUrl(url), {}), url, Parser); return server; },
      browse: function (id) { return pages('Browse', { ObjectID: id, BrowseFlag: 'BrowseDirectChildren', Filter: '*', SortCriteria: '' }); },
      search: function (id, query) { return pages('Search', { ContainerID: id, SearchCriteria: searchCriteria(query), Filter: '*', SortCriteria: '' }); }
    };
  }
  /** Storage labels are data, not UI. Unknown years/editions stay unknown. */
  function mediaName(value) {
    var title = String(value || '').replace(/\.(mkv|mp4|avi|m4v|ts|mpg|mpeg|webm|vob|wmv)$/i, '');
    var kind = '', year = '', quality = '', match;
    match = title.match(/^\((film|tv show|trailers|extra content)\)\s*/i);
    if (match) { kind = match[1].toLowerCase(); title = title.slice(match[0].length); }
    match = title.match(/^\((\d{4})\)\s*/);
    if (match) { year = match[1]; title = title.slice(match[0].length); }
    // Only strip an evidenced quality suffix. Parentheses such as Part 2 and
    // edition labels are meaningful and must not disappear with release noise.
    match = title.match(/\s*[\[(]((?:(?:PAL|NTSC)\s+)?DVD\s+(?:Remux|Rip)|[^\[\]()]*\b(?:\d{3,4}p|BluRay|Blu-Ray|WEB-DL|WEBRip|DVDRip|BRRip)\b[^\[\]()]*)[\])]\s*$/i);
    if (match) { quality = match[1]; title = title.slice(0, match.index); }
    match = title.match(/\s*[\[(]((?:19|20)\d{2})[\])]\s*$/);
    if (match) { if (!year) year = match[1]; title = title.slice(0, match.index); }
    title = title.replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim();
    var episode = title.match(/^(.*?)\s*(?:-\s*)?S(\d{1,2})\s*E(\d{1,3})(?:\s*[- ]\s*)?(.*)$/i);
    return { title: title, year: year, quality: quality, kind: kind || (episode ? 'tv show' : ''), series: episode ? episode[1].replace(/\s*-\s*$/, '').trim() : '', season: episode ? Number(episode[2]) : null, episode: episode ? Number(episode[3]) : null };
  }
  function cleanTitle(title) { return mediaName(title).title; }
  function progressKey(server, item) {
    // Media URLs contain a renderer UUID and IDs can be versioned. Use the
    // server description identity + parent + title, never the renderer URL.
    return server + '|' + String(item.parentId || '').split('#')[0] + '|' + item.title;
  }
  function progress(position, duration) {
    position = Number(position); duration = Number(duration);
    position = Number.isFinite(position) ? Math.max(0, position) : 0;
    duration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    return { position: position, duration: duration, watched: duration > 0 && position / duration >= 0.95 };
  }
  return { SERVICE: SERVICE, escapeXml: escapeXml, parseXml: parseXml, description: description, parseResult: parseResult, envelope: envelope, searchCriteria: searchCriteria, client: client, cleanTitle: cleanTitle, mediaName: mediaName, resourceFilename: resourceFilename, resourceKey: resourceKey, titleIdentity: titleIdentity, storageName: storageName, progress: progress, progressKey: progressKey, httpUrl: httpUrl };
}));
