(() => {
  'use strict';
  const papers = [...document.querySelectorAll('.paper')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const showAll = document.querySelector('#show-all');

  function filterPublications(group) {
    let count = 0;
    papers.forEach(paper => {
      paper.hidden = group !== 'all' && paper.dataset.group !== group;
      if (!paper.hidden) count += 1;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === group)));
    document.querySelector('#result-count').textContent = `${String(count).padStart(2, '0')} / ${papers.length}`;
    showAll.hidden = group === 'all';
  }

  document.querySelector('.publication-controls').hidden = false;
  buttons.forEach(button => button.addEventListener('click', () => filterPublications(button.dataset.filter)));
  showAll.addEventListener('click', () => {
    filterPublications('all');
    const allButton = document.querySelector('[data-filter="all"]');
    allButton.focus({ preventScroll: true });
    document.querySelector('#research').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  const linkedPaper = document.getElementById(location.hash.slice(1));
  filterPublications(linkedPaper?.classList.contains('paper') ? 'all' : 'selected');
  window.addEventListener('hashchange', () => {
    const paper = document.getElementById(location.hash.slice(1));
    if (paper?.classList.contains('paper')) {
      filterPublications('all');
      paper.scrollIntoView();
    }
  });

})();
