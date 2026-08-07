/* ══════════════════════════════════════════════════════════════════
   MERIDIAN 3.0 — WORKSPACE + SIDEBAR ENHANCEMENT LAYER (companion)
   ERPNext v16 / Frappe v16 · Pure additive layer · Zero theme edits

   Companion to meridian-ux-enhancements.js (v2). Load AFTER it:
     app_include_js = [
       "/assets/<your_app>/js/meridian-ux-enhancements.js",
       "/assets/<your_app>/js/meridian-workspace-sidebar.js",
     ]

   All selectors/styles are namespaced `mrw-` (never collides with the
   theme's `mr-` tokens or v2's `mrx-` layer). Never touches meridian.css.

   MODULES (independently toggleable in MRW_CONFIG)
   ── Sidebar power ──────────────────────────────────────────────
   §A  sidebarCollapse  — Alt+B rail-collapse with persisted state
                          (auto-skips if Frappe ships its own toggle)
   §B  sidebarPins      — star-to-pin favorites group at the top,
                          persisted, animated add/remove
   §C  sidebarGlide     — a hover "pill" that glides between items
   §D  sidebarReveal    — selected item auto-scrolls into view after
                          route changes; section open/closed persisted
   §E  sidebarPeek      — floating label tooltip when rail-collapsed
   ── Workspace delight ──────────────────────────────────────────
   §F  widgetEntrance   — widgets cascade in with soft stagger
   §G  widgetTilt       — pointer-tracked tilt + sheen on shortcut
                          and number cards (desktop pointer only)
   §H  greetingChip     — time-aware greeting with the user's name
   §I  sectionCollapse  — links-widget sections collapse w/ chevron,
                          persisted per workspace
   §J  workspaceTrail   — "recently visited workspaces" chips row

   Every animation respects `prefers-reduced-motion: reduce`.
   All colors come from theme CSS variables → light/dark/RTL safe.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ── Configuration ─────────────────────────────────────────── */
  const MRW_CONFIG = {
    sidebarCollapse: true,
    sidebarPins: true,
    sidebarGlide: true,
    sidebarReveal: true,
    sidebarPeek: true,
    widgetEntrance: true,
    widgetTilt: true,
    greetingChip: true,
    sectionCollapse: true,
    workspaceTrail: true,
    // tuning
    storagePrefix: "mrw:",
    trailMax: 6,
    staggerStep: 45, // ms between widget entrances
    tiltMax: 3, // degrees
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionOK = () => !reducedMotion.matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const store = {
    get: (k) => {
      try {
        return localStorage.getItem(MRW_CONFIG.storagePrefix + k);
      } catch {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(MRW_CONFIG.storagePrefix + k, v);
      } catch {
        /* private mode */
      }
    },
    getJSON: (k, fb) => {
      try {
        return JSON.parse(store.get(k)) ?? fb;
      } catch {
        return fb;
      }
    },
    setJSON: (k, v) => store.set(k, JSON.stringify(v)),
  };

  const onRoute = (fn) => {
    if (window.frappe?.router?.on)
      frappe.router.on("change", () => setTimeout(fn, 80));
    window.addEventListener("popstate", () => setTimeout(fn, 80));
  };

  const isWorkspacePage = () =>
    document.querySelector('[data-page-route="Workspaces"]') !== null;

  const deskSidebar = () =>
    document.querySelector(
      ".desk-sidebar, .layout-side-section .desk-sidebar",
    ) || document.querySelector(".layout-side-section .standard-sidebar");

  /* ── Namespaced styles (additive only, mrw- prefix) ────────── */
  const injectStyles = () => {
    if (document.getElementById("mrw-styles")) return;
    const css = `
      :root {
        --mrw-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
        --mrw-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* ═══ §A sidebar collapse ═══ */
      .mrw-collapse-btn {
        display: inline-flex; align-items: center; justify-content: center;
        inline-size: 26px; block-size: 26px; border-radius: 7px;
        border: 1px solid var(--border-color, #e4e4df);
        background: var(--fg-color, #fff); color: var(--text-muted, #6c6c65);
        cursor: pointer; margin: 6px; line-height: 0; flex: 0 0 auto;
        transition: color 140ms ease, border-color 140ms ease,
                    background-color 140ms ease, scale 140ms var(--mrw-ease-spring);
      }
      .mrw-collapse-btn:hover { color: var(--primary, #a83c7e); border-color: var(--dark-border-color, #d7d7d1); }
      .mrw-collapse-btn:active { scale: 0.92; }
      .mrw-collapse-btn svg { transition: rotate 240ms var(--mrw-ease-spring); }
      html.mrw-rail .mrw-collapse-btn svg { rotate: 180deg; }
      [dir="rtl"] .mrw-collapse-btn svg { rotate: 180deg; }
      [dir="rtl"] html.mrw-rail .mrw-collapse-btn svg,
      html.mrw-rail [dir="rtl"] .mrw-collapse-btn svg { rotate: 0deg; }

      html.mrw-rail .layout-side-section:has(.desk-sidebar),
      html.mrw-rail .body-sidebar-container .desk-sidebar { }
      html.mrw-rail .mrw-rail-target {
        inline-size: 52px !important; min-inline-size: 52px !important;
        overflow: visible !important;
        transition: inline-size 260ms var(--mrw-ease-out), min-inline-size 260ms var(--mrw-ease-out);
      }
      .mrw-rail-target { transition: inline-size 260ms var(--mrw-ease-out), min-inline-size 260ms var(--mrw-ease-out); }
      html.mrw-rail .mrw-rail-target .sidebar-item-label,
      html.mrw-rail .mrw-rail-target .item-anchor > span:not(.sidebar-item-icon),
      html.mrw-rail .mrw-rail-target .standard-sidebar-label,
      html.mrw-rail .mrw-rail-target .sidebar-item-control,
      html.mrw-rail .mrw-rail-target .drop-icon,
      html.mrw-rail .mrw-rail-target .mrw-pin-head {
        opacity: 0; inline-size: 0; overflow: hidden; pointer-events: none;
        transition: opacity 160ms ease;
      }
      html.mrw-rail .mrw-rail-target .sidebar-item-icon { margin-inline: auto; }

      /* ═══ §B pins ═══ */
      .mrw-pin-group { margin-block-end: 6px; }
      .mrw-pin-head {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 10px 4px; font-size: 10.5px; font-weight: 700;
        letter-spacing: .07em; text-transform: uppercase;
        color: var(--text-muted, #6c6c65);
      }
      .mrw-pin-empty { display: none; }
      .mrw-pin-btn {
        border: 0; background: none; cursor: pointer; padding: 2px;
        color: var(--text-muted, #6c6c65); line-height: 0; border-radius: 5px;
        opacity: 0; margin-inline-start: auto; flex: 0 0 auto;
        transition: opacity 140ms ease, color 140ms ease, scale 140ms var(--mrw-ease-spring);
      }
      .sidebar-item-container:hover > .standard-sidebar-item .mrw-pin-btn,
      .standard-sidebar-item:hover .mrw-pin-btn,
      .mrw-pin-btn.mrw-pinned { opacity: 1; }
      .mrw-pin-btn:hover { color: var(--primary, #a83c7e); scale: 1.2; }
      .mrw-pin-btn:active { scale: 0.9; }
      .mrw-pin-btn.mrw-pinned { color: var(--primary, #a83c7e); }
      @keyframes mrw-pin-pop { 0% { scale: 1; } 45% { scale: 1.45; rotate: -12deg; } 100% { scale: 1; rotate: 0deg; } }
      .mrw-pin-btn.mrw-pop { animation: mrw-pin-pop 320ms var(--mrw-ease-spring); }
      .mrw-pin-item { animation: mrw-slide-in 260ms var(--mrw-ease-out) both; }
      @keyframes mrw-slide-in { from { opacity: 0; translate: 0 -6px; } to { opacity: 1; translate: 0 0; } }

      /* ═══ §C glide pill ═══ */
      .mrw-glide {
        position: absolute; inset-inline: 4px; z-index: 0;
        border-radius: var(--mr-radius-sm, 7px);
        background: var(--mr-surface-active, rgba(25,25,23,.055));
        opacity: 0; pointer-events: none;
        transition: transform 190ms var(--mrw-ease-out), block-size 190ms var(--mrw-ease-out), opacity 150ms ease;
        will-change: transform;
      }
      .mrw-glide-host { position: relative; }
      .mrw-glide-host .standard-sidebar-item,
      .mrw-glide-host .sidebar-item-container { position: relative; z-index: 1; }
      .mrw-glide-host .standard-sidebar-item:hover { background-color: transparent !important; }

      /* ═══ §E peek tooltip ═══ */
      .mrw-peek {
        position: fixed; z-index: 1080; padding: 5px 11px;
        font-size: 12px; font-weight: 600; white-space: nowrap;
        border-radius: 7px; pointer-events: none;
        background: var(--mr-ink-900, #191917); color: #fff;
        box-shadow: 0 4px 14px rgba(25,25,23,.25);
        opacity: 0; translate: -4px 0; scale: 0.95;
        transition: opacity 140ms var(--mrw-ease-out), translate 140ms var(--mrw-ease-spring), scale 140ms var(--mrw-ease-spring);
      }
      [dir="rtl"] .mrw-peek { translate: 4px 0; }
      .mrw-peek.mrw-show { opacity: 1; translate: 0 0; scale: 1; }

      /* ═══ §F widget entrance ═══ */
      .mrw-enter { opacity: 0; translate: 0 14px; }
      .mrw-enter-go {
        opacity: 1; translate: 0 0;
        transition: opacity 380ms var(--mrw-ease-out), translate 380ms var(--mrw-ease-out);
      }

      /* ═══ §G tilt + sheen ═══ */
      .mrw-tilt {
        transform-style: preserve-3d;
        transition: transform 180ms var(--mrw-ease-out), box-shadow 180ms ease;
        position: relative; overflow: hidden;
      }
      .mrw-tilt::after {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(220px circle at var(--mrw-mx, 50%) var(--mrw-my, 50%),
                    var(--mr-accent-soft, rgba(168,60,126,.10)), transparent 65%);
        opacity: 0; transition: opacity 220ms ease;
      }
      .mrw-tilt:hover::after { opacity: 1; }

      /* ═══ §H greeting chip ═══ */
      .mrw-greet {
        display: inline-flex; align-items: baseline; gap: 8px;
        margin: 2px 0 10px; padding: 6px 14px;
        border-radius: 9999px; font-size: 13px;
        background: var(--mr-accent-soft, rgba(168,60,126,.09));
        color: var(--heading-color, #191917);
        border: 1px solid transparent;
        animation: mrw-slide-in 420ms var(--mrw-ease-out) both;
      }
      .mrw-greet strong { color: var(--primary, #a83c7e); font-weight: 700; }
      .mrw-greet time { font-size: 11.5px; color: var(--text-muted, #6c6c65); font-variant-numeric: tabular-nums; }

      /* ═══ §I section collapse ═══ */
      .mrw-sec-toggle {
        border: 0; background: none; cursor: pointer; padding: 2px;
        color: var(--text-muted, #6c6c65); line-height: 0; border-radius: 5px;
        margin-inline-start: 6px; flex: 0 0 auto;
        transition: color 140ms ease, rotate 220ms var(--mrw-ease-spring);
      }
      .mrw-sec-toggle:hover { color: var(--primary, #a83c7e); }
      .mrw-sec-closed .mrw-sec-toggle { rotate: -90deg; }
      [dir="rtl"] .mrw-sec-closed .mrw-sec-toggle { rotate: 90deg; }
      .mrw-sec-body { overflow: hidden; transition: block-size 260ms var(--mrw-ease-out), opacity 220ms ease; }
      .mrw-sec-closed .mrw-sec-body { opacity: 0.15; }

      /* ═══ §J workspace trail ═══ */
      .mrw-trail {
        display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        margin-block: 2px 12px;
      }
      .mrw-trail-label { font-size: 11px; font-weight: 600; color: var(--text-muted, #6c6c65); letter-spacing: .04em; }
      .mrw-trail-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500;
        background: var(--fg-color, #fff); color: var(--text-color, #3d3d38);
        border: 1px solid var(--border-color, #e4e4df);
        cursor: pointer; text-decoration: none;
        animation: mrw-slide-in 300ms var(--mrw-ease-out) both;
        transition: color 140ms ease, border-color 140ms ease, scale 140ms var(--mrw-ease-spring), box-shadow 140ms ease;
      }
      .mrw-trail-chip:nth-child(2) { animation-delay: 30ms; }
      .mrw-trail-chip:nth-child(3) { animation-delay: 60ms; }
      .mrw-trail-chip:nth-child(4) { animation-delay: 90ms; }
      .mrw-trail-chip:nth-child(5) { animation-delay: 120ms; }
      .mrw-trail-chip:nth-child(6) { animation-delay: 150ms; }
      .mrw-trail-chip:hover {
        color: var(--primary, #a83c7e); border-color: var(--primary, #a83c7e);
        text-decoration: none; scale: 1.04; box-shadow: var(--mr-shadow-sm, 0 2px 6px rgba(25,25,23,.08));
      }
      .mrw-trail-chip:active { scale: 0.97; }

      /* reduced motion: kill everything */
      @media (prefers-reduced-motion: reduce) {
        .mrw-enter { opacity: 1; translate: 0 0; }
        .mrw-tilt, .mrw-glide, .mrw-rail-target, .mrw-sec-body,
        .mrw-trail-chip, .mrw-greet, .mrw-pin-item { transition: none !important; animation: none !important; }
      }
    `;
    const el = document.createElement("style");
    el.id = "mrw-styles";
    el.textContent = css;
    document.head.appendChild(el);
  };

  const svgIcon = (d, size = 14) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    chevron: svgIcon('<polyline points="15 18 9 12 15 6"/>'),
    chevDown: svgIcon('<polyline points="6 9 12 15 18 9"/>', 13),
    pin: svgIcon(
      '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/>',
      13,
    ),
  };

  /* ════════════════════════════════════════════════════════════
     §A · SIDEBAR COLLAPSE — Alt+B rail mode, persisted
     Skips itself when Frappe v16 ships a native toggle button.
     ════════════════════════════════════════════════════════════ */
  const initSidebarCollapse = () => {
    if (!MRW_CONFIG.sidebarCollapse) return;

    const apply = () => {
      // native toggle present? stand down entirely.
      if (
        document.querySelector(".body-sidebar-toggle-btn, .sidebar-toggle-btn")
      )
        return;

      const sb = deskSidebar();
      if (!sb || sb.dataset.mrwCollapse) return;
      const target = sb.closest(".layout-side-section") || sb;
      target.classList.add("mrw-rail-target");
      sb.dataset.mrwCollapse = "1";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mrw-collapse-btn";
      btn.setAttribute("aria-label", "Toggle sidebar (Alt+B)");
      btn.title = "Toggle sidebar · Alt+B";
      btn.innerHTML = ICONS.chevron;
      sb.prepend(btn);

      const setState = (rail) => {
        document.documentElement.classList.toggle("mrw-rail", rail);
        store.set("rail", rail ? "1" : "0");
        btn.setAttribute("aria-expanded", String(!rail));
      };
      btn.addEventListener("click", () =>
        setState(!document.documentElement.classList.contains("mrw-rail")),
      );
      if (store.get("rail") === "1") setState(true);
    };

    document.addEventListener("keydown", (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyB") {
        const btn = document.querySelector(".mrw-collapse-btn");
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });

    apply();
    onRoute(apply);
    new MutationObserver(apply).observe(document.body, {
      childList: true,
      subtree: false,
    });
  };

  /* ════════════════════════════════════════════════════════════
     §B · SIDEBAR PINS — favorites group at the top, persisted
     ════════════════════════════════════════════════════════════ */
  const initSidebarPins = () => {
    if (!MRW_CONFIG.sidebarPins) return;
    const KEY = "pins";

    const getPins = () => store.getJSON(KEY, []);
    const setPins = (p) => store.setJSON(KEY, p);

    const itemMeta = (item) => {
      const a = item.querySelector("a.item-anchor, a");
      if (!a) return null;
      const label = (a.textContent || "").trim();
      const href = a.getAttribute("href") || "";
      return label && href ? { label, href } : null;
    };

    const render = () => {
      const sb = deskSidebar();
      if (!sb) return;

      /* 1 · pinned group */
      let group = sb.querySelector(":scope > .mrw-pin-group");
      const pins = getPins();
      if (!group) {
        group = document.createElement("div");
        group.className = "mrw-pin-group";
        const head = document.createElement("div");
        head.className = "mrw-pin-head";
        head.innerHTML = `${ICONS.pin}<span>Pinned</span>`;
        group.appendChild(head);
        const anchor = sb.querySelector(".mrw-collapse-btn");
        anchor ? anchor.after(group) : sb.prepend(group);
      }
      group.querySelectorAll(".mrw-pin-item").forEach((n) => n.remove());
      group.classList.toggle("mrw-pin-empty", pins.length === 0);
      pins.forEach((p) => {
        const row = document.createElement("div");
        row.className = "standard-sidebar-item mrw-pin-item";
        row.innerHTML = `<a class="item-anchor" href="${p.href}"><span>${p.label}</span></a>`;
        const un = document.createElement("button");
        un.type = "button";
        un.className = "mrw-pin-btn mrw-pinned";
        un.setAttribute("aria-label", `Unpin ${p.label}`);
        un.innerHTML = ICONS.pin;
        un.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setPins(getPins().filter((x) => x.href !== p.href));
          render();
        });
        row.querySelector("a").appendChild(un);
        group.appendChild(row);
      });

      /* 2 · pin buttons on regular items */
      sb.querySelectorAll(".standard-sidebar-item:not(.mrw-pin-item)").forEach(
        (item) => {
          if (
            item.querySelector(":scope > a .mrw-pin-btn, :scope .mrw-pin-btn")
          )
            return;
          const meta = itemMeta(item);
          if (!meta) return;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "mrw-pin-btn";
          btn.setAttribute("aria-label", `Pin ${meta.label}`);
          btn.innerHTML = ICONS.pin;
          const sync = () =>
            btn.classList.toggle(
              "mrw-pinned",
              getPins().some((x) => x.href === meta.href),
            );
          sync();
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pins2 = getPins();
            const i = pins2.findIndex((x) => x.href === meta.href);
            if (i >= 0) pins2.splice(i, 1);
            else pins2.unshift(meta);
            setPins(pins2.slice(0, 10));
            btn.classList.add("mrw-pop");
            setTimeout(() => btn.classList.remove("mrw-pop"), 340);
            render();
          });
          const anchor = item.querySelector("a.item-anchor, a");
          (anchor || item).appendChild(btn);
        },
      );
    };

    render();
    onRoute(render);
    let t;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(render, 160);
    }).observe(document.body, { childList: true, subtree: true });
  };

  /* ════════════════════════════════════════════════════════════
     §C · SIDEBAR GLIDE — hover pill that glides between items
     ════════════════════════════════════════════════════════════ */
  const initSidebarGlide = () => {
    if (!MRW_CONFIG.sidebarGlide || !finePointer.matches) return;

    const ensurePill = (host) => {
      let pill = host.querySelector(":scope > .mrw-glide");
      if (!pill) {
        host.classList.add("mrw-glide-host");
        pill = document.createElement("div");
        pill.className = "mrw-glide";
        host.prepend(pill);
      }
      return pill;
    };

    document.addEventListener("pointerover", (e) => {
      const item = e.target.closest?.(
        ".desk-sidebar .standard-sidebar-item, .standard-sidebar .standard-sidebar-item",
      );
      if (!item) return;
      const host = item.closest(".desk-sidebar, .standard-sidebar");
      if (!host) return;
      const pill = ensurePill(host);
      const hb = host.getBoundingClientRect();
      const ib = item.getBoundingClientRect();
      if (!motionOK()) return;
      pill.style.transform = `translateY(${ib.top - hb.top + host.scrollTop}px)`;
      pill.style.blockSize = `${ib.height}px`;
      pill.style.opacity = "1";
    });
    document.addEventListener("pointerout", (e) => {
      const host = e.target.closest?.(".desk-sidebar, .standard-sidebar");
      if (!host) return;
      if (host.contains(e.relatedTarget)) return;
      const pill = host.querySelector(":scope > .mrw-glide");
      if (pill) pill.style.opacity = "0";
    });
  };

  /* ════════════════════════════════════════════════════════════
     §D · SIDEBAR REVEAL — selected item scrolled into view
     ════════════════════════════════════════════════════════════ */
  const initSidebarReveal = () => {
    if (!MRW_CONFIG.sidebarReveal) return;
    const reveal = () => {
      const sel = document.querySelector(
        ".desk-sidebar .standard-sidebar-item.selected, .desk-sidebar .sidebar-item.selected",
      );
      if (!sel) return;
      const box = sel.closest(".desk-sidebar");
      if (!box) return;
      const sb = sel.getBoundingClientRect();
      const bb = box.getBoundingClientRect();
      if (sb.top < bb.top || sb.bottom > bb.bottom) {
        sel.scrollIntoView({
          block: "center",
          behavior: motionOK() ? "smooth" : "auto",
        });
      }
    };
    setTimeout(reveal, 400);
    onRoute(reveal);
  };

  /* ════════════════════════════════════════════════════════════
     §E · SIDEBAR PEEK — tooltips when rail-collapsed
     ════════════════════════════════════════════════════════════ */
  const initSidebarPeek = () => {
    if (!MRW_CONFIG.sidebarPeek) return;
    let tip = null;
    const getTip = () => {
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "mrw-peek";
        tip.setAttribute("role", "tooltip");
        document.body.appendChild(tip);
      }
      return tip;
    };

    document.addEventListener("pointerover", (e) => {
      if (!document.documentElement.classList.contains("mrw-rail")) return;
      const item = e.target.closest?.(
        ".mrw-rail-target .standard-sidebar-item, .mrw-rail-target .sidebar-item-container",
      );
      if (!item) return;
      const label = (item.querySelector("a")?.textContent || "").trim();
      if (!label) return;
      const t = getTip();
      t.textContent = label;
      const r = item.getBoundingClientRect();
      const rtl =
        document.dir === "rtl" ||
        document.documentElement.getAttribute("dir") === "rtl";
      t.style.insetBlockStart = `${r.top + r.height / 2 - 14}px`;
      if (rtl) {
        t.style.insetInlineEnd = "";
        t.style.left = "";
        t.style.right = `${window.innerWidth - r.left + 10}px`;
      } else {
        t.style.right = "";
        t.style.left = `${r.right + 10}px`;
      }
      t.classList.add("mrw-show");
    });
    document.addEventListener("pointerout", (e) => {
      if (!tip) return;
      const item = e.target.closest?.(
        ".mrw-rail-target .standard-sidebar-item, .mrw-rail-target .sidebar-item-container",
      );
      if (item && !item.contains(e.relatedTarget))
        tip.classList.remove("mrw-show");
    });
  };

  /* ════════════════════════════════════════════════════════════
     §F · WIDGET ENTRANCE — cascade on workspace load
     ════════════════════════════════════════════════════════════ */
  const initWidgetEntrance = () => {
    if (!MRW_CONFIG.widgetEntrance) return;
    const seen = new WeakSet();

    const run = () => {
      if (!isWorkspacePage() || !motionOK()) return;
      const widgets = document.querySelectorAll(
        '[data-page-route="Workspaces"] .widget.shortcut-widget-box,' +
          '[data-page-route="Workspaces"] .widget.number-widget-box,' +
          '[data-page-route="Workspaces"] .widget.links-widget-box,' +
          '[data-page-route="Workspaces"] .widget.dashboard-widget-box,' +
          '[data-page-route="Workspaces"] .widget.onboarding-widget-box',
      );
      let i = 0;
      widgets.forEach((w) => {
        if (seen.has(w)) return;
        seen.add(w);
        w.classList.add("mrw-enter");
        const delay = Math.min(i * MRW_CONFIG.staggerStep, 600);
        setTimeout(() => {
          w.classList.add("mrw-enter-go");
          setTimeout(
            () => w.classList.remove("mrw-enter", "mrw-enter-go"),
            450,
          );
        }, delay);
        i++;
      });
    };
    setTimeout(run, 150);
    onRoute(run);
    let t;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(run, 120);
    }).observe(document.body, { childList: true, subtree: true });
  };

  /* ════════════════════════════════════════════════════════════
     §G · WIDGET TILT — pointer-tracked tilt + sheen
     ════════════════════════════════════════════════════════════ */
  const initWidgetTilt = () => {
    if (!MRW_CONFIG.widgetTilt || !finePointer.matches) return;
    const MAX = MRW_CONFIG.tiltMax;
    let raf = 0;

    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(
        ".widget.shortcut-widget-box, .widget.number-widget-box",
      );
      if (!card || !motionOK()) return;
      card.classList.add("mrw-tilt");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mrw-mx", `${px * 100}%`);
        card.style.setProperty("--mrw-my", `${py * 100}%`);
        const rx = (0.5 - py) * MAX;
        const ry = (px - 0.5) * MAX;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest?.(
        ".widget.shortcut-widget-box, .widget.number-widget-box",
      );
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  };

  /* ════════════════════════════════════════════════════════════
     §H · GREETING CHIP — time-aware, uses session full name
     ════════════════════════════════════════════════════════════ */
  const initGreetingChip = () => {
    if (!MRW_CONFIG.greetingChip) return;

    const greeting = () => {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    };

    const run = () => {
      if (!isWorkspacePage()) return;
      const main = document.querySelector(
        '[data-page-route="Workspaces"] .layout-main-section',
      );
      if (!main || main.querySelector(":scope > .mrw-greet")) return;
      const name = (window.frappe?.session?.user_fullname || "").split(" ")[0];
      const chip = document.createElement("div");
      chip.className = "mrw-greet";
      const now = new Date().toLocaleDateString(
        document.documentElement.lang || undefined,
        {
          weekday: "long",
          day: "numeric",
          month: "long",
        },
      );
      chip.innerHTML = `<span>${greeting()}${name ? `, <strong>${name}</strong>` : ""}</span><time>${now}</time>`;
      main.prepend(chip);
    };
    setTimeout(run, 200);
    onRoute(run);
    let t;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(run, 150);
    }).observe(document.body, { childList: true, subtree: true });
  };

  /* ════════════════════════════════════════════════════════════
     §I · SECTION COLLAPSE — links widgets fold, persisted
     ════════════════════════════════════════════════════════════ */
  const initSectionCollapse = () => {
    if (!MRW_CONFIG.sectionCollapse) return;
    const KEY = "sections";

    const run = () => {
      if (!isWorkspacePage()) return;
      document
        .querySelectorAll(
          '[data-page-route="Workspaces"] .widget.links-widget-box',
        )
        .forEach((w) => {
          if (w.dataset.mrwSec) return;
          const head = w.querySelector(".widget-head");
          const body = w.querySelector(".widget-body");
          if (!head || !body) return;
          w.dataset.mrwSec = "1";

          const title = (head.textContent || "").trim().slice(0, 60);
          const id = `sec:${location.pathname}:${title}`;
          const closedMap = store.getJSON(KEY, {});

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "mrw-sec-toggle";
          btn.setAttribute("aria-label", `Toggle ${title}`);
          btn.innerHTML = ICONS.chevDown;
          head.appendChild(btn);
          body.classList.add("mrw-sec-body");

          const setClosed = (closed, animate) => {
            if (animate && motionOK()) {
              if (closed) {
                body.style.blockSize = `${body.scrollHeight}px`;
                requestAnimationFrame(() => {
                  body.style.blockSize = "0px";
                });
              } else {
                body.style.blockSize = "0px";
                requestAnimationFrame(() => {
                  body.style.blockSize = `${body.scrollHeight}px`;
                  setTimeout(() => {
                    body.style.blockSize = "";
                  }, 280);
                });
              }
            } else {
              body.style.blockSize = closed ? "0px" : "";
            }
            w.classList.toggle("mrw-sec-closed", closed);
            btn.setAttribute("aria-expanded", String(!closed));
            const m = store.getJSON(KEY, {});
            if (closed) m[id] = 1;
            else delete m[id];
            store.setJSON(KEY, m);
          };

          btn.addEventListener("click", () =>
            setClosed(!w.classList.contains("mrw-sec-closed"), true),
          );
          if (closedMap[id]) setClosed(true, false);
        });
    };
    setTimeout(run, 250);
    onRoute(run);
    let t;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(run, 180);
    }).observe(document.body, { childList: true, subtree: true });
  };

  /* ════════════════════════════════════════════════════════════
     §J · WORKSPACE TRAIL — recently visited workspaces as chips
     ════════════════════════════════════════════════════════════ */
  const initWorkspaceTrail = () => {
    if (!MRW_CONFIG.workspaceTrail) return;
    const KEY = "trail";

    const record = () => {
      if (!isWorkspacePage()) return;
      const sel = document.querySelector(
        ".desk-sidebar .standard-sidebar-item.selected a, .desk-sidebar .sidebar-item.selected a",
      );
      const label = (
        sel?.textContent ||
        document.title.split("·")[0] ||
        ""
      ).trim();
      const href = location.pathname;
      if (!label || !href.includes("/app/")) return;
      let trail = store.getJSON(KEY, []).filter((x) => x.href !== href);
      trail.unshift({ label, href });
      store.setJSON(KEY, trail.slice(0, MRW_CONFIG.trailMax + 1));
    };

    const render = () => {
      if (!isWorkspacePage()) return;
      const main = document.querySelector(
        '[data-page-route="Workspaces"] .layout-main-section',
      );
      if (!main) return;
      main.querySelector(":scope > .mrw-trail")?.remove();
      const trail = store
        .getJSON(KEY, [])
        .filter((x) => x.href !== location.pathname)
        .slice(0, MRW_CONFIG.trailMax);
      if (!trail.length) return;
      const row = document.createElement("nav");
      row.className = "mrw-trail";
      row.setAttribute("aria-label", "Recently visited workspaces");
      row.innerHTML = `<span class="mrw-trail-label">Recent</span>`;
      trail.forEach((x) => {
        const a = document.createElement("a");
        a.className = "mrw-trail-chip";
        a.href = x.href;
        a.textContent = x.label;
        row.appendChild(a);
      });
      const greet = main.querySelector(":scope > .mrw-greet");
      greet ? greet.after(row) : main.prepend(row);
    };

    const run = () => {
      record();
      setTimeout(render, 60);
    };
    setTimeout(run, 350);
    onRoute(run);
  };

  /* ── Boot ──────────────────────────────────────────────────── */
  const boot = () => {
    injectStyles();
    initSidebarCollapse();
    initSidebarPins();
    initSidebarGlide();
    initSidebarReveal();
    initSidebarPeek();
    initWidgetEntrance();
    initWidgetTilt();
    initGreetingChip();
    initSectionCollapse();
    initWorkspaceTrail();
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
