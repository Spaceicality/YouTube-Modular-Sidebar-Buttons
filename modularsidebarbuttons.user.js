// ==UserScript==
// @name         YouTube Modular Sidebar Buttons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Create custom YouTube sidebar buttons, while also being modular
// @author       Spaceicality + ChatGPT 4o-mini-high
// @match        https://www.youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // ─── CONFIGURE YOUR BUTTONS HERE ────────────────────────────────────────────────
  const BUTTONS = [
    {
      id:    'credit-creators',
      label: 'Credit The Creators',
      url:   'https://creditthecreators.com',
      svg:   `<svg viewBox="0 0 575.65 357.57" width="24" height="24" fill="currentColor">
                <path d="M421.03,316.78l154.62-137.99L421.03,40.79c-7.48-6.68-19.34-1.37-19.34,8.66v258.66c0,10.03,11.86,15.34,19.34,8.66Z"/>
                <path d="M96.92,309.75c-7.1,6.34-18.36,1.3-18.36-8.22V56.05c0-9.52,11.26-14.56,18.36-8.22l75.84,67.68v-50.21C172.75,21.77,150.99,0,107.47,0h-42.18C21.76,0,0,21.77,0,65.29v226.99c0,43.53,21.76,65.29,65.29,65.29h43.18c43.52,0,65.29-21.76,65.29-65.29v-51.11l-76.85,68.58Z"/>
                <path d="M293.63,309.75c-7.1,6.34-18.36,1.3-18.36-8.22V56.05c0-9.52,11.26-14.56,18.36-8.22l75.84,67.68v-50.21c0-43.52-21.76-65.29-65.28-65.29h-42.18c-43.53,0-65.29,21.77-65.29,65.29v226.99c0,43.53,21.76,65.29,65.29,65.29h43.18c43.52,0,65.29-21.76,65.29-65.29v-51.11l-76.85,68.58Z"/>
              </svg>`
    },
    {
      id:    'do-else',
      label: 'Do Something Else',
      url:   'https://example.com/other',
      svg:   `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>`
    },
    // …add more buttons here…
  ];
  // ────────────────────────────────────────────────────────────────────────────────

  const CSS = `
    .custom-entry tp-yt-paper-item { display:flex!important; align-items:center!important; }
    .custom-entry yt-img-shadow      { display:none!important; }
    .custom-entry yt-icon.guide-icon { margin-right:24px!important; }
    .custom-entry span.entry-label   { font-width:400 var(--yt-spec-text-primary)!important; }
    .custom-entry tp-yt-paper-item:hover { background-color:rgba(17,17,17,0.1)!important; }
  `;

  function makeHTML(btn) {
    return `
<ytd-guide-entry-renderer id="${btn.id}" class="custom-entry style-scope ytd-guide-section-renderer">
  <a id="endpoint" class="yt-simple-endpoint style-scope ytd-guide-entry-renderer"
     href="${btn.url}" title="${btn.label}" tabindex="-1" role="tablist">
    <tp-yt-paper-item class="style-scope ytd-guide-entry-renderer" role="tab" tabindex="0" aria-disabled="false" animated>
      <yt-icon class="guide-icon style-scope ytd-guide-entry-renderer" disable-upgrade>${btn.svg}</yt-icon>
      <yt-img-shadow class="style-scope ytd-guide-entry-renderer" disable-upgrade width="24" height="24"></yt-img-shadow>
      <span class="title style-scope ytd-guide-entry-renderer entry-label">${btn.label}</span>
      <span class="guide-entry-count style-scope ytd-guide-entry-renderer"></span>
      <yt-icon class="guide-entry-badge style-scope ytd-guide-entry-renderer" disable-upgrade></yt-icon>
      <div id="newness-dot" class="style-scope ytd-guide-entry-renderer"></div>
    </tp-yt-paper-item>
  </a>
  <yt-interaction class="style-scope ytd-guide-entry-renderer">
    <div class="stroke style-scope yt-interaction"></div>
    <div class="fill style-scope yt-interaction"></div>
  </yt-interaction>
</ytd-guide-entry-renderer>`;
  }

  function ensure() {
    // inject CSS once
    if (!document.getElementById('custom-sidebar-css')) {
      const s = document.createElement('style');
      s.id = 'custom-sidebar-css';
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // locate the Subscriptions entry
    const sub = document
      .querySelector('ytd-guide-entry-renderer a#endpoint[href*="/feed/subscriptions"]')
      ?.closest('ytd-guide-entry-renderer');
    if (!sub) return;

    // insert in reverse order so array order is preserved
    BUTTONS.slice().reverse().forEach(btn => {
      if (!document.getElementById(btn.id)) {
        sub.insertAdjacentHTML('afterend', makeHTML(btn));
      }
      const e = document.getElementById(btn.id);
      if (!e) return;

      // restore link/title
      const a = e.querySelector('a#endpoint');
      if (a.href !== btn.url || a.title !== btn.label) {
        a.href = btn.url;
        a.title = btn.label;
      }
      // restore icon if wiped
      const icon = e.querySelector('yt-icon.guide-icon');
      if (icon && !icon.innerHTML.trim()) {
        icon.innerHTML = btn.svg;
      }
      // restore or re-create label
      let lbl = e.querySelector('span.entry-label');
      if (!lbl) {
        const paper = e.querySelector('tp-yt-paper-item');
        const span  = document.createElement('span');
        span.className   = 'title style-scope ytd-guide-entry-renderer entry-label';
        span.textContent = btn.label;
        paper.insertBefore(span, paper.querySelector('.guide-entry-count'));
      } else if (!lbl.textContent.trim()) {
        lbl.textContent = btn.label;
      }
    });
  }

  new MutationObserver(ensure).observe(document.documentElement, { childList:true, subtree:true });
  window.addEventListener('yt-navigate-finish', ensure);
  document.addEventListener('DOMContentLoaded', ensure);
  setInterval(ensure, 200);
})();
