import React, { useEffect, useRef, useState } from 'react';

/*
 * Dynamic gallery
 * ----------------
 * Adapted from the "Selected Work" strip on christianschneiderdavis.com,
 * rebuilt without GSAP so this site stays dependency-free.
 *
 * Desktop (> 900px): the name and the strip together fill the first screen
 * as the hero. The section then pins, and scrolling down moves the artwork
 * to the left. The strip is one running pixel offset that wraps forever (the
 * artwork is rendered twice, so after the last piece the first one is already
 * sliding in), so scrolling, dragging and the idle drift all just add to the
 * same number. Hovering a piece shows a card that opens the full details.
 *
 * Mobile (<= 900px): no scroll-jacking. A native swipeable strip, rendered
 * three times and quietly re-centred whenever it comes to rest, so it loops
 * endlessly in both directions. It drifts on its own when left alone.
 *
 * Both: after a couple of seconds without input the strip starts a slow
 * drift, easing in, and eases to a stop on any scroll, touch, key press or
 * while the pointer rests on a piece.
 */

const DESKTOP_QUERY = '(min-width: 901px)';
// Scroll distance of the pinned section. Scrolling all the way through it
// moves the strip by exactly one full lap of the artwork.
const PIN_VH = 420;
// How long the visitor must be still before the drift starts.
const IDLE_MS = 2200;
// Drift speed in px per second, and how quickly it eases in and out (ms).
const DRIFT_SPEED = { desktop: 38, mobile: 26 };
const DRIFT_EASE = 600;
// How quickly the strip catches up with scroll / drag input (per 16ms frame).
const FOLLOW = 0.11;
// Vertical room kept under each piece for its caption.
const CAPTION_SPACE = { desktop: 74, mobile: 66 };
const PIECE_LIMITS = { desktop: [240, 720], mobile: [200, 640] };

const wrap = (value, span) => ((value % span) + span) % span;
const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
const pad = (n) => String(n).padStart(2, '0');
const src = (path) => `${import.meta.env.BASE_URL}${path}`;

function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DynamicGallery({ artPieces, onSelect, paused = false, header = null }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  if (!artPieces.length) {
    return <p className="no-results">No artwork found in this category.</p>;
  }

  const props = { artPieces, onSelect, pausedRef, activeIndex, setActiveIndex, header };
  return isDesktop ? <DesktopStrip {...props} /> : <MobileStrip {...props} />;
}

/* ---------------------------------------------------------------------- */
/* Shared                                                                 */
/* ---------------------------------------------------------------------- */

function useIdleClock() {
  const lastInputRef = useRef(performance.now());
  useEffect(() => {
    const touch = () => {
      lastInputRef.current = performance.now();
    };
    const events = ['wheel', 'scroll', 'pointerdown', 'pointermove', 'touchstart', 'touchmove', 'keydown'];
    events.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, touch));
  }, []);
  return lastInputRef;
}

// Re-measure whenever any piece changes size (artwork has no fixed aspect
// ratio, so widths are only known once each image has loaded). Watching the
// track itself isn't enough: its box doesn't change when its content does.
function observePieces(track, measure) {
  const ro = new ResizeObserver(() => measure());
  Array.from(track.children).forEach((el) => ro.observe(el));
  const imgs = Array.from(track.querySelectorAll('img'));
  imgs.forEach((img) => img.addEventListener('load', measure));
  return () => {
    ro.disconnect();
    imgs.forEach((img) => img.removeEventListener('load', measure));
  };
}

