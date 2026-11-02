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

  const citationLinks = [...document.querySelectorAll('[data-citation]')];
  const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Hong_Kong' });

  function updateCitationStatus() {
    const dates = citationLinks.map(link => Date.parse(link.dataset.updated)).filter(Number.isFinite);
    if (!dates.length) return;
    const oldest = Math.min(...dates);
    const latest = Math.max(...dates);
    const stale = Date.now() - oldest > 7 * 24 * 60 * 60 * 1000;
    const range = dateFormatter.format(oldest) === dateFormatter.format(latest)
      ? dateFormatter.format(latest)
      : `${dateFormatter.format(oldest)} – ${dateFormatter.format(latest)}`;
    document.querySelector('#citation-status').textContent = stale
      ? `Google Scholar · cached ${range} · latest counts on Scholar ↗`
      : `Google Scholar · updated ${range} · syncs daily`;
    citationLinks.forEach(link => {
      const updated = Date.parse(link.dataset.updated);
      link.classList.toggle('is-stale', Number.isFinite(updated) && Date.now() - updated > 7 * 86400000);
    });
  }

  function applyCitations(data) {
    if (data?.source !== 'Google Scholar' || !data.publications) return;
    citationLinks.forEach(link => {
      const entry = data.publications[link.dataset.citation];
      if (!entry || !Number.isSafeInteger(entry.count) || entry.count < 0) return;
      const timestamp = Date.parse(entry.updated_at);
      const previous = Date.parse(link.dataset.updated);
      if (!Number.isFinite(timestamp) || (Number.isFinite(previous) && timestamp < previous)) return;
      let url;
      try { url = new URL(entry.url); } catch { return; }
      if (url.protocol !== 'https:' || url.hostname !== 'scholar.google.com') return;
      link.href = url.href;
      link.textContent = `Cited by ${entry.count.toLocaleString('en-US')}${entry.estimated ? '*' : ''} ↗`;
      link.dataset.updated = entry.updated_at;
      link.title = `Google Scholar · updated ${dateFormatter.format(timestamp)}${entry.estimated ? ' · estimated by Scholar' : ''}`;
    });
    updateCitationStatus();
  }

  async function refreshCitations(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      if (response.ok) applyCitations(await response.json());
    } catch {
      // The static HTML already contains the last verified counts and dates.
    } finally {
      clearTimeout(timeout);
    }
  }

  updateCitationStatus();
  if (location.protocol !== 'file:') {
    refreshCitations('data/citations.json');
    // GitHub Pages does not rebuild after a GITHUB_TOKEN commit. Read the latest
    // cache directly on the production site; keep localhost previews independent.
    if (location.hostname === 'tianhewu.github.io') {
      refreshCitations('https://raw.githubusercontent.com/TianheWu/tianhe-page/master/data/citations.json');
    }
  }
})();
