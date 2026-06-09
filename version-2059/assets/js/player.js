(function () {
  function prepare(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var cover = shell.querySelector('[data-player-cover]');
    var message = shell.querySelector('[data-player-message]');
    var url = shell.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function showError() {
      if (message) {
        message.textContent = '播放暂时无法加载，请稍后重试。';
        message.classList.add('is-visible');
      }
    }

    function start() {
      if (!video || !url) {
        showError();
        return;
      }

      shell.classList.add('is-playing');
      if (cover) {
        cover.setAttribute('aria-hidden', 'true');
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
        } else {
          video.src = url;
        }
        started = true;
      }

      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        if (event.target !== button && !button.contains(event.target)) {
          start();
        }
      });
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(prepare);
})();
