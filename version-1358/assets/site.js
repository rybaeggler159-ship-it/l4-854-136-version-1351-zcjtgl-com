(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", function () {
        var expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        mainNav.classList.toggle("is-open", !expanded);
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(dotIndex);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var catalogInput = document.querySelector(".catalog-search input[name='q']");
    var catalogTitle = document.querySelector("[data-search-heading]");

    if (catalogInput && query) {
      catalogInput.value = query;
    }

    function filterCards(value) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
      var normalized = value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var content = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !normalized || content.indexOf(normalized) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      var empty = document.querySelector(".empty-message");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (catalogInput) {
      catalogInput.addEventListener("input", function () {
        filterCards(catalogInput.value);
      });
    }

    if (query) {
      if (catalogTitle) {
        catalogTitle.textContent = "搜索结果：" + query;
      }
      filterCards(query);
    }
  });
})();
