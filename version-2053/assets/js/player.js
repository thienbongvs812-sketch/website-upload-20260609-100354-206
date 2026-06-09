(function () {
  function initPlayer(root) {
    var video = root.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var overlay = root.querySelector('.player-overlay');
    var playButton = root.querySelector('[data-player-play]');
    var muteButton = root.querySelector('[data-player-mute]');
    var fullscreenButton = root.querySelector('[data-player-fullscreen]');
    if (!video || !source) {
      return;
    }
    var sourceUrl = source.getAttribute('src');
    var hls = null;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          root.classList.add('has-error');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    }
    function startPlayback() {
      root.classList.add('is-playing');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }
    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      root.classList.add('has-error');
    });
    if (playButton) {
      playButton.addEventListener('click', togglePlayback);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState !== 'loading') {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-player]').forEach(initPlayer);
    });
  }
})();
