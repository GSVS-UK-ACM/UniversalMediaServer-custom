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
  function parseResult(xml, base, Parser) {
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
      return { id: node.getAttribute('id'), parentId: node.getAttribute('parentID'), title: text(node, 'title'), folder: node.localName === 'container', className: text(node, 'class'), artwork: art || '', url: video ? video.url : '', duration: video ? video.duration : '' };
    }).filter(function (item) { return item.id !== null && !/^#.*#$/.test(item.title) && (item.folder || item.url); });
    return { items: items, returned: Number(text(soap, 'NumberReturned')), total: Number(text(soap, 'TotalMatches')) };
  }
  function envelope(action, args) {
    return '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:' + action + ' xmlns:u="' + SERVICE + '">' + Object.keys(args).map(function (k) { return '<' + k + '>' + escapeXml(args[k]) + '</' + k + '>'; }).join('') + '</u:' + action + '></s:Body></s:Envelope>';
  }
  function searchCriteria(query) { return 'upnp:class derivedfrom "object.item.videoItem" and dc:title contains "' + String(query).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function client(request, Parser) {
    var server;
    async function action(name, args) {
      var xml = await request(server.control, { method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"' + SERVICE + '#' + name + '"' }, body: envelope(name, args) });
      return parseResult(xml, server.control, Parser);
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
      connect: async function (url) { server = description(await request(httpUrl(url), {}), url, Parser); return server; },
      browse: function (id) { return pages('Browse', { ObjectID: id, BrowseFlag: 'BrowseDirectChildren', Filter: '*', SortCriteria: '' }); },
      search: function (id, query) { return pages('Search', { ContainerID: id, SearchCriteria: searchCriteria(query), Filter: '*', SortCriteria: '' }); }
    };
  }
  function cleanTitle(title) { return String(title).replace(/\.(mkv|mp4|avi|m4v|ts)$/i, '').replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim(); }
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
  return { SERVICE: SERVICE, escapeXml: escapeXml, parseXml: parseXml, description: description, parseResult: parseResult, envelope: envelope, searchCriteria: searchCriteria, client: client, cleanTitle: cleanTitle, progress: progress, progressKey: progressKey, httpUrl: httpUrl };
}));
