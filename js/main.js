import { animate, splitText, onScroll } from '../vendor/anime.esm.min.js';
import { EASE, stag, stagCenter, enter, leave } from './anim.js?v=9cbaf4c9';
import { projects, SW_PATH, banners, stackHolos } from './data.js?v=3b960ce6';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Phones: wider field of view + narrower room so walls and artworks stay on screen
const narrowMQ = matchMedia('(max-width: 699px)');
const narrow = narrowMQ.matches;
narrowMQ.addEventListener('change', () => location.reload());
const P = narrow ? 420 : 700;
const world = $('.world');
$('.viewport').style.perspective = P + 'px';

/* Plain project overview (non-3D): rendered from the same data, before the reveal targets are collected */
const projGrid = $('.proj-grid');
if (projGrid) {
  projGrid.innerHTML = projects.map((p, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `<li class="proj-item"><button type="button" class="proj-card" data-i="${i}" aria-label="Projekt ${n}: ${p.title} - Details öffnen"><span class="proj-in">
      <span class="proj-art">${banners[i]}</span>
      <span class="proj-meta"><span class="proj-num">${n}</span><span class="proj-cat">${p.cat}</span></span>
      <span class="proj-title">${p.title}</span>
      <span class="proj-tag">${p.tag}</span>
      <span class="proj-sum">${p.summary}</span>
      <span class="proj-more" aria-hidden="true">Details <span class="proj-arrow">→</span></span>
    </span></button></li>`;
  }).join('');
  projGrid.addEventListener('click', e => {
    const b = e.target.closest('.proj-card');
    if (b) openProject(+b.dataset.i);
  });
}

/* Phones: only the first PROJ_SHOWN cards are visible (CSS), the button opens the rest.
   Collapsing keeps the button under the finger instead of leaving the visitor far down the page. */
