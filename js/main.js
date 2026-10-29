/**
 * ==============================================================================
 * CINESPOTS - MAIN WEBSITE SCRIPT (Necessary UI Script)
 * ==============================================================================
 * Provides essential interactive UI functionality for the CineSpots website:
 *  - YouTube trailer preview modal
 *  - Genre and status filter chips
 *  - Real-time catalog search
 *  - Password show / hide toggler
 *  - Payment method tab switching
 *  - Seat selection toggle & subtotal calculator
 *  - Promo code clipboard copier & toast feedback
 * ==============================================================================
 */

const CineUI = {
  /**
   * Initializes all required UI event listeners and components
   */
  init() {
    this.injectToastContainer();
    this.injectTrailerModal();
    this.bindFilterChips();
    this.bindSearchFilter();
    this.bindPasswordToggles();
    this.bindPaymentTabs();
    this.bindSeatSelection();
  },

  /**
   * Displays a modern toast notification on the top right
   * @param {string} message - Text message to show
   * @param {string} type - 'success', 'info', 'warning', 'danger'
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('cine-toast-container');
    if (!container) return;

    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'danger' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-dark text-white';

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 shadow-lg ${bgClass}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    container.appendChild(toastEl);
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
      bsToast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), 3500);
    }
  },

  /**
   * Creates toast container element if not already present
   */
  injectToastContainer() {
    if (document.getElementById('cine-toast-container')) return;
    const container = document.createElement('div');
    container.id = 'cine-toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1095';
    document.body.appendChild(container);
  },

  /**
   * Injects modal container for playing movie trailers
   */
  injectTrailerModal() {
    if (document.getElementById('trailerModal')) return;
    const modalEl = document.createElement('div');
    modalEl.id = 'trailerModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-0 shadow-lg overflow-hidden">
          <div class="modal-header border-secondary py-2 px-3">
            <h6 class="modal-title fw-bold text-truncate" id="trailerModalTitle">Movie Trailer</h6>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" onclick="CineUI.stopTrailer()"></button>
          </div>
          <div class="modal-body p-0 ratio ratio-16x9">
            <iframe id="trailerModalIframe" src="" title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Stop trailer on modal hide
    modalEl.addEventListener('hidden.bs.modal', () => {
      this.stopTrailer();
    });
  },

  /**
   * Opens the trailer modal with the given YouTube embed URL
   */
  openTrailer(url, title = 'Official Theatrical Trailer') {
    const iframe = document.getElementById('trailerModalIframe');
    const titleEl = document.getElementById('trailerModalTitle');
    if (iframe && titleEl) {
      let embedUrl = url;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      }
      iframe.src = embedUrl + (embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
      titleEl.textContent = title;
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('trailerModal'));
        modal.show();
      }
    }
  },

  /**
   * Clears the trailer iframe source to stop playback
   */
  stopTrailer() {
    const iframe = document.getElementById('trailerModalIframe');
    if (iframe) iframe.src = '';
  },

  /**
   * Copies promo coupon code to clipboard with toast notification
   */
  copyPromoCode(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.showToast(`Copied code ${code} to clipboard!`, 'success');
      });
    } else {
      this.showToast(`Code: ${code}`, 'info');
    }
  },

  /**
   * Binds genre and status filter chips
   */
  bindFilterChips() {
    const chips = document.querySelectorAll('.filter-chip[data-filter-genre], .filter-chip[data-filter-status], .filter-chip[data-facility]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Toggle active status in parent container
        const parent = chip.parentElement;
        parent.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const selectedGenre = chip.getAttribute('data-filter-genre');
        const selectedStatus = chip.getAttribute('data-filter-status');
        const selectedFacility = chip.getAttribute('data-facility');

        // Filter movie items if present
        if (selectedGenre !== null) {
          const items = document.querySelectorAll('.movie-item');
          items.forEach(item => {
            const genres = (item.getAttribute('data-genre') || '').toLowerCase();
            if (selectedGenre === 'all' || genres.includes(selectedGenre.toLowerCase())) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        }

        // Filter cinema items if present
        if (selectedFacility !== null) {
          const cinemas = document.querySelectorAll('.cinema-item');
          cinemas.forEach(cin => {
            const facilities = (cin.getAttribute('data-facilities') || '').toLowerCase();
            if (selectedFacility === 'all' || facilities.includes(selectedFacility.toLowerCase())) {
              cin.style.display = '';
            } else {
              cin.style.display = 'none';
            }
          });
        }
      });
    });
  },

  /**
   * Binds catalog search bar for real-time card filtering
   */
  bindSearchFilter() {
    const searchInputs = document.querySelectorAll('#catalog-search-input, #cinemas-search-input, #global-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const movieItems = document.querySelectorAll('.movie-item');
        const cinemaItems = document.querySelectorAll('.cinema-item');

        if (movieItems.length > 0) {
          movieItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
          });
        }

        if (cinemaItems.length > 0) {
          cinemaItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
          });
        }
      });
    });
  },

  /**
   * Binds show/hide password buttons
   */
  bindPasswordToggles() {
    const toggleBtns = document.querySelectorAll('#togglePasswordBtn, .btn-toggle-password');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.input-group').querySelector('input[type="password"], input[type="text"]');
        const icon = btn.querySelector('i');
        if (!input) return;

        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
          }
        }
      });
    });
  },

  /**
   * Binds payment method tab switching on payment.html
   */
  bindPaymentTabs() {
    const payTabs = document.querySelectorAll('[data-pay-tab]');
    payTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        payTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetTab = tab.getAttribute('data-pay-tab');
        document.querySelectorAll('.pay-method-panel').forEach(panel => {
          panel.classList.add('d-none');
        });

        const activePanel = document.getElementById('pay-panel-' + targetTab);
        if (activePanel) {
          activePanel.classList.remove('d-none');
        }
      });
    });
  },

  /**
   * Binds interactive seat selection on seat-selection.html
   */
  bindSeatSelection() {
    const seatGrid = document.getElementById('cinema-seating-grid');
    if (!seatGrid) return;

    const selectedSeatsLabel = document.getElementById('sidebar-seats-label');
    const seatsChipsContainer = document.getElementById('sidebar-seats-chips');
    const ticketsSubtotalEl = document.getElementById('sidebar-tickets-subtotal');
    const feesEl = document.getElementById('sidebar-fees-gst');
    const totalAmountEl = document.getElementById('sidebar-total-amount');
    const proceedBtn = document.getElementById('sidebar-proceed-btn');

    seatGrid.addEventListener('click', (e) => {
      const seat = e.target.closest('.seat-box');
      if (!seat || seat.classList.contains('occupied')) return;

      // Toggle selection
      seat.classList.toggle('selected');

      // Update selected list
      const selected = seatGrid.querySelectorAll('.seat-box.selected');
      const seatNames = [];
      let subtotal = 0;

      selected.forEach(s => {
        const name = s.getAttribute('data-seat-id') || s.textContent.trim();
        const price = parseInt(s.getAttribute('data-price') || '350', 10);
        seatNames.push(name);
        subtotal += price;
      });

      const fees = Math.round(subtotal * 0.18);
      const total = subtotal + (subtotal > 0 ? fees + 30 : 0);

      if (selectedSeatsLabel) {
        selectedSeatsLabel.textContent = seatNames.length > 0 ? `${seatNames.length} Seat(s)` : 'None Selected';
      }

      if (seatsChipsContainer) {
        seatsChipsContainer.innerHTML = seatNames.map(name => `<span class="badge bg-danger">${name}</span>`).join(' ');
      }

      if (ticketsSubtotalEl) ticketsSubtotalEl.textContent = `₹${subtotal}`;
      if (feesEl) feesEl.textContent = `₹${fees}`;
      if (totalAmountEl) totalAmountEl.textContent = `₹${total}`;

      if (proceedBtn) {
        proceedBtn.disabled = selected.length === 0;
      }
    });
  }
};

// Global shorthand
window.CineUI = CineUI;
window.CineApp = CineUI; // Backward compatibility for any inline calls

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CineUI.init();
});
