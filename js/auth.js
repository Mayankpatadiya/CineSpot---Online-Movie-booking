(function () {
  'use strict';

  window.CineAuth = {
    logout() {
      localStorage.removeItem('cinespots-current-user');
      window.location.href = '../pages/login.html';
    }
  };
})();