const PROJ_SHOWN = 4;
const projToggle = $('.proj-toggle');
if (projToggle && projects.length <= PROJ_SHOWN) projToggle.parentElement.remove();   // nothing to unfold
else if (projGrid && projToggle) {
  const label = open => (open ? 'Weniger anzeigen' : `Alle ${projects.length} Projekte anzeigen`);
  projToggle.textContent = label(false);
  projToggle.addEventListener('click', () => {
    const open = !projGrid.classList.contains('is-open');
    const before = projToggle.getBoundingClientRect().top;
    projGrid.classList.toggle('is-open', open);
    projToggle.setAttribute('aria-expanded', String(open));
    projToggle.textContent = label(open);
    if (open) {
      enter([...projGrid.children].slice(PROJ_SHOWN), { opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' },
        { delay: stag(70), duration: 700, ease: EASE.out4 });
    } else {
      scrollBy(0, projToggle.getBoundingClientRect().top - before);
    }
  });
}

/* ------------------------------------------------------------------
   Scene construction - flat divs placed in 3D space
------------------------------------------------------------------- */
const fogEls = [];
const planeTf = ({ x = 0, y = 0, z = 0, rx = 0, ry = 0, s = 1 }, rz = 0) =>
  `translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s}) rotateZ(${rz}deg) translate(-50%,-50%)`;
function plane(o) {
  const { w, h, z = 0, cls = '', html = '', fog = true } = o;
  const el = document.createElement('div');
  el.className = 'p ' + cls;
  el.style.cssText = `width:${w}px;height:${h}px;transform:${planeTf(o, o.rz || 0)}`;
  el.innerHTML = html;
  world.appendChild(el);
  // near: how close (in dist units) a surface may come before it is culled. Centred, screen-filling vortex discs
  // must go early: if they re-appear right in front of the eye (scrolling back), Chrome rasterises them gigantic.
  // Phones: the exhibits hang close to the centre line, so they dissolve just before they reach the eye. A surface that
  // close would otherwise be rasterised larger than a phone GPU allows (it then pops out of view on its own).
  // fade = length of the dissolve in front of `near` (0 = hard cut, which only ever happens off screen).
  if (fog) fogEls.push({ el, z, o: -1, v: true, near: cls === 'vortex' ? -380 : narrow ? -250 : -700, fade: cls === 'vortex' ? 380 : narrow ? 220 : 0 });
  return el;
}

// No walls any more: the exhibits float in open space (starfield canvas behind the 3D world)
// Phones: exhibits smaller, closer to the flight path and turned further towards the viewer, so a whole poster fits a portrait screen
const W = narrow ? 460 : 1100, G_END = -2600;
const EX_ANGLE = narrow ? 58 : 72;   // exhibits turned slightly towards the flight path → easier to read while floating past
const EX_SCALE = narrow ? .72 : 1;

// Phones: the exhibits hang close to the centre line. They must all start BEHIND the title panel (z -520), otherwise the
// first one slides in front of the name and hides some of its letters.
const frameZ = narrow ? [-680, -1140, -1600, -2060] : [-150, -750, -1350, -1950];
projects.forEach((p, i) => {
  const left = i % 2 === 0;
  const z = frameZ[Math.floor(i / 2)] - (left ? 0 : narrow ? 230 : 300);
  const n = String(i + 1).padStart(2, '0');
  const fr = plane({
    w: 480, h: 540, x: left ? -W / 2 + 4 : W / 2 - 4, y: -36, z, ry: left ? EX_ANGLE : -EX_ANGLE, s: EX_SCALE, cls: 'frame',
    html: `<div class="lamp"></div>
           <div class="fbox"><div class="mat">${banners[i]}</div></div>
           <div class="plaque"><small>${p.cat}</small><strong>${p.title}</strong><span>${p.tag} · Details ↗</span></div>
           <div class="plaque-no">${n}</div>`,
  });
  fr.dataset.index = i;
  fr.setAttribute('role', 'button');
  fr.setAttribute('tabindex', '0');
  fr.setAttribute('aria-label', `Projekt ${n}: ${p.title} - Details öffnen`);
});

/* Posters → bitmaps. Inline SVG in a 3D layer is re-rasterised (vector, expensive) whenever its on-screen scale
   changes - after a big scroll jump that stalled integrated GPUs for seconds. A bitmap just gets resampled.
   The page fonts are embedded into each SVG so the bitmap looks identical. Falls back to inline SVG on any error. */
async function bitmapPosters() {
  try {
    // embed the self-hosted fonts as data URIs (an SVG-as-image cannot load external files)
    const toData = async url => {
      const blob = await (await fetch(url)).blob();
      return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    };
    const [sg, jb] = await Promise.all([toData('vendor/fonts/space-grotesk-latin.woff2'), toData('vendor/fonts/jetbrains-mono-latin.woff2')]);
    const fontCss =
      `@font-face{font-family:"Space Grotesk";font-weight:300 700;src:url(${sg}) format("woff2")}` +
      `@font-face{font-family:"JetBrains Mono";font-weight:100 800;src:url(${jb}) format("woff2")}`;
    const W2 = 672, H2 = 532;   // 2× the passe-partout opening → crisp when viewed up close
    const frames = $$('.frame');
    for (let i = 0; i < banners.length; i++) {
      const src = banners[i].replace(/^<svg ([^>]*)>/, `<svg $1 width="${W2}" height="${H2}"><style>${fontCss}</style>`);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
      await img.decode();
      const c = document.createElement('canvas'); c.width = W2; c.height = H2;
      c.getContext('2d').drawImage(img, 0, 0, W2, H2);
      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const bmp = new Image(); bmp.className = 'poster'; bmp.alt = ''; bmp.decoding = 'async';
      bmp.src = URL.createObjectURL(blob);
      await bmp.decode();
      frames[i].querySelector('.mat').replaceChildren(bmp);
      await new Promise(r => setTimeout(r, 0));   // yield between posters
    }
  } catch (err) { /* keep the inline SVG posters */ }
}

const HERO_Z = -520;
const hero = plane({
  w: narrow ? 520 : 940, h: narrow ? 480 : 400, y: -40, z: HERO_Z, s: narrow ? 1.3 : 1, cls: narrow ? 'hero hero-narrow' : 'hero', fog: false,
  html: `<div class="hero-kicker">PORTFOLIO</div>
         <h1 class="hero-title"><span class="hl">LEON</span> <span class="hl">ILLENSEER</span></h1>
         <div class="hero-sub">Full-Stack-Entwickler · Shopware 6 · E-Commerce</div>`,
});

// Portal: a tunnel of fine ring discs one behind the other, each turning slowly at its own speed while you scroll
const T_START = G_END, T_END = -6000;
const vortices = [];
for (let z = T_START - 300, i = 0; z > T_END + 200; z -= 420, i++) {
  const geo = { z, s: 1, base: i * 47, dir: i % 2 ? 1 : -1, speed: .006 + (i % 3) * .003 };
  const el = plane({ w: 1300, h: 1300, z, rz: geo.base, cls: 'vortex' });
  vortices.push({ el, geo, rz: NaN });
}
// ring texture (thin concentric lines, a few accent arcs, a tick scale), drawn once on a canvas → PNG
// (cheap to composite, never re-rasterised). Deliberately calm and muted: a precise instrument, not a light show.
function makeVortexTexture() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.translate(S / 2, S / 2);
  g.lineCap = 'round';
  const ring = (r, a0, a1, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke(); };
  for (let i = 0; i < 8; i++) ring(180 + i * 40, 0, Math.PI * 2, 1.5, `rgba(222,218,236,${(.2 - i * .018).toFixed(3)})`);
  for (let i = 0; i < 5; i++) {   // accent arcs, one per ring band
    const a0 = i * 1.37;
    ring(200 + i * 60, a0, a0 + .45 + (i % 3) * .25, 3, `rgba(182,156,255,${(.5 - i * .07).toFixed(2)})`);
  }
  g.strokeStyle = 'rgba(222,218,236,.22)'; g.lineWidth = 1.5;
  for (let i = 0; i < 120; i++) {   // outer tick scale, every 10th tick longer
    const a = i / 120 * Math.PI * 2, r1 = 488, r2 = i % 10 ? 498 : 510;
    g.beginPath(); g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); g.stroke();
  }
  c.toBlob(b => {
    const url = `url(${URL.createObjectURL(b)})`;
    vortices.forEach(v => (v.el.style.backgroundImage = url));
  });
}
makeVortexTexture();
// Furthest surface goes first in the DOM so it never paints over nearer text if Chrome's 3D sort falls back to DOM order
world.prepend(plane({ w: 1500, h: 1500, z: T_END, cls: 'light', fog: false }));

