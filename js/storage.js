(function () {
  'use strict';

  const STORAGE_KEY = 'cinespots-demo-store-v1';
  const clone = value => JSON.parse(JSON.stringify(value));

  function readStore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = clone(window.CINE_DEFAULT_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }

    try {
      const store = JSON.parse(raw);
      if (!store || !Array.isArray(store.users) || !Array.isArray(store.cinemas) ||
          !Array.isArray(store.bookings) || !Array.isArray(store.shows)) {
        throw new Error('Stored demo data has an invalid structure.');
      }
      return store;
    } catch (error) {
      console.error('Unable to read CineSpots demo data.', error);
      throw error;
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  const CineStorage = {
    getUsers() { return readStore().users; },
    getUserById(id) { return this.getUsers().find(user => user.id === id) || null; },
    saveUser(user) {
      const store = readStore();
      const index = store.users.findIndex(item => item.id === user.id);
      if (index >= 0) store.users[index] = user;
      else store.users.push(user);
      writeStore(store);
    },
    getCinemas() { return readStore().cinemas; },
    saveCinema(cinema) {
      const store = readStore();
      const index = store.cinemas.findIndex(item => item.id === cinema.id);
      if (index >= 0) store.cinemas[index] = cinema;
      else store.cinemas.push(cinema);
      writeStore(store);
    },
    deleteCinema(id) {
      const store = readStore();
      store.cinemas = store.cinemas.filter(cinema => cinema.id !== id);
      writeStore(store);
    },
    getMovies() { return clone(readStore().movies); },
    saveMovie(movie) {
      const store = readStore();
      const index = store.movies.findIndex(item => item.id === movie.id);
      if (index >= 0) store.movies[index] = movie;
      else store.movies.push(movie);
      writeStore(store);
    },
    deleteMovie(id) {
      const store = readStore();
      store.movies = store.movies.filter(movie => movie.id !== id);
      writeStore(store);
    },
    getBookings() { return readStore().bookings; },
    getShows() { return readStore().shows; },
    saveShow(show) {
      const store = readStore();
      store.shows.push(show);
      writeStore(store);
    },
    resetToDefaults() {
      writeStore(clone(window.CINE_DEFAULT_DATA));
    }
  };

  window.CineStorage = CineStorage;
})();
