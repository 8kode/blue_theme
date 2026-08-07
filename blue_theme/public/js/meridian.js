/* ══════════════════════════════════════════════════════════════
   MERIDIAN 2.0 — Interaction Layer
   Progressive enhancements for ERPNext v16.26
   - Zero dependencies beyond jQuery (already present in Desk)
   - No overrides of Frappe internals; only additive listeners
   - Feature-detected, reduced-motion aware, RAF-throttled
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (typeof window === "undefined") return;
  if (window.__meridianLoaded) return;
  window.__meridianLoaded = true;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const raf =
    window.requestAnimationFrame ||
    function (cb) {
      return setTimeout(cb, 16);
    };

  // ────────────────────────────────────────────────────────────
  // 1 · Theme persistence (respects system preference on first load)
  // ────────────────────────────────────────────────────────────
  try {
    const stored = localStorage.getItem("mr-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {}

  window.meridian = window.meridian || {};
  window.meridian.setTheme = function (mode) {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("mr-theme", mode);
    } catch (e) {}
  };
  window.meridian.toggleTheme = function () {
    const cur = document.documentElement.getAttribute("data-theme");
    window.meridian.setTheme(cur === "dark" ? "light" : "dark");
  };

  // ────────────────────────────────────────────────────────────
  // 2 · Keyboard shortcuts
  //   Ctrl/Cmd + K   → focus global search
  //   Ctrl/Cmd + \   → toggle sidebar (if Frappe API exposed)
  //   Shift + D      → toggle dark mode
  // ────────────────────────────────────────────────────────────
  document.addEventListener(
    "keydown",
    function (e) {
      const mod = e.ctrlKey || e.metaKey;
      const tag = (e.target && e.target.tagName) || "";
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target && e.target.isContentEditable);

      if (mod && (e.key === "k" || e.key === "K")) {
        const input = document.querySelector(
          ".search-bar .awesomplete input, header .search-bar input",
        );
        if (input) {
          e.preventDefault();
          input.focus();
          input.select && input.select();
        }
        return;
      }

      if (mod && e.key === "\\") {
        try {
          if (window.frappe && frappe.ui && frappe.ui.toolbar) {
            document.body.classList.toggle("mr-sidebar-collapsed");
          }
        } catch (err) {}
        return;
      }

      if (!typing && e.shiftKey && (e.key === "D" || e.key === "d")) {
        window.meridian.toggleTheme();
      }
    },
    { passive: false },
  );

  // ────────────────────────────────────────────────────────────
  // 3 · Passive scroll shadow on page head (perf: rAF-throttled)
  // ────────────────────────────────────────────────────────────
  let scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    raf(function () {
      scrollScheduled = false;
      const scrolled = window.scrollY > 8;
      document.body.classList.toggle("mr-scrolled", scrolled);
      document.querySelectorAll(".page-head").forEach(function (el) {
        el.classList.toggle("mr-elevated", scrolled);
      });
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // ────────────────────────────────────────────────────────────
  // 4 · Ripple/press feedback on primary buttons (motion-safe)
  // ────────────────────────────────────────────────────────────
  if (!reduceMotion) {
    document.addEventListener(
      "pointerdown",
      function (e) {
        const btn = e.target.closest && e.target.closest(".btn-primary");
        if (!btn) return;
        btn.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(1px)" },
            { transform: "translateY(0)" },
          ],
          { duration: 140, easing: "cubic-bezier(0.22,1,0.36,1)" },
        );
      },
      { passive: true },
    );
  }

  // ────────────────────────────────────────────────────────────
  // 5 · Auto-tag body with data-page-route for scoped styling
  //     ERPNext already does part of this; we keep it authoritative.
  // ────────────────────────────────────────────────────────────
  function syncRouteAttr() {
    try {
      const route =
        (window.frappe && frappe.get_route && frappe.get_route()[0]) || "";
      if (route) document.body.setAttribute("data-page-route", route);
    } catch (e) {}
  }
  if (window.frappe && window.frappe.router && window.frappe.router.on) {
    window.frappe.router.on("change", syncRouteAttr);
  }
  document.addEventListener("DOMContentLoaded", syncRouteAttr);

  // ────────────────────────────────────────────────────────────
  // 6 · MutationObserver — apply .mr-ready to newly injected widgets
  //     Enables one-shot enter animation without layout thrash.
  // ────────────────────────────────────────────────────────────
  if ("MutationObserver" in window && !reduceMotion) {
    const targets = new WeakSet();
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            function (entries) {
              entries.forEach(function (en) {
                if (en.isIntersecting) {
                  en.target.classList.add("mr-in");
                  io.unobserve(en.target);
                }
              });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
          )
        : null;

    const mo = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const nodes = mutations[i].addedNodes;
        for (let j = 0; j < nodes.length; j++) {
          const n = nodes[j];
          if (!(n instanceof Element)) continue;
          const list =
            n.matches && n.matches(".widget")
              ? [n]
              : n.querySelectorAll
                ? n.querySelectorAll(".widget")
                : [];
          for (let k = 0; k < list.length; k++) {
            const el = list[k];
            if (targets.has(el)) continue;
            targets.add(el);
            el.classList.add("mr-anim");
            io && io.observe(el);
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // ────────────────────────────────────────────────────────────
  // 7 · Inline animation styles (injected once, keeps CSS clean)
  // ────────────────────────────────────────────────────────────
  (function injectStyles() {
    const css = [
      ".mr-anim { opacity: 0; transform: translateY(4px); }",
      ".mr-anim.mr-in { opacity: 1; transform: translateY(0); transition: opacity 220ms cubic-bezier(0.22,1,0.36,1), transform 220ms cubic-bezier(0.22,1,0.36,1); }",
      ".page-head.mr-elevated { box-shadow: 0 6px 20px -14px rgba(0,0,0,0.25); }",
      "body.mr-sidebar-collapsed .layout-side-section { display: none; }",
      "body.mr-sidebar-collapsed .layout-main-section-wrapper { flex: 1 1 100%; max-width: 100%; }",
    ].join("\n");
    const s = document.createElement("style");
    s.setAttribute("data-meridian", "true");
    s.textContent = css;
    document.head.appendChild(s);
  })();
})();
