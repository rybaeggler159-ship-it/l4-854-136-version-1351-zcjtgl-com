(function () {
  function bootPlayer() {
    var shell = document.querySelector(".player-shell");
    var video = document.querySelector("#movie-player");
    var button = document.querySelector("#player-start");

    if (!shell || !video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var initialized = false;
    var hlsInstance = null;

    function attachStream() {
      if (initialized || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        initialized = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        initialized = true;
      }
    }

    function playVideo() {
      attachStream();
      shell.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", playVideo);
    shell.addEventListener("click", function (event) {
      if (event.target === video) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPlayer);
  } else {
    bootPlayer();
  }
})();