// Stack labels: counter-rotated every frame against the tunnel spin so the text always stays horizontal
const holos = stackHolos.map(([k, v], i) => {
  // phones: sized so the longest label is still inside the screen when it fades out, and started a little later so the
  // first label does not appear while the last exhibits (which pass close to the centre there) are still in view
  const z = narrow ? -3300 - i * 450 : -3000 - i * 480, geo = { z, s: narrow ? .7 : .5 };
  const logo = v.startsWith('SHOPWARE') ? `<span class="sw-chip"><svg viewBox="0 0 68.8 68.8" aria-hidden="true"><path d="${SW_PATH}" fill="#0069FC"/></svg></span>` : '';
  const el = plane({ w: 900, h: 260, ...geo, cls: 'holo', fog: false, html: `<small>${k}</small><strong>${logo}${v}</strong>` });
  return { el, z, geo, o: -1, rz: NaN };
});

/* ------------------------------------------------------------------
   Starfield: a 2D canvas behind the 3D world, projected with the same camera (depth, roll, mouse tilt).
   Stars wrap around in depth, so the flight through the galaxy never ends. Redrawn only when the camera moves.
------------------------------------------------------------------- */
const starCv = $('.stars'), sctx = starCv.getContext('2d');
const STAR_R = 4200, stars = [];
for (let i = 0, n = narrow ? 300 : 560; i < n; i++) {
  const a = Math.random() * Math.PI * 2, r = 260 + Math.pow(Math.random(), .7) * 2400;
  stars.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, b: Math.random() * STAR_R, v: Math.random() < .18 });
}
let sw = 0, sh = 0, sdpr = 1;
function sizeStars() {
  sdpr = Math.min(devicePixelRatio || 1, 1.5);
  sw = starCv.clientWidth; sh = starCv.clientHeight;
  starCv.width = sw * sdpr; starCv.height = sh * sdpr;
  last.z = Infinity;   // force a redraw
}
function drawStars(camZ, rzDeg, rxDeg, ryDeg) {
  sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
  sctx.clearRect(0, 0, sw, sh);
  const rz = rzDeg * Math.PI / 180, cs = Math.cos(rz), sn = Math.sin(rz);
  const ox = sw / 2 - P * Math.sin(ryDeg * Math.PI / 180), oy = sh / 2 + P * Math.sin(rxDeg * Math.PI / 180);
  const proj = (s, d) => { const k = P / d, X = s.x * k, Y = s.y * k; return [ox + X * cs - Y * sn, oy + X * sn + Y * cs, k]; };
  for (let pass = 0; pass < 2; pass++) {
    sctx.fillStyle = pass ? '#d9d4ec' : '#ffffff';
    for (const s of stars) {
      if (s.v !== !!pass) continue;
      const d = ((s.b - camZ) % STAR_R + STAR_R) % STAR_R + 40;   // distance ahead of the eye
      const [x, y, k] = proj(s, d);
      if (x < -40 || y < -40 || x > sw + 40 || y > sh + 40) continue;
      const size = Math.min(2.4, Math.max(.7, k * 2));
      sctx.globalAlpha = Math.min(1, (STAR_R - d) / 900) * Math.min(1, (d - 40) / 160) * .75;
      sctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }
  sctx.globalAlpha = 1;
}
addEventListener('resize', sizeStars);

/* ------------------------------------------------------------------
   Camera: scroll → cam.z (anime.js onScroll, JS engine on a plain object)
------------------------------------------------------------------- */
const CAM_END = 5600;
const camTarget = { z: 0 };   // raw scroll position (anime.js onScroll, synced 1:1)
const cam = { z: 0 };         // smoothed camera - time-based damping, so it settles in ~0.3 s even on slow devices
const intro = { z: reduce ? 0 : -900 };
const track = $('.track');
const CAM_TAU = reduce ? 1 : 95;   // ms

animate(camTarget, {
  z: [0, CAM_END], ease: 'linear', duration: 1000,
  autoplay: onScroll({ target: track, enter: 'top top', leave: 'bottom bottom', sync: true }),
});

const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: -1, py: -1, moved: false };
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;   // a finger must not tilt the camera: the view would stay skewed after every touch
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = (e.clientY / innerHeight) * 2 - 1;
  mouse.px = e.clientX; mouse.py = e.clientY; mouse.moved = true;
}, { passive: true });

