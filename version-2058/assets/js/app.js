(function () {
  var basePath = document.body ? document.body.getAttribute("data-base-path") || "" : "";

  function withBase(url) {
    if (!url || url.charAt(0) === "#" || /^https?:/i.test(url)) {
      return url;
    }
    return basePath + url.replace(/^\.\//, "");
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("media-missing");
      image.removeAttribute("src");
    });
  });

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    var input = form.querySelector("[data-search-input]");
    var panel = form.querySelector("[data-search-results]");

    if (!input || !panel) {
      return;
    }

    function renderResults() {
      var query = normalize(input.value);
      var data = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

      if (!query) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }

      var results = data.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
      }).slice(0, 12);

      if (!results.length) {
        panel.classList.add("is-open");
        panel.innerHTML = '<div class="search-item"><strong>未找到匹配内容</strong><span>可以尝试输入影片名、地区或类型</span></div>';
        return;
      }

      panel.innerHTML = results.map(function (item) {
        return '<a class="search-item" href="' + escapeHTML(withBase(item.url)) + '">' +
          '<strong>' + escapeHTML(item.title) + '</strong>' +
          '<span>' + escapeHTML(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span>' +
          '</a>';
      }).join("");
      panel.classList.add("is-open");
    }

    input.addEventListener("input", renderResults);
    input.addEventListener("focus", renderResults);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var first = panel.querySelector("a");
      if (first) {
        window.location.href = first.getAttribute("href");
      }
    });
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".search-panel.is-open").forEach(function (panel) {
      if (!panel.parentElement.contains(event.target)) {
        panel.classList.remove("is-open");
      }
    });
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var wrapper = panel.parentElement;
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(wrapper.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var query = normalize(keyword ? keyword.value : "");
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var matchedType = !selectedType || card.getAttribute("data-type") === selectedType;
        card.classList.toggle("is-filtered", !(matchedQuery && matchedYear && matchedType));
      });
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
}());
