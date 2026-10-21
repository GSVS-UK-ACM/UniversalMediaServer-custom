(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.createKidsPlayer = factory;
}(this, function (nativePlayer, video, callbacks) {
  'use strict';
  var position = 0, duration = 0, paused = false, generation = 0, seeking = false, pendingResume = 0;
  function update(ms) { position = ms / 1000; callbacks.time(position, duration); }
  function nativeSeek(seconds) {
    if (seeking) return;
    seeking = true;
    nativePlayer.seekTo(seconds * 1000, function () { seeking = false; }, function (err) { seeking = false; callbacks.error('Seeking unavailable for this stream: ' + String(err)); });
  }
  function stop() {
    generation++; seeking = false;
    if (nativePlayer) { try { nativePlayer.stop(); } catch (e) {} try { nativePlayer.close(); } catch (e) {} }
    else { video.pause(); video.removeAttribute('src'); video.load(); }
  }
  if (!nativePlayer) {
    video.addEventListener('timeupdate', function () { duration = Number.isFinite(video.duration) ? video.duration : 0; update(video.currentTime * 1000); });
    video.addEventListener('ended', callbacks.ended);
    video.addEventListener('loadedmetadata', function () { if (pendingResume) { video.currentTime = pendingResume; pendingResume = 0; } });
    video.addEventListener('error', function () { callbacks.error('This video could not be played. Try it on the TV with native AVPlay.'); });
  }
  return {
    open: function (url, resume) {
      stop(); position = 0; duration = 0; paused = false; var token = generation;
      if (nativePlayer) {
        try {
          nativePlayer.open(url); nativePlayer.setDisplayRect(0, 0, 1920, 1080);
          nativePlayer.setListener({
            oncurrentplaytime: function (ms) { if (token === generation) update(ms); },
            onbufferingstart: function () { if (token === generation) callbacks.message('Buffering…'); },
            onbufferingcomplete: function () { if (token === generation) callbacks.message(''); },
            onstreamcompleted: function () { if (token === generation) callbacks.ended(); },
            onerror: function (err) { if (token === generation) callbacks.error('TV playback failed: ' + String(err)); }
          });
          nativePlayer.prepareAsync(function () {
            if (token !== generation) return;
            duration = nativePlayer.getDuration() / 1000;
            nativePlayer.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX');
            nativePlayer.play(); callbacks.message('');
            if (resume > 5) nativeSeek(Math.min(resume, Math.max(0, duration - 5)));
          }, function (err) { if (token === generation) callbacks.error('The TV could not open this stream: ' + String(err)); });
        } catch (err) { callbacks.error('TV player error: ' + err.message); }
      } else {
        pendingResume = resume || 0; video.src = url; video.play().catch(function (e) { callbacks.error(e.message); });
      }
    },
    toggle: function () {
      try { if (nativePlayer) { if (paused) nativePlayer.play(); else nativePlayer.pause(); paused = !paused; } else if (video.paused) video.play().catch(function (e) { callbacks.error(e.message); }); else video.pause(); }
      catch (e) { callbacks.error(e.message); }
    },
    seek: function (delta) {
      var next = Math.max(0, Math.min(position + delta, duration > 0 ? duration - 1 : position + delta));
      try { if (nativePlayer) nativeSeek(next); else video.currentTime = next; } catch (e) { callbacks.error(e.message); }
    },
    stop: stop
  };
}));
