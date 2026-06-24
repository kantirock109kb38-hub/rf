/**
 * Opens social post when a grid tile is clicked.
 */
(function () {
  var root = document.getElementById('rf-social-feed');
  if (!root) return;

  var postBase = ['https://www.', 'instagram', '.com/p/'].join('');

  root.addEventListener('click', function (event) {
    var tile = event.target.closest('[data-sc]');
    if (!tile || !root.contains(tile)) return;
    var code = tile.getAttribute('data-sc');
    if (!code) return;
    window.open(postBase + code + '/', '_blank', 'noopener,noreferrer');
  });

  root.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var tile = event.target.closest('[data-sc]');
    if (!tile || !root.contains(tile)) return;
    event.preventDefault();
    tile.click();
  });
})();
