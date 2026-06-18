function setupPlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var overlay = document.getElementById(options.overlayId);
  var streamUrl = options.url;
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !overlay || !streamUrl) {
    return;
  }

  function begin() {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    overlay.classList.add("is-hidden");
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {});
  }

  button.addEventListener("click", begin);
  overlay.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (!started) {
      begin();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
