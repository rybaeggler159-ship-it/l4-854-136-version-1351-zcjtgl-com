(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function sourceOf(video) {
    var source = video.querySelector("source");
    return source ? source.getAttribute("src") : video.getAttribute("src");
  }

  function prepareVideo(video) {
    if (!video || video.getAttribute("data-ready") === "1") {
      return;
    }
    var url = sourceOf(video);
    if (!url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsController = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else {
      video.src = url;
    }
    video.setAttribute("data-ready", "1");
  }

  ready(function () {
    document.querySelectorAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      function start() {
        prepareVideo(video);
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("loadedmetadata", function () {
        video.controls = true;
      });
    });
  });
})();
