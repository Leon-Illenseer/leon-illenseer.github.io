/* Entrance / exit animations — native Web Animations, written so the END state never depends on the animation:
   enter() first puts the element into its resting style and only plays the way there (fill: backwards), so when the
   animation is over (or is dropped) the element is simply visible. On iPhones, committing a staggered animation's
   final style left single letters and cards at opacity 0 — "shown briefly, then gone". */
const EASE = {
  out2: 'cubic-bezier(.25,.46,.45,.94)', out3: 'cubic-bezier(.215,.61,.355,1)', out4: 'cubic-bezier(.165,.84,.44,1)',
  in2: 'cubic-bezier(.55,.085,.68,.53)', inOut2: 'cubic-bezier(.455,.03,.515,.955)', inOut3: 'cubic-bezier(.645,.045,.355,1)',
};
const els = t => (typeof t === 'string' ? [...document.querySelectorAll(t)] : t instanceof Element ? [t] : [...t]);
const stag = (step, start = 0) => i => start + i * step;
const stagCenter = (step, start = 0) => (i, n) => start + Math.abs(i - (n - 1) / 2) * step;
const noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function enter(targets, from, to, { duration = 800, delay = 0, ease = EASE.out3 } = {}) {
  const list = els(targets);
  list.forEach((el, i) => {
    el.style.opacity = '';   // resting style = visible
    el.animate([from, to], { duration: noMotion ? 1 : duration, delay: noMotion ? 0 : typeof delay === 'function' ? delay(i, list.length) : delay, easing: ease, fill: 'backwards' });
  });
}
// exit: plays to `to`, then writes `to` as plain inline style itself (no commitStyles) and drops the animation
function leave(targets, to, { duration = 500, delay = 0, ease = EASE.inOut2 } = {}) {
  const list = els(targets);
  const anims = list.map((el, i) => el.animate([to], { duration: noMotion ? 1 : duration, delay: noMotion ? 0 : typeof delay === 'function' ? delay(i, list.length) : delay, easing: ease, fill: 'forwards' }));
  return Promise.all(anims.map(a => a.finished)).then(() => { list.forEach(el => Object.assign(el.style, to)); anims.forEach(a => a.cancel()); }).catch(() => {});
}
export { EASE, els, stag, stagCenter, noMotion, enter, leave };
