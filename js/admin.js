(function () {
  'use strict';

  const escapeHtml = window.CineApp.escapeHtml;
  const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const statusBadge = status => `<span class="badge-status ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
  const cityNames = {
    mumbai: 'Mumbai, MH', delhi: 'Delhi-NCR, DL', bengaluru: 'Bengaluru, KA',
    hyderabad: 'Hyderabad, TG', chennai: 'Chennai, TN', kolkata: 'Kolkata, WB',
    pune: 'Pune, MH', ahmedabad: 'Ahmedabad, GJ'
  };

  function findMovie(id) {
    return window.CineStorage.getMovies().find(movie => movie.id === id);
  }

  function findCinema(id) {
    return window.CineStorage.getCinemas().find(cinema => cinema.id === id);
  }

  function initUsersPage() {
    const body = document.getElementById('admin-users-tbody');
    const search = document.getElementById('admin-users-search');
    const render = () => {
      const query = (search.value || '').trim().toLowerCase();
      const users = window.CineStorage.getUsers().filter(user =>
        [user.id, user.name, user.email, user.phone, user.role, user.status].join(' ').toLowerCase().includes(query)
      );
      body.innerHTML = users.length ? users.map(user => `
        <tr>
          <td><code>${escapeHtml(user.id)}</code></td>
          <td><div class="fw-bold text-dark">${escapeHtml(user.name)}</div><div class="small text-muted text-capitalize">${escapeHtml(user.role)}</div></td>
          <td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.phone || 'N/A')}</td>
          <td>${escapeHtml(user.registeredAt || '—')}</td><td>${statusBadge(user.status || 'active')}</td>
          <td class="text-end"><button class="btn btn-sm ${user.status === 'disabled' ? 'btn-outline-success' : 'btn-outline-danger'}" data-user-status="${escapeHtml(user.id)}">${user.status === 'disabled' ? 'Activate' : 'Deactivate'}</button></td>
        </tr>`).join('') : '<tr><td colspan="7" class="text-center text-muted py-4">No matching users found.</td></tr>';
      body.querySelectorAll('[data-user-status]').forEach(button => button.addEventListener('click', () => {
        const user = window.CineStorage.getUserById(button.dataset.userStatus);
        if (!user) return;
        user.status = user.status === 'disabled' ? 'active' : 'disabled';
        window.CineStorage.saveUser(user);
        render();
      }));
    };
    search.addEventListener('input', render);
    render();
  }

  function initMoviesPage() {
    const body = document.getElementById('admin-movies-tbody');
    const render = () => {
      const movies = window.CineStorage.getMovies();
      body.innerHTML = movies.map(movie => `
        <tr>
          <td><img src="${escapeHtml(movie.poster.startsWith('http') ? movie.poster : `../${movie.poster.replace(/^\.\//, '')}`)}" alt="${escapeHtml(movie.title)} poster" class="rounded" style="width: 42px; height: 60px; object-fit: cover;"></td>
          <td><div class="fw-bold text-dark">${escapeHtml(movie.title)}</div><div class="small text-muted">${escapeHtml(movie.director || 'Director TBA')}</div></td>
          <td>${escapeHtml((movie.genre || []).join(', '))}</td><td>${escapeHtml(movie.duration)}</td>
          <td>${escapeHtml(movie.certificate || '—')}</td><td>★ ${escapeHtml(movie.rating)}</td>
          <td>${statusBadge(movie.status || 'now_showing')}</td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-delete-movie="${escapeHtml(movie.id)}">Remove</button></td>
        </tr>`).join('');
      body.querySelectorAll('[data-delete-movie]').forEach(button => button.addEventListener('click', () => {
        window.CineStorage.deleteMovie(button.dataset.deleteMovie);
        render();
      }));
    };

    window.CineAdmin.renderMovies = render;
    render();
  }

  function handleAddMovie() {
    const title = document.getElementById('modal-movie-title').value.trim();
    const director = document.getElementById('modal-movie-director').value.trim();
    const duration = document.getElementById('modal-movie-duration').value.trim();
    const genres = document.getElementById('modal-movie-genres').value.split(',').map(value => value.trim()).filter(Boolean);
    const status = document.getElementById('modal-movie-status').value;
    const synopsis = document.getElementById('modal-movie-synopsis').value.trim();
    const poster = document.getElementById('modal-movie-poster').value.trim() || './assets/images/poster_sandhurst.jpg';
    const normalizedPoster = poster.startsWith('../assets/') ? `./assets/${poster.slice('../assets/'.length)}` : poster;
    const movie = {
      id: `mov-${Date.now()}`, title, director, duration, genre: genres, status,
      synopsis: synopsis || 'Synopsis to be announced.', rating: 0, votes: '0',
      releaseDate: null, certificate: 'UA', cast: [], language: 'English',
      poster: normalizedPoster,
      backdrop: normalizedPoster,
      trailerUrl: ''
    };
    window.CineStorage.saveMovie(movie);
    document.querySelector('#addMovieModal form').reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addMovieModal')).hide();
    window.CineApp.showToast('Movie added to the catalog.', 'success');
    initMoviesPage();
  }

  function initCinemasPage() {
    const body = document.getElementById('admin-cinemas-tbody');
    const providerSelect = document.getElementById('modal-cinema-provider');
    const providers = window.CineStorage.getUsers().filter(user => user.role === 'provider');
    providerSelect.innerHTML = providers.map(provider => `<option value="${escapeHtml(provider.id)}">${escapeHtml(provider.organization || provider.name)}</option>`).join('');
    const render = () => {
      body.innerHTML = window.CineStorage.getCinemas().map(cinema => {
        const provider = window.CineStorage.getUserById(cinema.providerId);
        return `<tr><td><code>${escapeHtml(cinema.id)}</code></td><td><div class="fw-bold text-dark">${escapeHtml(cinema.name)}</div><div class="small text-muted">${escapeHtml(cinema.location)}</div></td><td>${escapeHtml(cityNames[cinema.city] || cinema.city)}</td><td>${escapeHtml(provider ? provider.organization || provider.name : 'Unassigned')}</td><td>${escapeHtml(cinema.screens)}</td><td>★ ${escapeHtml(cinema.rating)}</td><td class="text-end"><button class="btn btn-sm btn-outline-danger" data-delete-cinema="${escapeHtml(cinema.id)}">Remove</button></td></tr>`;
      }).join('');
      body.querySelectorAll('[data-delete-cinema]').forEach(button => button.addEventListener('click', () => {
        window.CineStorage.deleteCinema(button.dataset.deleteCinema);
        render();
      }));
    };
    window.CineAdmin.renderCinemas = render;
    render();
  }

  function handleAddCinema() {
    const providerId = document.getElementById('modal-cinema-provider').value;
    const cinema = {
      id: `cin-${Date.now()}`,
      name: document.getElementById('modal-cinema-name').value.trim(),
      city: document.getElementById('modal-cinema-city').value,
      location: document.getElementById('modal-cinema-location').value.trim(),
      providerId, screens: 6, rating: 0, facilities: []
    };
    window.CineStorage.saveCinema(cinema);
    const provider = window.CineStorage.getUserById(providerId);
    if (provider) {
      provider.assignedCinemas = provider.assignedCinemas || [];
      provider.assignedCinemas.push(cinema.id);
      window.CineStorage.saveUser(provider);
    }
    document.querySelector('#addCinemaModal form').reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addCinemaModal')).hide();
    window.CineApp.showToast('Cinema added to the network.', 'success');
    initCinemasPage();
  }

  function initBookingsPage() {
    const body = document.getElementById('admin-bookings-tbody');
    const search = document.getElementById('admin-booking-search');
    const render = () => {
      const query = (search.value || '').trim().toLowerCase();
      const bookings = window.CineStorage.getBookings().filter(booking => {
        const cinema = findCinema(booking.cinemaId);
        const movie = findMovie(booking.movieId);
        return [booking.id, booking.customerName, booking.email, cinema && cinema.name, movie && movie.title].join(' ').toLowerCase().includes(query);
      });
      body.innerHTML = bookings.length ? bookings.map(booking => {
        const cinema = findCinema(booking.cinemaId);
        const movie = findMovie(booking.movieId);
        return `<tr><td><code>${escapeHtml(booking.id)}</code></td><td><div class="fw-bold">${escapeHtml(booking.customerName)}</div><div class="small text-muted">${escapeHtml(booking.email)}</div></td><td><div>${escapeHtml(cinema ? cinema.name : 'Cinema unavailable')}</div><div class="small text-muted">${escapeHtml(movie ? movie.title : 'Movie unavailable')}</div></td><td>${escapeHtml(booking.showDate)}<br><span class="small text-muted">${escapeHtml(booking.showTime)}</span></td><td>${escapeHtml((booking.seats || []).join(', '))} (${(booking.seats || []).length})</td><td class="fw-bold">${money(booking.total)}</td><td>${statusBadge(booking.status)}</td><td>${escapeHtml(booking.paymentType)}</td></tr>`;
      }).join('') : '<tr><td colspan="8" class="text-center text-muted py-4">No matching bookings found.</td></tr>';
    };
    search.addEventListener('input', render);
    render();
  }

  function initDashboardPage() {
    const users = window.CineStorage.getUsers();
    const cinemas = window.CineStorage.getCinemas();
    const bookings = window.CineStorage.getBookings();
    const movies = window.CineStorage.getMovies();
    const shows = window.CineStorage.getShows();
    const confirmed = bookings.filter(booking => booking.status === 'confirmed');
    document.getElementById('kpi-total-revenue').textContent = money(confirmed.reduce((total, booking) => total + Number(booking.total || 0), 0));
    document.getElementById('kpi-total-users').textContent = users.filter(user => user.role === 'customer').length;
    document.getElementById('kpi-total-cinemas').textContent = cinemas.length;
    document.getElementById('kpi-total-providers').textContent = users.filter(user => user.role === 'provider').length;
    document.getElementById('kpi-total-movies').textContent = movies.length;
    document.getElementById('kpi-active-shows').textContent = shows.length;
    const recent = document.getElementById('admin-recent-bookings-tbody');
    recent.innerHTML = bookings.slice(0, 5).map(booking => {
      const cinema = findCinema(booking.cinemaId);
      const movie = findMovie(booking.movieId);
      return `<tr><td><code>${escapeHtml(booking.id)}</code></td><td><strong>${escapeHtml(booking.customerName)}</strong><br><span class="text-muted small">${escapeHtml(booking.email)}</span></td><td>${escapeHtml(cinema ? cinema.name : '—')}<br><span class="small text-muted">${escapeHtml(movie ? movie.title : '—')}</span></td><td>${escapeHtml((booking.seats || []).join(', '))} (${(booking.seats || []).length})</td><td class="fw-bold">${money(booking.total)}</td><td>${statusBadge(booking.status)}</td></tr>`;
    }).join('');
  }

  function exportBookingsCSV() {
    const bookings = window.CineStorage.getBookings();
    const rows = [['Booking ID', 'Customer', 'Email', 'Cinema', 'Movie', 'Date', 'Time', 'Seats', 'Amount', 'Status', 'Payment']];
    bookings.forEach(booking => rows.push([
      booking.id, booking.customerName, booking.email,
      (findCinema(booking.cinemaId) || {}).name || '',
      (findMovie(booking.movieId) || {}).title || '',
      booking.showDate, booking.showTime, (booking.seats || []).join(' '),
      booking.total, booking.status, booking.paymentType
    ]));
    const csv = rows.map(row => row.map(value => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinespots-bookings.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  window.CineAdmin = {
    initUsersPage, initMoviesPage, initCinemasPage, initBookingsPage, initDashboardPage,
    handleAddMovie, handleAddCinema, exportBookingsCSV
  };
})();
