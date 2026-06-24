(function () {
  var grid = document.getElementById('rf-instagram-grid');
  if (!grid) return;

  var profileUrl = 'https://www.instagram.com/ramdevraforge/';

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showFallback(message) {
    grid.innerHTML =
      '<p class="rf-ig-fallback">' +
      esc(message) +
      ' <a href="' +
      profileUrl +
      '" target="_blank" rel="noopener noreferrer">@ramdevraforge</a></p>';
  }

  fetch('/api/instagram-feed')
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      profileUrl = data.profileUrl || profileUrl;

      if (!data.ok || !data.posts || !data.posts.length) {
        showFallback('Follow us on Instagram for the latest updates —');
        return;
      }

      grid.innerHTML = data.posts
        .map(function (post) {
          var videoBadge = post.isVideo
            ? '<span class="rf-ig-video" aria-hidden="true"><i class="fa fa-play"></i></span>'
            : '';
          var alt = post.caption ? esc(post.caption) : 'Ramdevra Forge on Instagram';

          return (
            '<a class="rf-ig-item" href="' +
            esc(post.url) +
            '" target="_blank" rel="noopener noreferrer" title="' +
            alt +
            '">' +
            '<img src="' +
            esc(post.image) +
            '" alt="' +
            alt +
            '" loading="lazy" decoding="async" />' +
            videoBadge +
            '</a>'
          );
        })
        .join('');
    })
    .catch(function () {
      showFallback('Follow us on Instagram for the latest updates —');
    });
})();
