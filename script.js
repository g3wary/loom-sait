/**
 * LOOM — Landing Page
 * script.js
 *
 * Handles:
 *  - Theme switching (light / dark) with LocalStorage persistence
 *  - Scroll-reveal animations via IntersectionObserver
 *  - APK download trigger
 */

'use strict';

/* ─────────────────────────────────────────
   1. Theme Management
───────────────────────────────────────── */

const THEME_KEY      = 'loom-theme';
const DEFAULT_THEME  = 'dark';

const htmlEl         = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggle');

/**
 * Read saved theme from LocalStorage,
 * fall back to default if nothing saved.
 */
function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
}

/**
 * Apply a theme by setting the data-theme attribute
 * and persisting the choice.
 * @param {string} theme - 'light' | 'dark'
 */
function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Toggle between light and dark.
 */
function toggleTheme() {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/* Initialise theme on page load */
applyTheme(getSavedTheme());

/* Bind button */
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

/* ─────────────────────────────────────────
   2. Scroll-Reveal via IntersectionObserver
───────────────────────────────────────── */

/**
 * Observe every element with class `.reveal`.
 * When it enters the viewport, add `.is-visible`
 * which triggers the CSS transition.
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observerOptions = {
    threshold:  0.12,   /* trigger when 12% of element is visible */
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        /* Stop observing once revealed — no need to toggle back */
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealEls.forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────
   3. APK Download
───────────────────────────────────────── */

/**
 * Trigger a silent file download without opening a new tab.
 * Creates a temporary <a> element, clicks it, then removes it.
 * @param {string} filePath - Path to the file on the server.
 * @param {string} fileName - Desired filename for the download.
 */
function downloadFile(filePath, fileName) {
  const anchor = document.createElement('a');

  anchor.href     = filePath;
  anchor.download = fileName;    /* attribute triggers download behaviour */
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Attach the download handler to the button.
 * We handle it via JS so we have full control
 * (e.g. we can add analytics later without changing HTML).
 */
function initDownload() {
  const downloadBtn = document.getElementById('downloadBtn');

  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', (e) => {
    /* Prevent default anchor navigation */
    e.preventDefault();

    /* Trigger the programmatic download */
    downloadFile('/app.apk', 'loom.apk');
  });
}

/* ─────────────────────────────────────────
   4. Smooth Scroll (native fallback)
───────────────────────────────────────── */

/**
 * Enhance any internal anchor links with smooth scroll.
 * (html { scroll-behavior: smooth } handles most cases,
 *  this is a JS fallback for older environments.)
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ─────────────────────────────────────────
   5. Init
───────────────────────────────────────── */

/**
 * Run all initialisers once the DOM is ready.
 */
function init() {
  initScrollReveal();
  initDownload();
  initSmoothScroll();
}

/* DOMContentLoaded fires before images/fonts load — perfect for JS init */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  /* DOM already ready (script loaded with defer / at bottom of body) */
  init();
}