const progressBar = $('.progress i'), whiteout = $('.whiteout'), glow = $('.glow'), hint = $('.scroll-hint');
const labelEl = $('.section-label span');
let currentLabel = labelEl.textContent;
function setLabel(text) {
  if (text === currentLabel) return;
  currentLabel = text;
  labelEl.textContent = text;
  enter(labelEl, { translate: '0 100%', opacity: 0 }, { translate: '0 0', opacity: 1 }, { duration: 600, ease: EASE.out4 });
}

// Only write a style when the value really changed - avoids needless style recalcs
// Infinity (not NaN) so the very first comparison counts as "changed"
const last = { z: Infinity, rx: Infinity, ry: Infinity, p: NaN, w: NaN, g: NaN, h: NaN, hint: NaN };
let inTrack = true, rafId = 0, frameNo = 0, lightUI = false, lastT = 0;

function render(now) {
  rafId = 0;
  const dt = lastT ? Math.min(now - lastT, 250) : 16.7;
  lastT = now;
  const dz = camTarget.z - cam.z;
  cam.z = Math.abs(dz) < .05 ? camTarget.z : cam.z + dz * (1 - Math.exp(-dt / CAM_TAU));
  const k = reduce ? 1 : .07;
  mouse.sx += (mouse.x - mouse.sx) * k;
  mouse.sy += (mouse.y - mouse.sy) * k;

  const z = cam.z + intro.z;
  const rz = 0;   // no camera roll: the flight stays level and calm
  const rx = reduce ? 0 : -mouse.sy * 1.5;
  const ry = reduce ? 0 : mouse.sx * 2.5;

  const camMoved = Math.abs(z - last.z) > .05 || Math.abs(rx - last.rx) > .002 || Math.abs(ry - last.ry) > .002;
  if (camMoved) {
    last.z = z; last.rx = rx; last.ry = ry;
    world.style.transform = `translateZ(${P}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) translateZ(${(-P + z).toFixed(2)}px)`;

    for (const f of fogEls) {
      const dist = -(f.z + z);
      // display:none frees the layer's video memory; texture surfaces re-show cheaply because their raster
      // scale is pinned (will-change in CSS). Window chosen by A/B measurement on an Intel UHD 630:
      // this combination was ~4-9× smoother than visibility-culling without will-change.
      const vis = dist > f.near && dist < 3800;
      if (vis !== f.v) { f.v = vis; f.el.style.display = vis ? '' : 'none'; }
      if (!vis) continue;
      let o = 1 - clamp((dist - 350) / 2300) * .94;
      if (f.fade) o *= clamp((dist - f.near) / f.fade);   // vortex discs (and exhibits on phones) dissolve as you fly through them
      o = Math.round(o * 100) / 100;
      if (o !== f.o) { f.o = o; f.el.style.opacity = o; }
    }
    // phones: the title must be gone before it grows wider than the screen (letters would be cut off at the edges)
    const hd = -(HERO_Z + z);
    const ho = Math.round(clamp(narrow ? (hd - 350) / 110 : (hd - 120) / 380) * 100) / 100;
    if (ho !== last.h) { last.h = ho; hero.style.opacity = ho; hero.style.visibility = ho ? '' : 'hidden'; }
    // vortex discs: each twists at its own speed/direction → swirling depth (only the visible ones are written)
    for (const v of vortices) {
      if (v.el.style.display === 'none') continue;
      const r = Math.round((v.geo.base + (z - 2400) * v.geo.speed * v.geo.dir) * 10) / 10;
      if (r !== v.rz) { v.rz = r; v.el.style.transform = planeTf(v.geo, r); }
    }
    const rzr = Math.round(rz * 100) / 100;
    for (const h of holos) {
      const d = -(h.z + z);
      // fade out well before the label gets huge on screen (huge text = expensive re-raster)
      // each label is visible only between d 700 and 260 (fades 120 long): labels are 450-480 apart, so the next one
      // starts fading in only after the previous one has gone - never two labels on top of each other
      const o = Math.round(clamp((d - 260) / 120) * clamp((700 - d) / 120) * 100) / 100;
      if (o !== h.o) { h.o = o; h.el.style.opacity = o; h.el.style.visibility = o ? '' : 'hidden'; }
      // cancel the camera roll → label stays level
      if (o && rzr !== h.rz) { h.rz = rzr; h.el.style.transform = planeTf(h.geo, -rzr); }
    }

    const p = Math.round(cam.z / CAM_END * 1000) / 1000;
    if (p !== last.p) { last.p = p; progressBar.style.transform = `scaleX(${p})`; }
    drawStars(z, rz, rx, ry);
    const hv = Math.round(clamp(1 - cam.z / 300) * 100) / 100;
    if (hv !== last.hint) { last.hint = hv; hint.style.opacity = hv; }
    const w = Math.round(clamp((z - 4950) / 650) * 100) / 100;
    if (w !== last.w) { last.w = w; whiteout.style.opacity = w; }
    const g = Math.round(clamp((z - 2400) / 3200) * 80) / 100;
    if (g !== last.g) { last.g = g; glow.style.opacity = g; }

    const wantLight = w > .55;
    if (wantLight !== lightUI) { lightUI = wantLight; document.body.classList.toggle('is-light', wantLight); }
    if (inTrack) setLabel(z < 2550 ? '01 - Arbeiten' : z < 5300 ? '02 - Stack' : '03 - Projekte');
  }

  // Hover hit-test (elementFromPoint on a 3D scene is not free): only when the pointer moved, or once the camera
  // has settled - never every frame while flying. Throttled to every 3rd frame.
  const settled = Math.abs(camTarget.z - cam.z) < 1;
  if (finePointer && (mouse.moved || (settled && camMoved)) && (++frameNo % 3 === 0)) { mouse.moved = false; hitTest(); }
  if (finePointer && !settled && hovered?.classList.contains('frame')) setHovered(null);

  // Keep looping while visible; the loop idles cheaply when nothing changes
  if (inTrack) rafId = requestAnimationFrame(render);
}
function startLoop() { if (!rafId) rafId = requestAnimationFrame(render); }
sizeStars();
startLoop();

