(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      });
    });

    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-target") || "search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }
    }

    document.querySelectorAll("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    });

    document.querySelectorAll("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    if (slides.length) {
      showSlide(0);
      restart();
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var input = filterRoot.querySelector("[data-filter-input]");
      var typeSelect = filterRoot.querySelector("[data-filter-type]");
      var regionSelect = filterRoot.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-card]"));
      var empty = filterRoot.querySelector("[data-no-result]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "").toLowerCase();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var type = typeSelect ? typeSelect.value : "all";
        var region = regionSelect ? regionSelect.value : "all";
        var visible = 0;

        cards.forEach(function (card) {
          var key = normalize(card.getAttribute("data-key"));
          var cardType = card.getAttribute("data-type") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var matchQuery = !query || key.indexOf(query) !== -1;
          var matchType = type === "all" || cardType === type;
          var matchRegion = region === "all" || cardRegion === region;
          var shouldShow = matchQuery && matchType && matchRegion;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [input, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });
})();
