let hlsModulePromise = null;

function loadHlsModule() {
  if (!hlsModulePromise) {
    hlsModulePromise = import('./hls.js').then((module) => module.H);
  }
  return hlsModulePromise;
}

function setMessage(player, text) {
  const message = player.querySelector('[data-player-message]');
  if (message) {
    message.textContent = text || '';
  }
}

async function prepareVideo(player) {
  const video = player.querySelector('video[data-src]');
  if (!video) return null;

  const source = video.dataset.src;
  if (!source) {
    setMessage(player, '当前播放源暂不可用。');
    return null;
  }

  if (video.dataset.ready === 'true') {
    return video;
  }

  video.controls = true;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    return video;
  }

  try {
    const Hls = await loadHlsModule();
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = 'true';
      player._hls = hls;
      return video;
    }
  } catch (error) {
    console.error('HLS module failed to load:', error);
  }

  video.src = source;
  video.dataset.ready = 'true';
  return video;
}

async function playFromCard(player) {
  const overlay = player.querySelector('[data-player-button]');
  setMessage(player, '正在加载播放源…');

  const video = await prepareVideo(player);
  if (!video) return;

  try {
    await video.play();
    if (overlay) overlay.classList.add('is-hidden');
    setMessage(player, '');
  } catch (error) {
    console.error('Video play failed:', error);
    setMessage(player, '浏览器阻止了自动播放，请再次点击播放按钮。');
    if (overlay) overlay.classList.remove('is-hidden');
  }
}

document.querySelectorAll('[data-player]').forEach((player) => {
  const overlay = player.querySelector('[data-player-button]');
  const video = player.querySelector('video');

  if (overlay) {
    overlay.addEventListener('click', () => playFromCard(player));
  }

  if (video) {
    video.addEventListener('play', () => {
      if (overlay) overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', () => {
      if (!video.ended && overlay) overlay.classList.remove('is-hidden');
    });
    video.addEventListener('error', () => {
      setMessage(player, '播放源加载失败，请刷新页面或稍后再试。');
      if (overlay) overlay.classList.remove('is-hidden');
    });
  }
});