// Stop the 3D loop entirely while the track is off screen
new IntersectionObserver(([e]) => {
  inTrack = e.isIntersecting;
  if (inTrack) { lastT = 0; startLoop(); }
}).observe(track);

/* ------------------------------------------------------------------
   Exhibit hover (native cursor; the hovered exhibit gets .is-hover)
   CSS :hover is unreliable on 3D layers while the camera moves, so the render loop hit-tests instead.
------------------------------------------------------------------- */
let hovered = null;
function hitTest() {
  if (mouse.px < 0 || !modal.hidden) return setHovered(null);
  const t = document.elementFromPoint(mouse.px, mouse.py);
  setHovered(t?.closest('.frame') || null);
}
function setHovered(el) {
  if (el === hovered) return;
  hovered?.classList.remove('is-hover');
  hovered = el;
  el?.classList.add('is-hover');
}

/* ------------------------------------------------------------------
   Project detail panel
------------------------------------------------------------------- */
const modal = $('.modal'), panel = $('.modal-panel'), backdrop = $('.modal-backdrop');
let openIndex = -1, lastFocus = null;
function fillModal(i, dir = 1) {
  const p = projects[i], n = String(i + 1).padStart(2, '0');
  $('.m-count').textContent = `${n} / ${String(projects.length).padStart(2, '0')}`;
  const art = $('.modal-art');
  art.innerHTML = banners[i];
  art.dataset.n = `${n} - ${p.tag}`;
  $('.modal-cat').textContent = p.cat;
  $('.modal-title').textContent = p.title;
  $('.modal-summary').textContent = p.summary;
  $('.modal-points').innerHTML = p.points.map(t => `<li>${t}</li>`).join('');
  $('.m-tags').innerHTML = p.stack.map(t => `<span class="tag now">${t}</span>`).join('');
  enter(panel.querySelectorAll('.modal-art, .modal-cat, .modal-title, .modal-summary, .modal-points li, .m-tags .tag'),
    { opacity: 0, translate: `${dir * 18}px 0` }, { opacity: 1, translate: '0 0' }, { delay: stag(28), duration: 650, ease: EASE.out4 });
}
function step(d) {
  openIndex = (openIndex + d + projects.length) % projects.length;
  fillModal(openIndex, d);
}
function openProject(i) {
  lastFocus = document.activeElement;
  openIndex = i;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  fillModal(i);
  panel.style.translate = '';
  enter(backdrop, { opacity: 0 }, { opacity: 1 }, { duration: 450, ease: EASE.out2 });
  enter(panel, { translate: '100% 0' }, { translate: '0 0' }, { duration: 750, ease: EASE.out4 });
  $('.modal-close').focus({ preventScroll: true });
}
function closeProject() {
  if (modal.hidden) return;
  leave(backdrop, { opacity: '0' }, { duration: 400, ease: EASE.out2 });
  leave(panel, { translate: '100% 0' }, { duration: 550, ease: EASE.inOut3 }).then(() => {
    modal.hidden = true;
    panel.style.translate = ''; backdrop.style.opacity = '';
    document.body.classList.remove('modal-open');
    lastFocus?.focus?.({ preventScroll: true });
  });
}
world.addEventListener('click', e => {
  const fr = e.target.closest('.frame');
  if (fr) openProject(+fr.dataset.index);
});
world.addEventListener('keydown', e => {
  const fr = e.target.closest('.frame');
  if (fr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProject(+fr.dataset.index); }
});
// Lock page scroll while the panel is open without overflow:hidden (that breaks the sticky 3D viewport)
const blockScroll = e => { if (!modal.hidden && !panel.contains(e.target)) e.preventDefault(); };
addEventListener('wheel', blockScroll, { passive: false });
addEventListener('touchmove', blockScroll, { passive: false });
panel.addEventListener('wheel', e => {
  const atTop = panel.scrollTop <= 0 && e.deltaY < 0;
  const atEnd = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1 && e.deltaY > 0;
  if (atTop || atEnd) e.preventDefault();      // no scroll chaining into the page
}, { passive: false });
addEventListener('keydown', e => {
  if (modal.hidden) return;
  if (['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key) && !panel.contains(document.activeElement)) e.preventDefault();
  if (e.key === 'Escape') closeProject();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'Tab') {   // keep focus inside the dialog
    const f = [...panel.querySelectorAll('button, a[href]')];
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});
backdrop.addEventListener('click', closeProject);
$('.modal-close').addEventListener('click', closeProject);
$$('.modal-nav button').forEach(b => b.addEventListener('click', () => step(+b.dataset.step)));

/* ------------------------------------------------------------------
   Navigation: track positions + content sections
------------------------------------------------------------------- */
$$('[data-goto]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const f = +a.dataset.goto;
  // smooth = the camera flies there instead of teleporting (also gives the GPU time to raster tiles)
  scrollTo({ top: track.offsetTop + f * (track.offsetHeight - innerHeight), behavior: reduce ? 'auto' : 'smooth' });
}));
$$('.nav a[href^="#"]:not([data-goto])').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  $(a.getAttribute('href')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}));

