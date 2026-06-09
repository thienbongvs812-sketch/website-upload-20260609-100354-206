(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var query = normalize(input && input.value);
    var regionValue = normalize(region && region.value);
    var typeValue = normalize(type && type.value);
    var yearValue = normalize(year && year.value);
    var shown = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matchQuery = !query || search.indexOf(query) !== -1;
      var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
      var matchType = !typeValue || cardType.indexOf(typeValue) !== -1 || search.indexOf(typeValue) !== -1;
      var matchYear = !yearValue || cardYear === yearValue;
      var visible = matchQuery && matchRegion && matchType && matchYear;

      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', shown === 0 && cards.length > 0);
    }
  }

  ['input', 'change'].forEach(function (eventName) {
    document.addEventListener(eventName, function (event) {
      if (event.target.matches('[data-filter-input], [data-filter-region], [data-filter-type], [data-filter-year]')) {
        applyFilters();
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
