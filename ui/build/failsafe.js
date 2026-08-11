/* Last-chance escape: if the React app is dead (render crash, bundle not
   loaded), Escape must still release the NUI focus, or the player is stuck
   until a resource restart. Loaded before the bundle, zero dependencies. */
(function () {
  var CLOSE_ACTIONS = ['radial:close'];

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || window.__murphyUiAlive === true) return;
    var res = typeof window.GetParentResourceName === 'function'
      ? window.GetParentResourceName()
      : null;
    if (!res) return;
    CLOSE_ACTIONS.forEach(function (action) {
      try {
        fetch('https://' + res + '/' + action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: '{}',
        }).catch(function () {});
      } catch (_) {}
    });
  });
})();