/* ------------------------------------------------------------------
   Content sections: HUD theme, labels, reveals, counters
------------------------------------------------------------------- */
const content = $('.content');
const topBand = { rootMargin: '-30px 0px -92% 0px' };   // "what is under the HUD top bar"
new IntersectionObserver(([e]) => {
  document.body.classList.toggle('in-content', e.isIntersecting);
  if (e.isIntersecting) document.body.classList.add('is-light');
  else if (lightUI === false) document.body.classList.remove('is-light');
}, topBand).observe(content);
new IntersectionObserver(([e]) => document.body.classList.toggle('content-low', e.isIntersecting), { rootMargin: '-86% 0px 0px 0px' }).observe(content);

/* Phone menu: button toggles the dropdown; closes on link tap, outside tap and Escape */
const menuBtn = $('.menu-btn');
const setMenu = open => { document.body.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', open); };
menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
$$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('pointerdown', e => { if (!e.target.closest('.nav, .menu-btn')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });

// Dark panels inside the white content flip the HUD back to light text
const darkIO = new IntersectionObserver(entries => {
  for (const e of entries) e.target._under = e.isIntersecting;
  document.body.classList.toggle('on-dark', [...$$('[data-dark]')].some(el => el._under));
}, topBand);
$$('[data-dark]').forEach(el => darkIO.observe(el));

const labelIO = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) setLabel(e.target.dataset.label);
}, { rootMargin: '-45% 0px -54% 0px' });
$$('.sec').forEach(s => labelIO.observe(s));

