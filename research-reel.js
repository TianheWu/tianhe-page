(() => {
  'use strict';

  const reel = document.querySelector('#research-reel');
  const stage = reel.querySelector('.reel-stage');
  const canvas = stage.querySelector('canvas');
  const context = canvas.getContext('2d');
  const papers = [...document.querySelectorAll('#publication-list .paper')];
  if (!context || !papers.length) return;

  const buttons = [...reel.querySelectorAll('[data-collection]')];
  const title = reel.querySelector('.reel-title');
  const readLink = reel.querySelector('.reel-read');
  const subtitle = reel.querySelector('.reel-subtitle');
  const positionLabel = reel.querySelector('.reel-position');
  const venue = reel.querySelector('.reel-venue');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const textures = new Map();
  const bookmarks = new Map();
  const pad = value => String(value).padStart(2, '0');
  const wrap = (value, length) => ((value % length) + length) % length;
  let collection;
  let deck = [];
  let position = 0;
  let target = 0;
  let captionPaper;
  let frame = 0;
  let lastTime = 0;
  let inView = true;
  let drag;
  let wheelTimer;
  let wheelActive = false;

  // Build a flat piece of film once, then project it in narrow vertical strips.
  // Type and perforations bend with the cover along the same surface.
  function makeTexture(paper, index) {
    const texture = document.createElement('canvas');
    texture.width = 864;
    texture.height = 490;
    const ctx = texture.getContext('2d');
    const w = texture.width;
    const h = texture.height;
    const picture = { x: 8, y: 19, w: w - 16, h: h - 54 };

    ctx.fillStyle = '#272a24';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7b8175';
    ctx.fillRect(0, 0, w, 1);
    ctx.fillRect(0, h - 1, w, 1);
    for (let x = 10; x < w; x += 32) {
      ctx.fillStyle = '#a8a793';
      ctx.fillRect(x, 6, 12, 6);
    }
    ctx.fillStyle = '#343d37';
    ctx.fillRect(picture.x, picture.y, picture.w, picture.h);
    ctx.font = '15px monospace';
    ctx.fillStyle = '#e3c18b';
    ctx.fillText(pad(index + 1) + '   ' + paper.dataset.shortTitle.toUpperCase(), 12, h - 12);
    ctx.textAlign = 'right';
    ctx.fillText(paper.dataset.category.toUpperCase(), w - 12, h - 12);

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const scale = Math.min(picture.w / image.naturalWidth, picture.h / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      ctx.fillStyle = '#fff';
      ctx.fillRect(picture.x, picture.y, picture.w, picture.h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, picture.x + (picture.w - width) / 2, picture.y + (picture.h - height) / 2,
        width, height);
      requestFrame();
    };
    image.onerror = () => {
      image.onerror = null;
      image.src = paper.querySelector('.paper-figure img').src;
    };
    image.src = paper.dataset.cover;
    return texture;
  }

  function dimensions() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const pitch = Math.min(w * (w < 740 ? .72 : .45), h * 1.44);
    return { w, h, pitch };
  }

  function draw() {
    const { w, h, pitch } = dimensions();
    if (!w || !h) return;
    const pixelRatio = Math.min(2, devicePixelRatio * stage.getBoundingClientRect().width / w);
    const pixelW = Math.round(w * pixelRatio);
    const pixelH = Math.round(h * pixelRatio);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    context.setTransform(pixelW / w, 0, 0, pixelH / h, 0, 0);
    context.clearRect(0, 0, w, h);

    // Lateral compression, decreasing height, and a rising centerline make a
    // continuous curved screen. Each slice is sheared to its local tangent.
    function project(t) {
      const u = t * pitch / (w / 2);
      const depth = 1 / Math.sqrt(1 + .86 * u * u);
      const x = w / 2 * (1 + Math.asinh(1.12 * u) / 1.12);
      const height = pitch * 490 / 864 * depth;
      const center = h * .58 - (1 - depth) * h * .78;
      return { x, top: center - height / 2, height };
    }

    const first = Math.floor(position - 3);
    const last = Math.ceil(position + 3);
    const visible = new Set();
    for (let slot = first; slot <= last; slot++) {
      const start = slot - position - .5;
      if (project(start + 1).x < 0 || project(start).x > w) continue;
      const index = wrap(slot, deck.length);
      const paper = deck[index];
      visible.add(paper);
      if (!textures.has(paper)) textures.set(paper, makeTexture(paper, index));
      const texture = textures.get(paper);
      const slices = 72;
      let left = project(start);
      for (let i = 0; i < slices; i++) {
        const right = project(start + (i + 1) / slices);
        const width = right.x - left.x;
        context.save();
        context.transform(1, (right.top - left.top) / width, 0, 1, left.x, left.top);
        context.drawImage(texture, i * texture.width / slices, 0, texture.width / slices, texture.height,
          0, 0, width + .65, (left.height + right.height) / 2);
        context.restore();
        left = right;
      }
    }
    // Bound the bitmap cache even if a visitor browses every paper on mobile.
    if (textures.size > 8) {
      for (const paper of textures.keys()) if (!visible.has(paper)) textures.delete(paper);
    }
    context.globalCompositeOperation = 'source-atop';
    const shade = context.createLinearGradient(0, 0, w, 0);
    shade.addColorStop(0, 'rgba(7,12,10,.48)');
    shade.addColorStop(.32, 'rgba(7,12,10,.06)');
    shade.addColorStop(.5, 'rgba(7,12,10,0)');
    shade.addColorStop(.68, 'rgba(7,12,10,.06)');
    shade.addColorStop(1, 'rgba(7,12,10,.48)');
    context.fillStyle = shade;
    context.fillRect(0, 0, w, h);
    context.globalCompositeOperation = 'source-over';
  }

  function updateCaption() {
    const index = wrap(Math.round(position), deck.length);
    const paper = deck[index];
    if (paper === captionPaper) return;
    captionPaper = paper;
    const link = paper.querySelector('h3 a');
    const short = paper.dataset.shortTitle;
    const full = link.textContent.trim();
    title.textContent = short;
    title.href = readLink.href = link.href;
    title.setAttribute('aria-label', full);
    readLink.setAttribute('aria-label', 'Read ' + full);
    subtitle.textContent = full.startsWith(short + ': ') ? full.slice(short.length + 2) : full;
    if (full === short) subtitle.textContent = paper.querySelector('.paper-summary').textContent;
    positionLabel.textContent = pad(index + 1) + ' / ' + pad(deck.length);
    venue.textContent = paper.querySelector('.paper-venue').textContent;
  }

  function animate(time) {
    frame = 0;
    const dt = lastTime ? Math.min(time - lastTime, 48) : 16;
    lastTime = time;
    const delta = target - position;
    position += reduceMotion.matches || drag || wheelActive ? delta : delta * (1 - Math.exp(-dt / 75));
    if (Math.abs(target - position) < .001) position = target;
    updateCaption();
    draw();
    if (position !== target) requestFrame();
    else lastTime = 0;
  }

  function requestFrame() {
    if (!frame && inView && deck.length) frame = requestAnimationFrame(animate);
  }

  function snap(value) {
    clearTimeout(wheelTimer);
    wheelActive = false;
    target = Math.round(value);
    requestFrame();
  }

  function select(name) {
    if (collection === name) return;
    if (collection) bookmarks.set(collection, wrap(Math.round(target), deck.length));
    clearTimeout(wheelTimer);
    wheelActive = false;
    drag = null;
    stage.classList.remove('is-dragging');
    collection = name;
    deck = papers.filter(paper => paper.dataset.category === name);
    target = position = bookmarks.get(name) || 0;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.collection === name)));
    updateCaption();
    requestFrame();
  }

  function step(by) { snap(Math.round(target) + by); }
  function screenPitch() {
    const { w, pitch } = dimensions();
    return stage.getBoundingClientRect().width * pitch / w;
  }

  buttons.forEach(button => {
    button.querySelector('span').textContent = pad(papers.filter(paper => paper.dataset.category === button.dataset.collection).length);
    button.addEventListener('click', () => select(button.dataset.collection));
  });
  reel.querySelector('.reel-prev').addEventListener('click', () => step(-1));
  reel.querySelector('.reel-next').addEventListener('click', () => step(1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === 'Enter') title.click();
  });

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    clearTimeout(wheelTimer);
    wheelActive = false;
    target = position;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, moved: false };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(event.clientY - drag.y))) return;
    drag.moved = true;
    stage.classList.add('is-dragging');
    target = drag.start - dx / screenPitch();
    requestFrame();
  });
  function finishDrag(event) {
    if (drag?.id !== event.pointerId) return;
    const { moved, start, x } = drag;
    drag = null;
    stage.classList.remove('is-dragging');
    const swipe = (x - event.clientX) / screenPitch();
    if (event.type !== 'pointerup') return snap(target);
    if (moved) {
      // A short, deliberate swipe also turns one frame.
      const minimum = Math.abs(swipe) > .13 ? Math.round(start) + Math.sign(swipe) : Math.round(target);
      snap(swipe > 0 ? Math.max(minimum, Math.round(target)) : Math.min(minimum, Math.round(target)));
    } else {
      const rect = stage.getBoundingClientRect();
      const normX = (event.clientX - rect.left) / rect.width * 2 - 1;
      const offset = Math.sinh(normX * 1.12) / 1.12 * (rect.width / 2) / screenPitch();
      const clicked = Math.round(position + offset);
      if (clicked === Math.round(position)) title.click();
      snap(clicked);
    }
  }
  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', finishDrag);
  stage.addEventListener('lostpointercapture', finishDrag);
  stage.addEventListener('wheel', event => {
    if (event.ctrlKey || (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))) return;
    event.preventDefault();
    const delta = event.deltaX || event.deltaY;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? screenPitch() : 1;
    target += delta * unit / screenPitch();
    wheelActive = true;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => snap(target), 125);
    requestFrame();
  }, { passive: false });

  if ('IntersectionObserver' in window) {
    inView = false;
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) requestFrame();
    }, { rootMargin: '180px' }).observe(stage);
  }
  if ('ResizeObserver' in window) new ResizeObserver(requestFrame).observe(stage);
  window.addEventListener('resize', requestFrame, { passive: true });
  reel.hidden = false;
  select('understanding');
})();
