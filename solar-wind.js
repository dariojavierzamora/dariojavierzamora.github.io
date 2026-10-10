(() => {
  const card = document.querySelector('#space');
  if (!card) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'solar-wind-particles';
  canvas.setAttribute('aria-hidden', 'true');
  card.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = false, last = 0;
  const particles = Array.from({length: 55}, () => ({x: Math.random(), y: Math.random(), speed: .035 + Math.random() * .065, size: .6 + Math.random() * 1.1}));
  const resize = () => {
    width = card.clientWidth; height = card.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = time => {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) {last = 0; return;}
    const dt = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x = (p.x + dt * p.speed) % 1;
      const y = (p.y + Math.sin(p.x * 8 + p.y * 12) * .035) * height;
      const x = p.x * width;
      ctx.strokeStyle = p.x < .55 ? 'rgba(255,191,99,.48)' : 'rgba(102,222,255,.48)';
      ctx.lineWidth = p.size;
      ctx.beginPath(); ctx.moveTo(x - 12 * p.size, y); ctx.lineTo(x, y); ctx.stroke();
    });
    frame = requestAnimationFrame(draw);
  };
  const sync = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, width, height);
  };
  new ResizeObserver(resize).observe(card);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}).observe(card);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  resize();
})();
