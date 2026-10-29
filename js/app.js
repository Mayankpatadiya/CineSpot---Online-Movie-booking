(function () {
  'use strict';

  const escapeHtml = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const showToast = (message, type) => {
    if (window.CineUI && window.CineUI.showToast) {
      window.CineUI.showToast(message, type);
      return;
    }

    let container = document.getElementById('cine-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cine-toast-container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1095';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-dark';
    toast.className = `toast show align-items-center text-white ${color} border-0`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button></div>`;
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3500);
  };

  window.CineApp = window.CineApp || {};
  window.CineApp.showToast = showToast;
  window.CineApp.escapeHtml = escapeHtml;
})();