const splits = [...$$('.split')].map(el => ({ el, words: splitText(el, { words: true }).words }));
const reveals = [...$$('[data-reveal]')];
if (!reduce) {
  splits.forEach(s => s.words.forEach(w => (w.style.opacity = 0)));
  reveals.forEach(el => (el.style.opacity = 0));
  const pending = new Set([...splits.map(s => s.el), ...reveals]);
  // Skipped by a jump or a fast fling (now above the screen, never seen by the observer): show it without animation,
  // so nothing can stay invisible when the visitor scrolls back up.
  const showSkipped = () => {
    for (const el of pending) {
      if (el.getBoundingClientRect().bottom >= 0) continue;
      pending.delete(el); io.unobserve(el);
      const s = splits.find(x => x.el === el);
      if (s) s.words.forEach(w => (w.style.opacity = '')); else el.style.opacity = '';
    }
  };
  let skipTimer = 0;
  addEventListener('scroll', () => { if (pending.size && !skipTimer) skipTimer = setTimeout(() => { skipTimer = 0; showSkipped(); }, 200); }, { passive: true });
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      const s = splits.find(x => x.el === e.target);
      if (!e.isIntersecting) continue;
      io.unobserve(e.target); pending.delete(e.target);
      if (s) {
        enter(s.words, { opacity: 0, translate: '0 .45em' }, { opacity: 1, translate: '0 0' }, { delay: stag(45), duration: 1000, ease: EASE.out4 });
      } else {
        enter(e.target, { opacity: 0, translate: '0 28px' }, { opacity: 1, translate: '0 0' }, { duration: 1000 });
        // children cards stagger in
        const cards = e.target.querySelectorAll(':scope > .cert, :scope > .stat, :scope > .skill-col, :scope > li');
        if (cards.length) enter(cards, { opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }, { delay: stag(90, 120), duration: 900, ease: EASE.out4 });
        // Portrait: curtain reveal (clip-path, rounded) + settle-in zoom
        e.target.querySelectorAll('.portrait-img').forEach(pi => {
          enter(pi, { clipPath: 'inset(100% 0 0 0 round 16px)' }, { clipPath: 'inset(0% 0 0 0 round 16px)' }, { duration: 1100, delay: 150, ease: EASE.inOut3 });
          enter(pi.querySelector('img'), { scale: 1.08 }, { scale: 1 }, { duration: 1400, delay: 150 });
        });
        e.target.querySelectorAll('[data-count]').forEach(b => {
          const o = { v: 0 }, to = +b.dataset.count;
          animate(o, { v: to, duration: 1400, ease: 'out(3)', onUpdate: () => (b.textContent = Math.round(o.v)) });
        });
      }
    }
  // No ratio threshold: a block several screens tall (long lists on a phone) would never reach it and stay invisible
  }, { rootMargin: '0px 0px -10% 0px' });
  pending.forEach(el => io.observe(el));
  showSkipped();   // page reloaded with a restored scroll position further down
} else {
  $$('[data-count]').forEach(b => (b.textContent = b.dataset.count));
}

