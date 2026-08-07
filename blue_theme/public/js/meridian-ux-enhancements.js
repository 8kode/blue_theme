/* ══════════════════════════════════════════════════════════════════
   MERIDIAN 3.0 — UX ENHANCEMENT LAYER v2 (JavaScript)
   ERPNext v16 / Frappe v16 · Pure additive layer · Zero theme edits

   This file NEVER modifies meridian.css or any Frappe core file.
   It enhances the UI externally via:
     · Event delegation on `document` (survives SPA re-renders)
     · A single MutationObserver (Frappe desk is a live SPA)
     · Injected, namespaced helper styles (`mrx-` prefix only)
     · Frappe public events (`frappe.router.on('change')`) when present

   LOAD: add to your custom app's build json, e.g.
     app_include_js = ["/assets/<your_app>/js/meridian-ux-enhancements.js"]
   or paste into a "Custom Script" of type Page/Client if preferred.

   MODULES (each independently toggleable in MRX_CONFIG)
   ── Core UX ─────────────────────────────────────────────────────
   §A  scrollElevation   — navbar/page-head shadow only when scrolled
   §B  slashSearch       — "/" focuses global search (Gmail pattern)
   §C  copyDocName       — click-to-copy document ID in the page title
   §D  backToTop         — appears after 2 viewports of scrolling
   §E  listDensity       — comfortable / compact toggle, persisted
   §F  a11yPatch         — aria-labels, aria-current, skip link
   §G  stickyGridHeader  — child-table headers stick while scrolling
   §H  formProgressHint  — subtle "unsaved" pulse on primary button
   ── Power features ──────────────────────────────────────────────
   §I  shortcutsOverlay  — "?" opens a keyboard-shortcut cheat sheet
   §J  recentDocs        — Alt+R quick-jump palette of recent docs,
                           tracked locally, fuzzy-filterable
   §K  sidebarFilter     — instant type-to-filter for the sidebar
   §L  toastUpgrade      — progress countdown bar + hover-to-pause
   §M  saveFlash         — animated success checkmark after save
   ── Animation & delight ─────────────────────────────────────────
   §N  routeTransitions  — smooth fade/slide-up on page navigation
   §O  rippleButtons     — pointer-tracked ripple on buttons
   §P  scrollProgress    — 2px reading-progress bar under the navbar
   §Q  countUp           — dashboard number cards animate counting up
   §R  listStagger       — list rows cascade in with a stagger
   §S  cardLift          — dashboard/workspace cards lift on hover

   Every animation respects `prefers-reduced-motion: reduce`.
   All injected styles use theme CSS variables → follows light/dark/RTL.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ── Configuration ─────────────────────────────────────────── */
  const MRX_CONFIG = {
    // core
    scrollElevation: true,
    slashSearch: true,
    copyDocName: true,
    backToTop: true,
    listDensity: true,
    a11yPatch: true,
    stickyGridHeader: true,
    formProgressHint: true,
    // power
    shortcutsOverlay: true,
    recentDocs: true,
    sidebarFilter: true,
    toastUpgrade: true,
    saveFlash: true,
    // animation
    routeTransitions: true,
    rippleButtons: true,
    scrollProgress: true,
    countUp: true,
    listStagger: true,
    cardLift: true,
    // tuning
    storagePrefix: "mrx:",
    backToTopThreshold: 2, // viewports
    recentDocsMax: 12,
    toastDuration: 5000, // ms, mirrors frappe default
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionOK = () => !reducedMotion.matches;

  const store = {
    get: (k) => {
      try {
        return localStorage.getItem(MRX_CONFIG.storagePrefix + k);
      } catch {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(MRX_CONFIG.storagePrefix + k, v);
      } catch {
        /* private mode */
      }
    },
    getJSON: (k, fallback) => {
      try {
        return JSON.parse(store.get(k)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    setJSON: (k, v) => store.set(k, JSON.stringify(v)),
  };

  /* ── Namespaced helper styles (additive only, mrx- prefix) ── */
  const injectStyles = () => {
    if (document.getElementById("mrx-styles")) return;
    const css = `
      /* ═══ tokens ═══ */
      :root {
        --mrx-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
        --mrx-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        --mrx-overlay: rgba(25, 25, 23, 0.42);
      }
      [data-theme="dark"] { --mrx-overlay: rgba(0, 0, 0, 0.6); }

      /* §A scroll elevation */
      .mrx-elevated { box-shadow: 0 2px 8px rgba(25,25,23,.08), 0 1px 2px rgba(25,25,23,.06) !important; }
      [data-theme="dark"] .mrx-elevated { box-shadow: 0 2px 10px rgba(0,0,0,.45) !important; }

      /* §C copy doc name */
      .mrx-copyable { cursor: copy; }
      .mrx-copied-tip {
        position: fixed; z-index: 1090; padding: 4px 10px;
        font-size: 11px; font-weight: 600; border-radius: 6px;
        background: var(--mr-ink-900, #191917); color: #fff;
        pointer-events: none; opacity: 0; translate: 0 4px; scale: 0.94;
        transition: opacity 160ms var(--mrx-ease-out), translate 160ms var(--mrx-ease-out), scale 160ms var(--mrx-ease-spring);
      }
      .mrx-copied-tip.mrx-show { opacity: 1; translate: 0 0; scale: 1; }

      /* §D back to top */
      .mrx-back-top {
        position: fixed; inset-block-end: 24px; inset-inline-end: 24px;
        inline-size: 42px; block-size: 42px; border-radius: 9999px;
        display: grid; place-items: center; z-index: 1030;
        background: var(--fg-color, #fff); color: var(--text-color, #3d3d38);
        border: 1px solid var(--border-color, #e4e4df);
        box-shadow: var(--shadow-md, 0 2px 8px rgba(0,0,0,.12));
        cursor: pointer; opacity: 0; visibility: hidden; translate: 0 12px; scale: 0.85;
        transition: opacity 240ms var(--mrx-ease-out), translate 240ms var(--mrx-ease-spring),
                    scale 240ms var(--mrx-ease-spring), visibility 240ms,
                    color 140ms ease, border-color 140ms ease;
      }
      .mrx-back-top.mrx-show { opacity: 1; visibility: visible; translate: 0 0; scale: 1; }
      .mrx-back-top:hover { color: var(--primary, #a83c7e); border-color: var(--dark-border-color, #d7d7d1); scale: 1.08; }
      .mrx-back-top:active { scale: 0.94; }
      .mrx-back-top:focus-visible { outline: none; box-shadow: var(--mr-focus, 0 0 0 3px rgba(168,60,126,.28)); }

      /* §E list density */
      .mrx-density-toggle {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 500; padding: 4px 10px;
        border: 1px solid var(--border-color, #e4e4df); border-radius: 9999px;
        background: var(--fg-color, #fff); color: var(--text-muted, #6c6c65);
        cursor: pointer; margin-inline-start: 8px;
        transition: color 140ms ease, border-color 140ms ease, scale 140ms var(--mrx-ease-spring);
      }
      .mrx-density-toggle:hover { color: var(--heading-color, #191917); border-color: var(--dark-border-color, #d7d7d1); }
      .mrx-density-toggle:active { scale: 0.95; }
      html.mrx-compact .list-row { padding-block: 4px !important; min-block-size: 32px; }
      html.mrx-compact .list-row-container .list-row-col { font-size: 12px; }

      /* §F skip link */
      .mrx-skip-link {
        position: absolute; inset-inline-start: 8px; inset-block-start: -48px;
        z-index: 1100; padding: 8px 14px; border-radius: 7px;
        background: var(--primary, #a83c7e); color: #fff; font-weight: 600;
        font-size: 13px; text-decoration: none; transition: inset-block-start 160ms var(--mrx-ease-out);
      }
      .mrx-skip-link:focus { inset-block-start: 8px; color: #fff; }

      /* §G sticky grid headers */
      .mrx-sticky-head .grid-heading-row {
        position: sticky; inset-block-start: 0; z-index: 3;
        background-color: var(--table-head-bg, #f6f6f4);
      }

      /* §H unsaved pulse */
      @keyframes mrx-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(168,60,126,.35);} 55% { box-shadow: 0 0 0 5px rgba(168,60,126,0);} }
      .mrx-unsaved-pulse { animation: mrx-pulse 2.2s ease-out infinite; }

      /* ═══ §I / §J shared modal shell ═══ */
      .mrx-modal-backdrop {
        position: fixed; inset: 0; z-index: 1085;
        background: var(--mrx-overlay);
        backdrop-filter: blur(2px);
        opacity: 0; transition: opacity 200ms var(--mrx-ease-out);
      }
      .mrx-modal-backdrop.mrx-show { opacity: 1; }
      .mrx-modal {
        position: fixed; z-index: 1086;
        inset-block-start: 12vh; inset-inline: 0; margin-inline: auto;
        inline-size: min(560px, calc(100vw - 32px));
        max-block-size: 70vh; display: flex; flex-direction: column;
        background: var(--fg-color, #fff); color: var(--text-color, #3d3d38);
        border: 1px solid var(--border-color, #e4e4df); border-radius: 14px;
        box-shadow: 0 24px 64px rgba(25,25,23,.22), 0 4px 12px rgba(25,25,23,.10);
        opacity: 0; translate: 0 14px; scale: 0.97;
        transition: opacity 220ms var(--mrx-ease-out), translate 220ms var(--mrx-ease-spring), scale 220ms var(--mrx-ease-spring);
      }
      .mrx-modal.mrx-show { opacity: 1; translate: 0 0; scale: 1; }
      .mrx-modal-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px; border-block-end: 1px solid var(--border-color, #e4e4df);
      }
      .mrx-modal-title { font-size: 14px; font-weight: 700; color: var(--heading-color, #191917); }
      .mrx-modal-close {
        border: 0; background: none; cursor: pointer; padding: 4px;
        color: var(--text-muted, #6c6c65); border-radius: 6px; line-height: 0;
        transition: color 120ms ease, background-color 120ms ease;
      }
      .mrx-modal-close:hover { color: var(--heading-color, #191917); background: var(--control-bg, #f2f2ef); }
      .mrx-modal-body { overflow: auto; padding: 10px 8px; }

      /* §I shortcuts overlay */
      .mrx-sc-group { padding: 8px 10px 4px; font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--text-muted, #6c6c65); }
      .mrx-sc-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 10px; border-radius: 8px; font-size: 13px; }
      .mrx-sc-row:hover { background: var(--control-bg, #f2f2ef); }
      .mrx-kbd {
        display: inline-block; min-inline-size: 22px; text-align: center;
        padding: 2px 7px; font-family: var(--font-family-monospace, ui-monospace, monospace);
        font-size: 11px; font-weight: 600; border-radius: 5px;
        background: var(--control-bg, #f2f2ef); color: var(--heading-color, #191917);
        border: 1px solid var(--border-color, #e4e4df);
        box-shadow: 0 1px 0 var(--border-color, #e4e4df);
        margin-inline-start: 4px;
      }

      /* §J recent docs */
      .mrx-recent-input {
        inline-size: calc(100% - 20px); margin: 10px; padding: 9px 12px;
        font-size: 13px; border-radius: 8px;
        border: 1px solid var(--border-color, #e4e4df);
        background: var(--control-bg, #f2f2ef); color: var(--text-color, #3d3d38);
        outline: none; transition: border-color 140ms ease, box-shadow 140ms ease;
      }
      .mrx-recent-input:focus { border-color: var(--primary, #a83c7e); box-shadow: var(--mr-focus, 0 0 0 3px rgba(168,60,126,.28)); }
      .mrx-recent-item {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; border-radius: 8px; cursor: pointer;
        font-size: 13px; color: var(--text-color, #3d3d38);
        transition: background-color 100ms ease;
      }
      .mrx-recent-item:hover, .mrx-recent-item.mrx-active { background: var(--control-bg, #f2f2ef); }
      .mrx-recent-item.mrx-active { box-shadow: inset 2px 0 0 var(--primary, #a83c7e); }
      .mrx-recent-doctype {
        font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 9999px;
        background: var(--control-bg, #f2f2ef); color: var(--text-muted, #6c6c65);
        border: 1px solid var(--border-color, #e4e4df); white-space: nowrap;
      }
      .mrx-recent-name { font-weight: 600; color: var(--heading-color, #191917); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .mrx-recent-empty { padding: 24px; text-align: center; font-size: 13px; color: var(--text-muted, #6c6c65); }

      /* §K sidebar filter */
      .mrx-sidebar-filter {
        inline-size: calc(100% - 16px); margin: 8px; padding: 6px 10px;
        font-size: 12px; border-radius: 7px;
        border: 1px solid var(--border-color, #e4e4df);
        background: var(--control-bg, #f2f2ef); color: var(--text-color, #3d3d38);
        outline: none; transition: border-color 140ms ease, box-shadow 140ms ease;
      }
      .mrx-sidebar-filter:focus { border-color: var(--primary, #a83c7e); box-shadow: var(--mr-focus, 0 0 0 3px rgba(168,60,126,.28)); }
      .mrx-sb-hidden { display: none !important; }
      .mrx-sb-match { animation: mrx-fade-in 180ms var(--mrx-ease-out); }

      /* §L toast progress */
      .desk-alert { position: relative; overflow: hidden; }
      .mrx-toast-bar {
        position: absolute; inset-block-end: 0; inset-inline-start: 0;
        block-size: 2.5px; inline-size: 100%;
        background: var(--primary, #a83c7e); opacity: .65;
        transform-origin: 0 50%;
        animation: mrx-toast-drain var(--mrx-toast-ms, 5000ms) linear forwards;
      }
      [dir="rtl"] .mrx-toast-bar { transform-origin: 100% 50%; }
      @keyframes mrx-toast-drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      .desk-alert:hover .mrx-toast-bar { animation-play-state: paused; }

      /* §M save flash */
      .mrx-save-flash {
        position: fixed; z-index: 1095; inset-block-start: 18vh; inset-inline: 0; margin-inline: auto;
        inline-size: 64px; block-size: 64px; border-radius: 9999px;
        display: grid; place-items: center;
        background: var(--fg-color, #fff);
        border: 1px solid var(--border-color, #e4e4df);
        box-shadow: 0 12px 40px rgba(25,25,23,.18);
        pointer-events: none;
        animation: mrx-flash-pop 900ms var(--mrx-ease-spring) forwards;
      }
      .mrx-save-flash svg { inline-size: 30px; block-size: 30px; }
      .mrx-save-flash path {
        stroke: var(--green-600, #2e7d32); stroke-width: 2.4; fill: none;
        stroke-linecap: round; stroke-linejoin: round;
        stroke-dasharray: 26; stroke-dashoffset: 26;
        animation: mrx-check-draw 380ms 140ms var(--mrx-ease-out) forwards;
      }
      @keyframes mrx-flash-pop {
        0% { opacity: 0; scale: 0.6; }
        18% { opacity: 1; scale: 1.04; }
        26% { scale: 1; }
        78% { opacity: 1; scale: 1; }
        100% { opacity: 0; scale: 0.92; }
      }
      @keyframes mrx-check-draw { to { stroke-dashoffset: 0; } }

      /* §N route transitions */
      @keyframes mrx-page-in {
        from { opacity: 0; translate: 0 10px; }
        to { opacity: 1; translate: 0 0; }
      }
      .mrx-page-enter { animation: mrx-page-in 280ms var(--mrx-ease-out) both; }

      /* §O ripple */
      .mrx-ripple-host { position: relative; overflow: hidden; }
      .mrx-ripple {
        position: absolute; border-radius: 9999px; pointer-events: none;
        background: currentColor; opacity: 0.18;
        translate: -50% -50%; scale: 0;
        animation: mrx-ripple-grow 520ms var(--mrx-ease-out) forwards;
      }
      @keyframes mrx-ripple-grow {
        to { scale: 1; opacity: 0; }
      }

      /* §P scroll progress */
      .mrx-scroll-progress {
        position: fixed; inset-block-start: 0; inset-inline-start: 0; z-index: 1035;
        block-size: 2px; inline-size: 100%;
        background: var(--primary, #a83c7e);
        transform-origin: 0 50%; transform: scaleX(0);
        opacity: 0; transition: opacity 200ms ease;
      }
      [dir="rtl"] .mrx-scroll-progress { transform-origin: 100% 50%; }
      .mrx-scroll-progress.mrx-show { opacity: 0.85; }

      /* §Q count up — no styles needed, JS driven */

      /* §R list stagger */
      @keyframes mrx-fade-in {
        from { opacity: 0; translate: 0 6px; }
        to { opacity: 1; translate: 0 0; }
      }
      .mrx-stagger { opacity: 0; animation: mrx-fade-in 300ms var(--mrx-ease-out) forwards; animation-delay: var(--mrx-d, 0ms); }

      /* §S card lift */
      .mrx-liftable {
        transition: translate 200ms var(--mrx-ease-out), box-shadow 200ms var(--mrx-ease-out) !important;
      }
      .mrx-liftable:hover {
        translate: 0 -3px;
        box-shadow: 0 10px 28px rgba(25,25,23,.12), 0 2px 6px rgba(25,25,23,.08) !important;
      }
      [data-theme="dark"] .mrx-liftable:hover { box-shadow: 0 10px 28px rgba(0,0,0,.5) !important; }

      /* ═══ reduced motion: kill everything ═══ */
      @media (prefers-reduced-motion: reduce) {
        .mrx-unsaved-pulse, .mrx-page-enter, .mrx-ripple, .mrx-stagger,
        .mrx-save-flash, .mrx-save-flash path, .mrx-sb-match { animation: none !important; }
        .mrx-stagger { opacity: 1; }
        .mrx-back-top, .mrx-copied-tip, .mrx-skip-link, .mrx-modal,
        .mrx-modal-backdrop, .mrx-liftable { transition: none !important; }
        .mrx-liftable:hover { translate: 0 0; }
        .mrx-toast-bar { animation-duration: 0.01ms !important; opacity: 0; }
      }
    `;
    const el = document.createElement("style");
    el.id = "mrx-styles";
    el.textContent = css;
    document.head.appendChild(el);
  };

  /* ── Shared plumbing ───────────────────────────────────────── */
  const routeCallbacks = [];
  const onRouteChange = (fn) => routeCallbacks.push(fn);

  const domCallbacks = [];
  const onDomChange = (fn) => domCallbacks.push(fn);

  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const isTypingTarget = (t) =>
    t instanceof HTMLElement &&
    (t.matches('input, textarea, select, [contenteditable="true"]') ||
      t.closest(".ql-editor, .ce-block"));

  /* Reusable animated modal (used by §I and §J) */
  const createModal = (title) => {
    const backdrop = document.createElement("div");
    backdrop.className = "mrx-modal-backdrop";
    const modal = document.createElement("div");
    modal.className = "mrx-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", title);
    modal.innerHTML = `
      <div class="mrx-modal-head">
        <span class="mrx-modal-title"></span>
        <button type="button" class="mrx-modal-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="mrx-modal-body"></div>`;
    modal.querySelector(".mrx-modal-title").textContent = title;
    const body = modal.querySelector(".mrx-modal-body");

    let prevFocus = null;
    const close = () => {
      backdrop.classList.remove("mrx-show");
      modal.classList.remove("mrx-show");
      const done = () => {
        backdrop.remove();
        modal.remove();
      };
      motionOK() ? setTimeout(done, 230) : done();
      document.removeEventListener("keydown", onKey, true);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    modal.querySelector(".mrx-modal-close").addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", onKey, true);

    prevFocus = document.activeElement;
    document.body.append(backdrop, modal);
    requestAnimationFrame(() => {
      backdrop.classList.add("mrx-show");
      modal.classList.add("mrx-show");
    });
    return { modal, body, close };
  };

  /* ── §A · Scroll elevation on navbar / page head ───────────── */
  const scrollElevation = () => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const scrolled = window.scrollY > 4;
      document.querySelectorAll(".navbar, .page-head").forEach((el) => {
        el.classList.toggle("mrx-elevated", scrolled);
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  };

  /* ── §B · "/" focuses global search ────────────────────────── */
  const slashSearch = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const search = document.querySelector(".search-bar .awesomplete input");
      if (search instanceof HTMLElement) {
        e.preventDefault();
        search.focus();
      }
    });
  };

  /* ── §C · Click-to-copy the document name in the title ─────── */
  const copyDocName = () => {
    let tip = null;
    const showTip = (x, y, text) => {
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "mrx-copied-tip";
        tip.setAttribute("role", "status");
        document.body.appendChild(tip);
      }
      tip.textContent = text;
      tip.style.left = `${x}px`;
      tip.style.top = `${y - 36}px`;
      tip.classList.add("mrx-show");
      window.setTimeout(() => tip && tip.classList.remove("mrx-show"), 1200);
    };

    document.addEventListener("click", (e) => {
      const title =
        e.target instanceof Element &&
        e.target.closest(".page-title .title-text");
      if (!title) return;
      const route = window.location.pathname.split("/").filter(Boolean);
      if (route.length < 3) return;
      const docName = decodeURIComponent(route[route.length - 1]);
      navigator.clipboard
        .writeText(docName)
        .then(() => showTip(e.clientX, e.clientY, "Copied: " + docName))
        .catch(() => {});
    });

    const markTitle = () => {
      const title = document.querySelector(".page-title .title-text");
      if (!title) return;
      const route = window.location.pathname.split("/").filter(Boolean);
      const isDoc = route.length >= 3;
      title.classList.toggle("mrx-copyable", isDoc);
      if (isDoc) title.setAttribute("title", "Click to copy document ID");
    };
    onRouteChange(markTitle);
    markTitle();
  };

  /* ── §D · Back-to-top button ───────────────────────────────── */
  const backToTop = () => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mrx-back-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 12.5V3.5M8 3.5L3.5 8M8 3.5L12.5 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" });
    });
    document.body.appendChild(btn);

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const show =
            window.scrollY > window.innerHeight * MRX_CONFIG.backToTopThreshold;
          btn.classList.toggle("mrx-show", show);
        });
      },
      { passive: true },
    );
  };

  /* ── §E · List density toggle (persisted) ──────────────────── */
  const listDensity = () => {
    const KEY = "density";
    const apply = (mode) => {
      document.documentElement.classList.toggle(
        "mrx-compact",
        mode === "compact",
      );
    };
    apply(store.get(KEY) || "comfortable");

    const ensureToggle = () => {
      const host = document.querySelector(".filter-section, .filter-selector");
      if (!host || host.querySelector(".mrx-density-toggle")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mrx-density-toggle";
      const label = () =>
        document.documentElement.classList.contains("mrx-compact")
          ? "Comfortable"
          : "Compact";
      btn.textContent = label();
      btn.setAttribute("aria-label", "Toggle list density");
      btn.addEventListener("click", () => {
        const next = document.documentElement.classList.contains("mrx-compact")
          ? "comfortable"
          : "compact";
        store.set(KEY, next);
        apply(next);
        btn.textContent = label();
      });
      host.appendChild(btn);
    };
    onDomChange(ensureToggle);
  };

  /* ── §F · Accessibility patches ────────────────────────────── */
  const a11yPatch = () => {
    if (!document.querySelector(".mrx-skip-link")) {
      const skip = document.createElement("a");
      skip.href = "#body";
      skip.className = "mrx-skip-link";
      skip.textContent = "Skip to main content";
      skip.addEventListener("click", (e) => {
        const main = document.querySelector(
          ".layout-main-section, .layout-main, main",
        );
        if (main instanceof HTMLElement) {
          e.preventDefault();
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: false });
        }
      });
      document.body.prepend(skip);
    }

    const patch = () => {
      document
        .querySelectorAll(
          ".page-icon-group .btn:not([aria-label]), .page-actions .icon-btn:not([aria-label])",
        )
        .forEach((btn) => {
          const hint =
            btn.getAttribute("title") ||
            btn.getAttribute("data-original-title") ||
            (btn.querySelector("use") &&
              (btn.querySelector("use").getAttribute("href") || "")
                .replace(/^#icon-/, "")
                .replace(/-/g, " "));
          if (hint) btn.setAttribute("aria-label", hint);
        });

      document
        .querySelectorAll(
          ".standard-sidebar-item.selected .item-anchor, .sidebar-item.selected a",
        )
        .forEach((a) => a.setAttribute("aria-current", "page"));
      document
        .querySelectorAll(
          ".standard-sidebar-item:not(.selected) [aria-current]",
        )
        .forEach((a) => a.removeAttribute("aria-current"));

      document
        .querySelectorAll("#alert-container, .desk-alert")
        .forEach((el) => {
          if (!el.getAttribute("role")) el.setAttribute("role", "status");
          if (!el.getAttribute("aria-live"))
            el.setAttribute("aria-live", "polite");
        });
    };
    onDomChange(patch);
    patch();
  };

  /* ── §G · Sticky child-table headers ───────────────────────── */
  const stickyGridHeader = () => {
    const mark = () => {
      document
        .querySelectorAll(".form-grid")
        .forEach((g) => g.classList.add("mrx-sticky-head"));
    };
    onDomChange(mark);
    mark();
  };

  /* ── §H · Unsaved-changes pulse on the primary action ──────── */
  const formProgressHint = () => {
    const sync = () => {
      const dirty =
        typeof window.cur_frm !== "undefined" &&
        window.cur_frm &&
        window.cur_frm.is_dirty &&
        window.cur_frm.is_dirty();
      const primary = document.querySelector(".page-actions .btn-primary");
      if (primary)
        primary.classList.toggle("mrx-unsaved-pulse", Boolean(dirty));
    };
    onDomChange(sync);
    document.addEventListener("change", sync, true);
    document.addEventListener("keyup", debounce(sync, 400), true);
  };

  /* ── §I · Keyboard shortcuts cheat sheet ("?") ─────────────── */
  const shortcutsOverlay = () => {
    const SHORTCUTS = [
      {
        group: "Global",
        rows: [
          ["Focus global search", ["/"]],
          ["Awesomebar", ["Ctrl", "G"]],
          ["Recent documents", ["Alt", "R"]],
          ["This cheat sheet", ["?"]],
        ],
      },
      {
        group: "Documents",
        rows: [
          ["Save", ["Ctrl", "S"]],
          ["New document", ["Ctrl", "B"]],
          ["Print", ["Ctrl", "P"]],
          ["Copy document ID", ["Click title"]],
        ],
      },
      {
        group: "Lists",
        rows: [
          ["Select all rows", ["Ctrl", "A"]],
          ["Toggle density", ["Compact button"]],
        ],
      },
    ];

    let open = false;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target) || open) return;
      e.preventDefault();
      open = true;
      const { body, close, modal } = createModal("Keyboard shortcuts");
      modal.addEventListener("transitionend", () => {}, { once: true });
      SHORTCUTS.forEach(({ group, rows }) => {
        const g = document.createElement("div");
        g.className = "mrx-sc-group";
        g.textContent = group;
        body.appendChild(g);
        rows.forEach(([label, keys]) => {
          const row = document.createElement("div");
          row.className = "mrx-sc-row";
          const name = document.createElement("span");
          name.textContent = label;
          const kbds = document.createElement("span");
          keys.forEach((k) => {
            const kbd = document.createElement("kbd");
            kbd.className = "mrx-kbd";
            kbd.textContent = k;
            kbds.appendChild(kbd);
          });
          row.append(name, kbds);
          body.appendChild(row);
        });
      });
      const origClose = close;
      const watch = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
          open = false;
          watch.disconnect();
        }
      });
      watch.observe(document.body, { childList: true });
      void origClose;
    });
  };

  /* ── §J · Recent documents palette (Alt+R) ─────────────────── */
  const recentDocs = () => {
    const KEY = "recent-docs";

    // Track visits: routes shaped /app/<doctype>/<name>
    const track = () => {
      const route = window.location.pathname.split("/").filter(Boolean);
      if (route.length < 3 || route[0] !== "app") return;
      const doctype = route[1].replace(/-/g, " ");
      const name = decodeURIComponent(route[2]);
      if (name === "new" || name.startsWith("new-")) return;
      const list = store.getJSON(KEY, []);
      const next = [
        { doctype, name, path: window.location.pathname, t: Date.now() },
        ...list.filter((d) => d.path !== window.location.pathname),
      ].slice(0, MRX_CONFIG.recentDocsMax);
      store.setJSON(KEY, next);
    };
    onRouteChange(track);
    track();

    let open = false;
    document.addEventListener("keydown", (e) => {
      if (!(e.altKey && (e.key === "r" || e.key === "R" || e.code === "KeyR")))
        return;
      if (open) return;
      e.preventDefault();
      open = true;

      const { body, close, modal } = createModal("Recent documents");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "mrx-recent-input";
      input.placeholder = "Filter recent documents…";
      input.setAttribute("aria-label", "Filter recent documents");
      body.before(input);

      const listWrap = document.createElement("div");
      body.appendChild(listWrap);

      let items = [];
      let active = 0;

      const render = (filter) => {
        const all = store.getJSON(KEY, []);
        const q = (filter || "").trim().toLowerCase();
        const filtered = q
          ? all.filter((d) =>
              (d.doctype + " " + d.name).toLowerCase().includes(q),
            )
          : all;
        listWrap.innerHTML = "";
        items = [];
        active = 0;
        if (!filtered.length) {
          const empty = document.createElement("div");
          empty.className = "mrx-recent-empty";
          empty.textContent = q
            ? "No matches."
            : "No recent documents yet — open a few documents first.";
          listWrap.appendChild(empty);
          return;
        }
        filtered.forEach((d, i) => {
          const row = document.createElement("div");
          row.className = "mrx-recent-item" + (i === 0 ? " mrx-active" : "");
          row.setAttribute("role", "option");
          if (motionOK()) {
            row.classList.add("mrx-stagger");
            row.style.setProperty("--mrx-d", `${Math.min(i * 24, 200)}ms`);
          }
          const badge = document.createElement("span");
          badge.className = "mrx-recent-doctype";
          badge.textContent = d.doctype;
          const name = document.createElement("span");
          name.className = "mrx-recent-name";
          name.textContent = d.name;
          row.append(badge, name);
          row.addEventListener("click", () => go(d));
          listWrap.appendChild(row);
          items.push({ el: row, data: d });
        });
      };

      const go = (d) => {
        closeAll();
        if (window.frappe && window.frappe.set_route) {
          window.frappe.set_route(d.path.replace(/^\/app\//, "").split("/"));
        } else {
          window.location.assign(d.path);
        }
      };

      const setActive = (i) => {
        if (!items.length) return;
        active = (i + items.length) % items.length;
        items.forEach((it, idx) =>
          it.el.classList.toggle("mrx-active", idx === active),
        );
        items[active].el.scrollIntoView({ block: "nearest" });
      };

      const onKey = (e2) => {
        if (e2.key === "ArrowDown") {
          e2.preventDefault();
          setActive(active + 1);
        } else if (e2.key === "ArrowUp") {
          e2.preventDefault();
          setActive(active - 1);
        } else if (e2.key === "Enter" && items[active]) {
          e2.preventDefault();
          go(items[active].data);
        }
      };
      input.addEventListener("keydown", onKey);
      input.addEventListener("input", () => render(input.value));

      const closeAll = () => {
        close();
      };
      const watch = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
          open = false;
          watch.disconnect();
        }
      });
      watch.observe(document.body, { childList: true });

      render("");
      requestAnimationFrame(() => input.focus());
    });
  };

  /* ── §K · Sidebar type-to-filter ───────────────────────────── */
  const sidebarFilter = () => {
    const ensure = () => {
      const sidebar = document.querySelector(
        ".desk-sidebar, .standard-sidebar-section",
      );
      if (!sidebar || sidebar.querySelector(".mrx-sidebar-filter")) return;
      const input = document.createElement("input");
      input.type = "text";
      input.className = "mrx-sidebar-filter";
      input.placeholder = "Filter…";
      input.setAttribute("aria-label", "Filter sidebar items");
      const run = debounce(() => {
        const q = input.value.trim().toLowerCase();
        sidebar
          .querySelectorAll(".standard-sidebar-item, .sidebar-item")
          .forEach((item) => {
            const text = (item.textContent || "").toLowerCase();
            const match = !q || text.includes(q);
            item.classList.toggle("mrx-sb-hidden", !match);
            if (match && q) item.classList.add("mrx-sb-match");
            else item.classList.remove("mrx-sb-match");
          });
      }, 80);
      input.addEventListener("input", run);
      sidebar.prepend(input);
    };
    onDomChange(ensure);
    ensure();
  };

  /* ── §L · Toast upgrade: countdown bar + hover pause ───────── */
  const toastUpgrade = () => {
    const decorate = () => {
      document
        .querySelectorAll(".desk-alert:not([data-mrx-toast])")
        .forEach((alert) => {
          alert.dataset.mrxToast = "1";
          const bar = document.createElement("div");
          bar.className = "mrx-toast-bar";
          bar.style.setProperty(
            "--mrx-toast-ms",
            `${MRX_CONFIG.toastDuration}ms`,
          );
          alert.appendChild(bar);
        });
    };
    onDomChange(decorate);
    decorate();

    // Hover keeps the toast alive (Frappe fades via inline opacity)
    document.addEventListener(
      "mouseenter",
      (e) => {
        const alert =
          e.target instanceof Element && e.target.closest(".desk-alert");
        if (alert) alert.dataset.mrxHover = "1";
      },
      true,
    );
    document.addEventListener(
      "mouseleave",
      (e) => {
        const alert =
          e.target instanceof Element && e.target.closest(".desk-alert");
        if (alert) delete alert.dataset.mrxHover;
      },
      true,
    );
    const obs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (
          m.target instanceof HTMLElement &&
          m.target.classList.contains("desk-alert") &&
          m.target.dataset.mrxHover
        ) {
          m.target.style.opacity = "1";
        }
      });
    });
    obs.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["style"],
    });
  };

  /* ── §M · Save success flash (animated checkmark) ──────────── */
  const saveFlash = () => {
    const show = () => {
      if (!motionOK()) return;
      if (document.querySelector(".mrx-save-flash")) return;
      const el = document.createElement("div");
      el.className = "mrx-save-flash";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.5"/></svg>';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 950);
    };

    // Frappe fires "after_save" style hooks; fall back to watching the
    // indicator pill flip from "Not Saved" to "Saved".
    let wasDirty = false;
    const watch = () => {
      const dirty =
        typeof window.cur_frm !== "undefined" &&
        window.cur_frm &&
        window.cur_frm.is_dirty &&
        window.cur_frm.is_dirty();
      if (wasDirty && !dirty) show();
      wasDirty = Boolean(dirty);
    };
    onDomChange(watch);
  };

  /* ── §N · Route transitions (fade/slide the main section) ──── */
  const routeTransitions = () => {
    let lastPath = window.location.pathname;
    const animate = () => {
      if (!motionOK()) return;
      if (window.location.pathname === lastPath) return;
      lastPath = window.location.pathname;
      const main = document.querySelector(".layout-main-section, .layout-main");
      if (!(main instanceof HTMLElement)) return;
      main.classList.remove("mrx-page-enter");
      // reflow to restart the animation
      void main.offsetWidth;
      main.classList.add("mrx-page-enter");
      main.addEventListener(
        "animationend",
        () => main.classList.remove("mrx-page-enter"),
        { once: true },
      );
    };
    onRouteChange(animate);
  };

  /* ── §O · Pointer-tracked ripple on buttons ────────────────── */
  const rippleButtons = () => {
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (!motionOK()) return;
        const btn =
          e.target instanceof Element &&
          e.target.closest(".btn, .mrx-back-top");
        if (!(btn instanceof HTMLElement)) return;
        btn.classList.add("mrx-ripple-host");
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const ripple = document.createElement("span");
        ripple.className = "mrx-ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), {
          once: true,
        });
        // safety cleanup
        setTimeout(() => ripple.isConnected && ripple.remove(), 700);
      },
      { passive: true },
    );
  };

  /* ── §P · Scroll reading-progress bar ──────────────────────── */
  const scrollProgress = () => {
    const bar = document.createElement("div");
    bar.className = "mrx-scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const showable = max > doc.clientHeight * 0.75; // only on genuinely long pages
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
      bar.classList.toggle("mrx-show", showable && p > 0.01);
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    onRouteChange(() => requestAnimationFrame(update));
    update();
  };

  /* ── §Q · Count-up animation for dashboard number cards ────── */
  const countUp = () => {
    const animateEl = (el) => {
      const raw = (el.textContent || "").trim();
      // Parse "1,234.56", "SAR 1,200", "42%", "1.2k" — keep prefix/suffix
      const m = raw.match(/^([^\d\-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const [, prefix, numStr, suffix] = m;
      const target = parseFloat(numStr.replace(/,/g, ""));
      if (!isFinite(target) || Math.abs(target) < 2) return;
      const decimals = (numStr.split(".")[1] || "").length;
      const useGrouping = numStr.includes(",");
      const dur = 700;
      const t0 = performance.now();
      const fmt = (v) =>
        useGrouping
          ? v.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          : v.toFixed(decimals);
      const step = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = prefix + fmt(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      };
      requestAnimationFrame(step);
    };

    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          io.unobserve(el);
          if (motionOK()) animateEl(el);
        });
      },
      { threshold: 0.4 },
    );

    const scan = () => {
      document
        .querySelectorAll(
          ".number-card .widget-content .number, .widget.number-widget .number",
        )
        .forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          io.observe(el);
        });
    };
    onDomChange(scan);
    scan();
  };

  /* ── §R · Staggered entrance for list rows ─────────────────── */
  const listStagger = () => {
    let lastPath = null;
    const run = () => {
      if (!motionOK()) return;
      if (window.location.pathname === lastPath) return;
      const rows = document.querySelectorAll(".list-row-container");
      if (!rows.length) return;
      lastPath = window.location.pathname;
      rows.forEach((row, i) => {
        if (i > 14) return; // only animate above-the-fold rows
        row.classList.add("mrx-stagger");
        row.style.setProperty("--mrx-d", `${i * 26}ms`);
        row.addEventListener(
          "animationend",
          () => {
            row.classList.remove("mrx-stagger");
            row.style.removeProperty("--mrx-d");
          },
          { once: true },
        );
      });
    };
    onDomChange(debounce(run, 60));
  };

  /* ── §S · Hover lift for dashboard / workspace cards ───────── */
  const cardLift = () => {
    const mark = () => {
      document
        .querySelectorAll(
          ".widget.number-widget, .widget.shortcut-widget-box, .widget.links-widget-box, .number-card",
        )
        .forEach((el) => el.classList.add("mrx-liftable"));
    };
    onDomChange(mark);
    mark();
  };

  /* ── Observers boot ────────────────────────────────────────── */
  const startObservers = () => {
    if (window.frappe && window.frappe.router && window.frappe.router.on) {
      window.frappe.router.on("change", () =>
        routeCallbacks.forEach((fn) => fn()),
      );
    } else {
      let last = location.href;
      setInterval(() => {
        if (location.href !== last) {
          last = location.href;
          routeCallbacks.forEach((fn) => fn());
        }
      }, 400);
    }

    const runDom = debounce(() => domCallbacks.forEach((fn) => fn()), 120);
    new MutationObserver(runDom).observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  /* ── Boot ──────────────────────────────────────────────────── */
  const boot = () => {
    injectStyles();
    startObservers();
    // core
    if (MRX_CONFIG.scrollElevation) scrollElevation();
    if (MRX_CONFIG.slashSearch) slashSearch();
    if (MRX_CONFIG.copyDocName) copyDocName();
    if (MRX_CONFIG.backToTop) backToTop();
    if (MRX_CONFIG.listDensity) listDensity();
    if (MRX_CONFIG.a11yPatch) a11yPatch();
    if (MRX_CONFIG.stickyGridHeader) stickyGridHeader();
    if (MRX_CONFIG.formProgressHint) formProgressHint();
    // power
    if (MRX_CONFIG.shortcutsOverlay) shortcutsOverlay();
    if (MRX_CONFIG.recentDocs) recentDocs();
    if (MRX_CONFIG.sidebarFilter) sidebarFilter();
    if (MRX_CONFIG.toastUpgrade) toastUpgrade();
    if (MRX_CONFIG.saveFlash) saveFlash();
    // animation
    if (MRX_CONFIG.routeTransitions) routeTransitions();
    if (MRX_CONFIG.rippleButtons) rippleButtons();
    if (MRX_CONFIG.scrollProgress) scrollProgress();
    if (MRX_CONFIG.countUp) countUp();
    if (MRX_CONFIG.listStagger) listStagger();
    if (MRX_CONFIG.cardLift) cardLift();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
