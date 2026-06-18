(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });

    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var target = form.getAttribute("data-search-target") || form.getAttribute("action") || "search.html";
        var query = input ? input.value.trim() : "";
        if (query) {
          event.preventDefault();
          window.location.href = target + "?q=" + encodeURIComponent(query);
        }
      });
    });

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
      if (slides.length <= 1) {
        return;
      }
      var index = 0;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
          dot.setAttribute("aria-selected", dotIndex === index ? "true" : "false");
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
      show(0);
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var queryInput = searchPage.querySelector("[data-search-query]");
      var regionSelect = searchPage.querySelector("[data-search-region]");
      var typeSelect = searchPage.querySelector("[data-search-type]");
      var yearSelect = searchPage.querySelector("[data-search-year]");
      var stat = searchPage.querySelector("[data-search-stat]");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }
      function applySearch() {
        var query = normalize(queryInput ? queryInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
          var matchesType = !type || normalize(card.getAttribute("data-genre") + " " + card.querySelector(".meta-line").textContent).indexOf(type) !== -1;
          var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
          var isVisible = matchesQuery && matchesRegion && matchesType && matchesYear;
          card.classList.toggle("is-hidden-card", !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (stat) {
          stat.textContent = "当前筛选结果：" + visible + " 部";
        }
      }
      [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applySearch);
          control.addEventListener("change", applySearch);
        }
      });
      applySearch();
    }
  });
})();