/* ------------------------------------------------------------------
   Intro: loader counter → split exit → camera fly-in
------------------------------------------------------------------- */
const loader = $('#loader');
const hudItems = $$('.hud-item');
const { chars: heroChars } = splitText('.hero-title', { chars: true });
const { chars: loaderChars } = splitText('.loader-word', { chars: true });

// Convert posters once fonts are ready (during the loader, so the swap is never visible)
document.fonts.ready.then(bitmapPosters);

function reveal() {
  document.body.classList.remove('loading');
  enter(hudItems, { opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }, { delay: stag(60, 500), duration: 900 });
  enter(heroChars, { opacity: 0, translate: '0 30%' }, { opacity: 1, translate: '0 0' },
    { delay: stagCenter(25, 700), duration: 1100, ease: EASE.out4 });
  enter('.hero-kicker, .hero-sub', { opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }, { delay: stag(200, 1300), duration: 1000 });
  animate(intro, { z: 0, duration: 2600, ease: 'out(4)' });
  if (!reduce) hint.animate([{ translate: '-50% 0' }, { translate: '-50% 6px' }], { duration: 900, delay: 2500, direction: 'alternate', iterations: Infinity, easing: EASE.inOut2 });
}

if (reduce || scrollY > 10) {
  loader.remove();
  intro.z = 0;
  document.body.classList.remove('loading');
} else {
  hudItems.forEach(el => (el.style.opacity = 0));
  heroChars.forEach(el => (el.style.opacity = 0));
  $$('.hero-kicker, .hero-sub').forEach(el => (el.style.opacity = 0));
  const bar = $('.loader-bar i'), counter = { v: 0 };
  enter(loaderChars, { opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }, { delay: stag(40), duration: 600 });
  // Wait for the fonts so the hero never reflows mid-animation
  const ready = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]);
  animate(counter, {
    v: 100, duration: 1900, ease: 'inOut(3)',
    onUpdate: () => { bar.style.transform = `scaleX(${counter.v / 100})`; },
    onComplete: async () => {
      await ready;
      leave(loaderChars, { opacity: '0', translate: '0 -10px' }, { delay: stagCenter(25), duration: 500, ease: EASE.in2 });
      leave('.loader-bar', { opacity: '0' }, { duration: 400, ease: EASE.in2 });
      leave(loader, { opacity: '0' }, { duration: 1000, delay: 450 }).then(() => loader.remove());
      setTimeout(reveal, 450);
    },
  });
}
