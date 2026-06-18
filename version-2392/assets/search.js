(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function createCard(movie) {
    var terms = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category]
      .concat(movie.tags || [])
      .join(' ');
    return '' +
      '<article class="movie-card" data-card data-filter-text="' + escapeHtml(terms) + '">' +
        '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">' +
          '<span class="poster-wrap">' +
            '<img class="poster-image" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />' +
            '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
            '<span class="poster-rating">' + escapeHtml(movie.rating) + '</span>' +
          '</span>' +
          '<span class="movie-card-body">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>' +
            '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>' +
          '</span>' +
        '</a>' +
      '</article>';
  }

  function render() {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var query = getQuery();

    if (!results || !status || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
      return;
    }

    if (input) {
      input.value = query;
    }

    var normalizedQuery = normalize(query);
    var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
    }).slice(0, 96);

    if (!normalizedQuery) {
      matches = window.MOVIE_SEARCH_DATA.slice(0, 48);
      status.textContent = '热门影片推荐';
    } else if (matches.length) {
      status.textContent = '搜索结果';
    } else {
      status.textContent = '没有找到匹配影片';
    }

    results.innerHTML = matches.map(createCard).join('');
    Array.prototype.slice.call(results.querySelectorAll('img.poster-image')).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', render);
})();
