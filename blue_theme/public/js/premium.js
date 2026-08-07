/**
 * PREMIUM THEME — runtime enhancements for ERPNext v16 / Frappe v16
 * Non-invasive: no core APIs are modified, only presentation-layer behavior.
 */
(function () {
  "use strict";

  var REDUCED_MOTION = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ------------------------------------------------------------
   * 1. Smooth theme-mode transitions (light <-> dark)
   *    Fades the whole UI instead of hard-swapping colors.
   * ------------------------------------------------------------ */
  function enableSmoothThemeSwitch() {
    if (REDUCED_MOTION) return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (
          mutations[i].attributeName === "data-theme" ||
          mutations[i].attributeName === "data-theme-mode"
        ) {
          document.documentElement.classList.add("pt-theme-transition");
          window.setTimeout(function () {
            document.documentElement.classList.remove("pt-theme-transition");
          }, 350);
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    var style = document.createElement("style");
    style.textContent =
      ".pt-theme-transition, .pt-theme-transition *, .pt-theme-transition *::before, .pt-theme-transition *::after {" +
      "transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease !important; }";
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------
   * 2. Staggered entrance for workspace widgets
   *    Number cards / shortcuts fade-slide in on first paint.
   * ------------------------------------------------------------ */
  function animateWorkspaceWidgets() {
    if (REDUCED_MOTION) return;
    var style = document.createElement("style");
    style.textContent =
      "@keyframes pt-widget-in { from { opacity: 0; transform: translateY(10px); }" +
      "to { opacity: 1; transform: translateY(0); } }" +
      ".pt-widget-enter { animation: pt-widget-in 420ms cubic-bezier(0.22,1,0.36,1) both; }";
    document.head.appendChild(style);

    var seen = new WeakSet();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            var delay = Math.min(entry.target.dataset.ptIndex * 40 || 0, 320);
            entry.target.style.animationDelay = delay + "ms";
            entry.target.classList.add("pt-widget-enter");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    function scan() {
      var widgets = document.querySelectorAll(".widget:not([data-pt-index])");
      widgets.forEach(function (w, i) {
        w.dataset.ptIndex = String(i % 8);
        io.observe(w);
      });
    }

    scan();
    var mo = new MutationObserver(function () {
      window.requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------------------
   * 3. RTL awareness — mirror-safe helpers
   *    Adds a `pt-rtl` class so any future CSS can hook it, and
   *    keeps the <html> dir attribute in sync with the boot lang.
   * ------------------------------------------------------------ */
  function syncDirection() {
    var isRTL =
      document.documentElement.getAttribute("dir") === "rtl" ||
      (window.frappe &&
        window.frappe.boot &&
        window.frappe.boot.lang &&
        ["ar", "he", "fa", "ur"].indexOf(window.frappe.boot.lang) !== -1);
    document.documentElement.classList.toggle("pt-rtl", !!isRTL);
    if (isRTL && document.documentElement.getAttribute("dir") !== "rtl") {
      document.documentElement.setAttribute("dir", "rtl");
    }
  }

  /* ------------------------------------------------------------
   * 4. Keyboard polish — `/` focuses global search (like GitHub)
   * ------------------------------------------------------------ */
  function enableSearchHotkey() {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      var target = e.target;
      var tag = target && target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (target && target.isContentEditable)
      ) {
        return;
      }
      var search = document.getElementById("navbar-search");
      if (search) {
        e.preventDefault();
        search.focus();
      }
    });
  }

  /* ------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------ */
  function init() {
    enableSmoothThemeSwitch();
    animateWorkspaceWidgets();
    syncDirection();
    enableSearchHotkey();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
