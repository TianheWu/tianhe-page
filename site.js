(() => {
  'use strict';

  const publications = document.getElementById('publications');
  const papers = [...publications.querySelectorAll('.paper')];
  const controls = publications.querySelector('.publication-controls');
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  const resultCount = document.getElementById('result-count');
  const showAll = document.getElementById('show-all');

  function matchesFilter(paper, filter) {
    return filter === 'all' || filter === paper.dataset.group || filter === paper.dataset.category;
  }

  function applyFilter(filter) {
    let count = 0;
    for (const paper of papers) {
      paper.hidden = !matchesFilter(paper, filter);
      if (!paper.hidden) count += 1;
    }

    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }
    resultCount.textContent = String(count).padStart(2, '0') + ' / ' + papers.length;
    showAll.hidden = filter === 'all';
  }

  function publicationTarget(hash) {
    if (hash === '#publications') return publications;
    if (!hash.startsWith('#paper-')) return null;
    const paper = document.getElementById(hash.slice(1));
    return papers.includes(paper) ? paper : null;
  }

  for (const button of buttons) {
    const filter = button.dataset.filter;
    const count = papers.filter(paper => matchesFilter(paper, filter)).length;
    button.querySelector('span').textContent = String(count).padStart(2, '0');
    button.addEventListener('click', () => applyFilter(filter));
  }

  showAll.textContent = 'Explore all ' + papers.length + ' publications';
  showAll.addEventListener('click', () => {
    applyFilter('all');
    controls.querySelector('[data-filter="all"]').focus({ preventScroll: true });
    publications.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  });

  // Reveal the destination before the browser follows a link, including repeat clicks on the same hash.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (link && publicationTarget(link.hash)) applyFilter('all');
  });

  window.addEventListener('hashchange', () => {
    const target = publicationTarget(location.hash);
    if (target) {
      applyFilter('all');
      target.scrollIntoView({ behavior: 'instant' });
    }
  });

  const initialTarget = publicationTarget(location.hash);
  applyFilter(initialTarget ? 'all' : 'selected');
  controls.hidden = false;
  if (initialTarget) initialTarget.scrollIntoView({ behavior: 'instant' });
})();
