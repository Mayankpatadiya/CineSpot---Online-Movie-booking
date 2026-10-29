(function () {
  'use strict';

  const movieId = new URLSearchParams(window.location.search).get('id') || 'mov-1';
  const sourceMovie = movieId === 'batman-part-2'
    ? {
        ...CINE_MOVIES.find(movie => movie.id === 'mov-5'),
        title: 'The Batman: Part II',
        genre: ['Action', 'Crime'],
        rating: 8.5,
        votes: 'Coming soon',
        duration: 'To be announced',
        releaseDate: null,
        certificate: 'Not rated',
        synopsis: 'A new chapter in Gotham City is coming soon. Story and cast details have not yet been announced.',
        cast: []
      }
    : CINE_MOVIES.find(movie => movie.id === movieId);
  const titleOverrides = {
    'mov-4': 'Interstellar (10th Anniv.)',
    'mov-6': 'Spider-Man: Across Spider-Verse',
    'mov-9': 'Wicked: Part One'
  };
  const selectedMovie = sourceMovie
    ? { ...sourceMovie, title: titleOverrides[movieId] || sourceMovie.title }
    : null;

  if (!selectedMovie) {
    document.title = 'Movie Not Found - CineSpots';
    document.querySelector('main')?.remove();
    const message = document.createElement('main');
    message.className = 'container py-5 text-center';
    const heading = document.createElement('h1');
    heading.className = 'h3 fw-bold';
    heading.textContent = 'Movie not found';
    const link = document.createElement('a');
    link.href = 'movies.html';
    link.className = 'btn btn-cine-primary mt-3';
    link.textContent = 'Browse movies';
    message.append(heading, link);
    document.body.append(message);
    return;
  }

  const imagePath = path => path.startsWith('./') ? `../${path.slice(2)}` : path;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  document.title = `${selectedMovie.title} - Movie Details - CineSpots`;
  setText('detail-title', selectedMovie.title);
  setText('detail-breadcrumb-title', selectedMovie.title);
  setText('detail-rating', selectedMovie.rating);
  setText('detail-votes', `(${selectedMovie.votes} votes)`);
  setText('detail-duration', selectedMovie.duration);
  setText('detail-language', selectedMovie.language);
  setText('detail-certificate', selectedMovie.certificate);
  setText('detail-release', selectedMovie.releaseDate
    ? `Released ${new Date(`${selectedMovie.releaseDate}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : 'Release date to be announced');
  setText('detail-synopsis', selectedMovie.synopsis);
  setText('detail-director', selectedMovie.director || 'To be announced');

  const poster = document.getElementById('detail-poster');
  poster.src = imagePath(selectedMovie.poster);
  poster.alt = `${selectedMovie.title} poster`;

  const backdrop = document.getElementById('detail-backdrop');
  backdrop.src = imagePath(selectedMovie.backdrop || selectedMovie.poster);
  backdrop.alt = `${selectedMovie.title} backdrop`;

  const genres = document.getElementById('detail-genres');
  genres.replaceChildren(...selectedMovie.genre.map(genre => {
    const badge = document.createElement('span');
    badge.className = 'badge bg-dark border border-secondary';
    badge.textContent = genre;
    return badge;
  }));

  const cast = document.getElementById('detail-cast');
  cast.replaceChildren();
  if (selectedMovie.cast.length) {
    selectedMovie.cast.forEach(actor => {
      const column = document.createElement('div');
      column.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
      const card = document.createElement('div');
      card.className = 'card p-2 text-center border-subtle bg-white h-100';
      const name = document.createElement('div');
      name.className = 'fw-bold text-dark small';
      name.textContent = actor.name;
      const role = document.createElement('div');
      role.className = 'text-muted';
      role.style.fontSize = '0.75rem';
      role.textContent = actor.role;
      card.append(name, role);
      column.append(card);
      cast.append(column);
    });
  } else {
    const message = document.createElement('p');
    message.className = 'text-muted small';
    message.textContent = 'Cast details have not been announced.';
    cast.append(message);
  }

  const trailerButton = document.getElementById('detail-trailer-button');
  if (trailerButton && selectedMovie.trailerUrl) {
    trailerButton.onclick = () => window.CineUI.openTrailer(
      selectedMovie.trailerUrl,
      `${selectedMovie.title} - Official Trailer`
    );
  } else if (trailerButton) {
    trailerButton.hidden = true;
  }
})();
