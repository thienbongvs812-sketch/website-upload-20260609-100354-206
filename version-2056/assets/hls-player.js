(function () {
  function initPlayer(video) {
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hlsInstance = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video.hls-player'));
    videos.forEach(function (video) {
      initPlayer(video);
      var wrapper = video.closest('.player-wrap');
      var trigger = wrapper ? wrapper.querySelector('[data-player-trigger]') : null;

      function hideTrigger() {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function () {
          hideTrigger();
          video.play().catch(function () {
            trigger.classList.remove('is-hidden');
          });
        });
      }

      video.addEventListener('play', hideTrigger);
    });
  });
})();
