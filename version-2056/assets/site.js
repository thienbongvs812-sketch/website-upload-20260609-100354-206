document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        restart();
      });
    }

    restart();
  }

  var localFilter = document.querySelector('[data-local-filter]');
  var cardList = document.querySelector('[data-card-list]');
  if (localFilter && cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
    localFilter.addEventListener('input', function () {
      var keyword = localFilter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }

  var tableFilter = document.querySelector('[data-table-filter]');
  var tableBody = document.querySelector('[data-table-body]');
  if (tableFilter && tableBody) {
    var rows = Array.prototype.slice.call(tableBody.querySelectorAll('tr'));
    tableFilter.addEventListener('input', function () {
      var keyword = tableFilter.value.trim().toLowerCase();
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  }
});
