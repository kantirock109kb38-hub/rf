/**
 * Opens profile or post (no social URLs in HTML — ad-blocker safe).
 */
(function () {
  var root = document.getElementById('rf-social-feed');
  if (!root) return;

  var user = root.getAttribute('data-user') || 'ramdevraforge';
  var profileUrl = ['https://www.', 'instagram', '.com/', user, '/'].join('');
  var postBase = ['https://www.', 'instagram', '.com/p/'].join('');

  root.addEventListener('click', function (event) {
    if (event.target.closest('[data-action="profile"]')) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    var tile = event.target.closest('[data-sc]');
    if (!tile || !root.contains(tile)) return;
    var code = tile.getAttribute('data-sc');
    if (!code) return;
    window.open(postBase + code + '/', '_blank', 'noopener,noreferrer');
  });

  root.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var target = event.target.closest('[data-sc], [data-action="profile"]');
    if (!target || !root.contains(target)) return;
    event.preventDefault();
    target.click();
  });
})();