function Piece({ art, index, clone, onOpen, onFocusPiece, mobile }) {
  const photos = art.images.length;
  return (
    <figure className={`dg-piece${mobile ? ' dg-piece--mobile' : ''}`} data-index={index}>
      <div className="dg-piece__frame" onClick={onOpen}>
        <img src={src(art.images[0])} alt={clone ? '' : art.title} draggable="false" decoding="async" />

        {/* Hover card (desktop): opens the full details and photos. */}
        <div className="dg-piece__popup">
          <span className="dg-piece__popup-title">{art.title}</span>
          <span className="dg-piece__popup-meta">
            {art.medium} • {photos} {photos === 1 ? 'photo' : 'photos'}
          </span>
          <button
            type="button"
            className="dg-piece__popup-btn"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            onFocus={onFocusPiece}
            // Clones only exist for the seamless loop.
            tabIndex={clone ? -1 : 0}
            aria-hidden={clone ? 'true' : undefined}
            aria-label={`View ${art.title}: details and photos`}
          >
            View details
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path
                d="M9.5 2.5h4v4M13.5 2.5 8.5 7.5M6.5 13.5h-4v-4M2.5 13.5l5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <figcaption className="dg-piece__caption">
        <span className="dg-piece__index">{pad(index + 1)}</span>
        <span className="dg-piece__title">{art.title}</span>
        <span className="dg-piece__meta">
          {art.medium} • {art.year}
        </span>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Desktop: hero + pinned, scroll-driven, looping strip                   */
/* ---------------------------------------------------------------------- */

function DesktopStrip({ artPieces, onSelect, pausedRef, activeIndex, setActiveIndex, header }) {
  const count = artPieces.length;
  const loop = [...artPieces, ...artPieces];
  const pinRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const lastInputRef = useIdleClock();

  // target: where input says the strip should be; current: where it is drawn.
  const motion = useRef({ target: 0, current: 0, drift: 0, span: 0, lefts: [] });
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const pin = pinRef.current;
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pin || !stage || !viewport || !track) return undefined;
    const m = motion.current;
    const reduced = prefersReducedMotion();

    // The page content sits in a centred 1200px column; pull the stage out
    // to the full width of the screen (minus any scrollbar).
    const alignStage = () => {
      stage.style.marginLeft = '0px';
      stage.style.width = `${document.documentElement.clientWidth}px`;
      stage.style.marginLeft = `${-stage.getBoundingClientRect().left}px`;
    };

    const measure = () => {
      alignStage();
      // Size the artwork to whatever height is left under the name.
      const pieceH = clamp(viewport.clientHeight - CAPTION_SPACE.desktop, PIECE_LIMITS.desktop);
      track.style.setProperty('--piece-h', `${Math.round(pieceH)}px`);

      const items = Array.from(track.children);
      const first = items[0]?.offsetLeft ?? 0;
      m.lefts = items.map((el) => el.offsetLeft - first);
      const span = items[count] ? m.lefts[count] : 0;
      // Keep the same piece on screen if the lap length changes.
      if (m.span && span && span !== m.span) {
        const scale = span / m.span;
        m.current *= scale;
        m.target *= scale;
      }
      m.span = span;
    };
    measure();
    const stopObserving = observePieces(track, measure);
    window.addEventListener('resize', measure);

    const isPinned = () => {
      const rect = pin.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };
    const isVisible = () => {
      const rect = pin.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    // Vertical scrolling inside the pinned section moves the strip left.
    // Only the part of a scroll inside the pinned range counts, so a jump
    // from the menu straight past the gallery doesn't spin it.
    const pinnedY = () => {
      const start = pin.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(1, pin.offsetHeight - window.innerHeight);
      return { y: Math.min(Math.max(window.scrollY - start, 0), range), range };
    };
    let lastY = pinnedY().y;
    const onScroll = () => {
      const { y, range } = pinnedY();
      const delta = y - lastY;
      lastY = y;
      if (!delta || !m.span) return;
      m.target += delta * (m.span / range);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Sideways trackpad swipes nudge the strip without moving the page.
    const onWheel = (event) => {
      if (!isPinned()) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      m.target += event.deltaX;
    };
    stage.addEventListener('wheel', onWheel, { passive: false });

    // Click-and-drag with a mouse; a quick flick glides on.
    const drag = { down: false, moved: false, startX: 0, lastX: 0, lastT: 0, v: 0, id: null };
    const onPointerDown = (event) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      if (event.target.closest('.dg-piece__popup-btn')) return;
      Object.assign(drag, {
        down: true, moved: false, startX: event.clientX, lastX: event.clientX,
        lastT: performance.now(), v: 0, id: event.pointerId,
      });
    };
    const onPointerMove = (event) => {
      if (!drag.down || event.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.abs(event.clientX - drag.startX) < 6) return;
        drag.moved = true;
        stage.classList.add('is-dragging');
        try { stage.setPointerCapture(event.pointerId); } catch { /* fine */ }
      }
      const now = performance.now();
      const dx = event.clientX - drag.lastX;
      drag.v = 0.8 * (dx / Math.max(1, now - drag.lastT)) + 0.2 * drag.v;
      drag.lastX = event.clientX;
      drag.lastT = now;
      m.target -= dx;
      m.current -= dx; // follow the hand 1:1 while dragging
    };
    const onPointerUp = (event) => {
      if (!drag.down || event.pointerId !== drag.id) return;
      drag.down = false;
      if (!drag.moved) return;
      stage.classList.remove('is-dragging');
      try { stage.releasePointerCapture(event.pointerId); } catch { /* fine */ }
      m.target -= drag.v * 380;
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 0);
    };
    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    const pointerOnPiece = () => Boolean(track.querySelector('.dg-piece__frame:hover'));

    let frame = 0;
    let last = performance.now();
    let shownIndex = -1;

    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;

      const idle = now - lastInputRef.current > IDLE_MS;
      const drifting =
        !reduced && idle && isVisible() && !drag.down && !pausedRef.current && !pointerOnPiece();
      const targetSpeed = drifting ? DRIFT_SPEED.desktop : 0;
      m.drift += (targetSpeed - m.drift) * Math.min(1, dt / DRIFT_EASE);
      if (m.drift > 0.01) m.target += m.drift * (dt / 1000);

      // Ease the drawn position toward the target (frame-rate independent).
      const k = 1 - Math.pow(1 - FOLLOW, dt / 16.67);
      m.current += (m.target - m.current) * k;
      if (Math.abs(m.target - m.current) < 0.05) m.current = m.target;

      // Keep the running numbers small; wrapping both by whole laps changes
      // nothing on screen.
      if (m.span && Math.abs(m.current) > m.span * 4) {
        const laps = Math.trunc(m.current / m.span) * m.span;
        m.current -= laps;
        m.target -= laps;
      }

      if (m.span) {
        const x = wrap(m.current, m.span);
        track.style.transform = `translate3d(${-x}px, 0, 0)`;

        // The "active" piece is the one under a point a third of the way in.
        const probe = x + stage.clientWidth * 0.33;
        let index = 0;
        for (let i = 0; i < m.lefts.length; i += 1) {
          if (m.lefts[i] <= probe) index = i;
        }
        index %= count;
        if (index !== shownIndex) {
          shownIndex = index;
          setActiveIndex(index);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      stopObserving();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      stage.style.marginLeft = '';
      stage.style.width = '';
    };
  }, [count, lastInputRef, pausedRef, setActiveIndex]);

  // Keyboard: tabbing to a piece slides it into view.
  const focusPiece = (position) => {
    const m = motion.current;
    if (!m.span || m.lefts[position] == null) return;
    const goal = m.lefts[position] - 48;
    let delta = wrap(goal - m.current, m.span);
    if (delta > m.span / 2) delta -= m.span;
    m.target = m.current + delta;
  };

  const select = (art) => {
    if (suppressClickRef.current) return;
    onSelect(art);
  };

  const active = artPieces[activeIndex];

  return (
    <section className="dynamic-gallery" aria-label="Artwork">
      <div className="dg-pin" ref={pinRef} style={{ height: `${PIN_VH}vh` }}>
        <div className="dg-stage" ref={stageRef}>
          {header && <div className="dg-stage__header">{header}</div>}

          <div className="dg-viewport" ref={viewportRef}>
            <div className="dg-track" ref={trackRef}>
              {loop.map((art, position) => (
                <Piece
                  key={`${art.id}-${position}`}
                  art={art}
                  index={position % count}
                  clone={position >= count}
                  onOpen={() => select(art)}
                  onFocusPiece={() => focusPiece(position)}
                />
              ))}
            </div>
          </div>

          <div className="dg-hud" aria-hidden="true">
            <span className="dg-hud__count">
              {pad(activeIndex + 1)} <span>/ {pad(count)}</span>
            </span>
            <span className="dg-hud__title">{active?.title}</span>
            <span className="dg-hud__hint">Scroll to explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Mobile: hero + native swipe strip, endless both ways, idle drift       */
/* ---------------------------------------------------------------------- */

function MobileStrip({ artPieces, onSelect, pausedRef, activeIndex, setActiveIndex, header }) {
  const count = artPieces.length;
  // Three copies: the visitor always scrolls within the middle one, with a
  // full lap of runway either side, and is moved back to the middle (an
  // invisible jump, the copies are identical) whenever the strip settles.
  const loop = [...artPieces, ...artPieces, ...artPieces];
  const trackRef = useRef(null);
  const lastInputRef = useIdleClock();
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const reduced = prefersReducedMotion();
    const state = { span: 0, lefts: [], drift: 0, pos: 0, driving: false, touching: false };

    const recenter = () => {
      const { span } = state;
      if (!span) return;
      let x = track.scrollLeft;
      if (x < span) x += span * Math.ceil((span - x) / span);
      if (x >= span * 2) x -= span * Math.floor((x - span) / span);
      if (x !== track.scrollLeft) track.scrollLeft = x;
      state.pos = track.scrollLeft;
    };

    const measure = () => {
      // Fill the height left under the name, but never so wide that the
      // next piece can't peek in from the right.
      const pieceH = clamp(
        Math.min(track.clientHeight - CAPTION_SPACE.mobile, track.clientWidth * 1.02),
        PIECE_LIMITS.mobile,
      );
      track.style.setProperty('--piece-h', `${Math.round(pieceH)}px`);

      const items = Array.from(track.children);
      const first = items[0]?.offsetLeft ?? 0;
      state.lefts = items.map((el) => el.offsetLeft - first);
      const span = items[count] ? state.lefts[count] : 0;
      if (!span) return;
      // Same spot within the lap, mapped onto the middle copy.
      const within = state.span ? wrap(track.scrollLeft - state.span, state.span) / state.span : 0;
      state.span = span;
      track.scrollLeft = span + within * span;
      state.pos = track.scrollLeft;
    };
    measure();
    const stopObserving = observePieces(track, measure);
    window.addEventListener('resize', measure);

    // Re-centre only once the strip has come to rest, so it never fights a
    // finger or interrupts momentum scrolling.
    let settleTimer = 0;
    const onScroll = () => {
      if (!state.driving) state.pos = track.scrollLeft;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!state.touching && !drag.down) recenter();
      }, 160);
    };
    track.addEventListener('scroll', onScroll, { passive: true });

    const onTouchStart = () => { state.touching = true; };
    const onTouchEnd = () => { state.touching = false; };
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Mouse users on a narrow window: drag the strip.
    const drag = { down: false, moved: false, startX: 0, startScroll: 0 };
    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      Object.assign(drag, { down: true, moved: false, startX: event.clientX, startScroll: track.scrollLeft });
    };
    const onPointerMove = (event) => {
      if (!drag.down) return;
      const dx = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) < 6) return;
      drag.moved = true;
      track.classList.add('is-dragging');
      track.scrollLeft = drag.startScroll - dx;
    };
    const onPointerUp = () => {
      if (!drag.down) return;
      drag.down = false;
      if (!drag.moved) return;
      track.classList.remove('is-dragging');
      recenter();
      suppressClickRef.current = true;
      setTimeout(() => { suppressClickRef.current = false; }, 0);
    };
    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const isVisible = () => {
      const rect = track.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    let frame = 0;
    let last = performance.now();
    let shownIndex = -1;

    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      const idle = now - lastInputRef.current > IDLE_MS;
      const drifting =
        !reduced && idle && !state.touching && !drag.down && isVisible() && !pausedRef.current;
      const targetSpeed = drifting ? DRIFT_SPEED.mobile : 0;
      state.drift += (targetSpeed - state.drift) * Math.min(1, dt / DRIFT_EASE);

      if (state.drift > 0.01 && state.span) {
        // Keep the position as a float ourselves: browsers round scrollLeft,
        // which would stall a slow drift.
        if (!state.driving) state.pos = track.scrollLeft;
        state.driving = true;
        state.pos += state.drift * (dt / 1000);
        if (state.pos >= state.span * 2) state.pos -= state.span;
        track.scrollLeft = state.pos;
      } else {
        state.driving = false;
      }

      if (state.span) {
        const probe = wrap(track.scrollLeft, state.span) + track.clientWidth * 0.3;
        let index = 0;
        for (let i = 0; i < state.lefts.length; i += 1) if (state.lefts[i] <= probe) index = i;
        index %= count;
        if (index !== shownIndex) {
          shownIndex = index;
          setActiveIndex(index);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      stopObserving();
      window.removeEventListener('resize', measure);
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
      track.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [count, lastInputRef, pausedRef, setActiveIndex]);

  const select = (art) => {
    if (suppressClickRef.current) return;
    onSelect(art);
  };

  return (
    <section className="dynamic-gallery dynamic-gallery--mobile" aria-label="Artwork">
      {header}
      <div className="dg-mobile-head">
        <span className="dg-hud__count">
          {pad(activeIndex + 1)} <span>/ {pad(count)}</span>
        </span>
        <span className="dg-hud__hint">Swipe to explore</span>
      </div>
      <div className="dg-mobile-track" ref={trackRef}>
        {loop.map((art, position) => (
          <Piece
            key={`${art.id}-${position}`}
            art={art}
            index={position % count}
            clone={position < count || position >= count * 2}
            mobile
            onOpen={() => select(art)}
          />
        ))}
      </div>
    </section>
  );
}
