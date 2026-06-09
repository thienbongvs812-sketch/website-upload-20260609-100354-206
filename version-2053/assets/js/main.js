(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var tabs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
      var index = 0;
      var timer = null;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        tabs.forEach(function (tab, i) {
          tab.classList.toggle('is-active', i === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          window.clearInterval(timer);
          show(Number(tab.getAttribute('data-hero-target')) || 0);
          start();
        });
      });
      if (slides.length > 1) {
        start();
      }
    }

    var urlParams = new URLSearchParams(window.location.search);
    var pageQuery = urlParams.get('q') || '';
    var pageInput = document.querySelector('[data-search-page-input]');
    if (pageInput && pageQuery) {
      pageInput.value = pageQuery;
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var filterInput = scope.querySelector('[data-card-filter]');
      var sortSelect = scope.querySelector('[data-card-sort]');
      var list = scope.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      if (filterInput && pageQuery && pageInput) {
        filterInput.value = pageQuery;
      }
      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }
      function applyFilter() {
        var term = normalize(filterInput ? filterInput.value : '');
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          card.classList.toggle('is-hidden', term && haystack.indexOf(term) === -1);
        });
      }
      function applySort() {
        if (!sortSelect) {
          return;
        }
        var mode = sortSelect.value;
        var sorted = cards.slice();
        if (mode !== 'default') {
          sorted.sort(function (a, b) {
            var av = Number(a.getAttribute('data-' + mode)) || 0;
            var bv = Number(b.getAttribute('data-' + mode)) || 0;
            return bv - av;
          });
        }
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
      }
      if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
      }
      applySort();
      applyFilter();
    });
  });
})();
