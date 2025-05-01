// ==UserScript==
// @name         YouTube Modular Sidebar Buttons
// @namespace    https://github.com/Spaceicality/YouTube-Modular-Sidebar-Buttons
// @version      1.1
// @description  Create custom YouTube sidebar buttons, while also being modular
// @author       Spaceicality + ChatGPT 4o-mini-high
// @match        https://www.youtube.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const BUTTONS = [
    {
      id:               'credit-creators',
      label:            'Credit The Creators',
      url:              'https://creditthecreators.com',
      showInMiniSidebar: true,
      svg: `<svg viewBox="0 0 575.65 357.57" width="24" height="24" fill="currentColor">
              <path d="M421.03,316.78l154.62-137.99L421.03,40.79c-7.48-6.68-19.34-1.37-19.34,8.66v258.66c0,10.03,11.86,15.34,19.34,8.66Z"/>
              <path d="M96.92,309.75c-7.1,6.34-18.36,1.3-18.36-8.22V56.05c0-9.52,11.26-14.56,18.36-8.22l75.84,67.68v-50.21C172.75,21.77,150.99,0,107.47,0h-42.18C21.76,0,0,21.77,0,65.29v226.99c0,43.53,21.76,65.29,65.29,65.29h43.18c43.52,0,65.29-21.76,65.29-65.29v-51.11l-76.85,68.58Z"/>
              <path d="M293.63,309.75c-7.1,6.34-18.36,1.3-18.36-8.22V56.05c0-9.52,11.26-14.56,18.36-8.22l75.84,67.68v-50.21c0-43.52-21.76-65.29-65.28-65.29h-42.18c-43.53,0-65.29,21.77-65.29,65.29v226.99c0,43.53,21.76,65.29,65.29,65.29h43.18c43.52,0,65.29-21.76,65.29-65.29v-51.11l-76.85,68.58Z"/>
            </svg>`
    },
    {
      id:               'do-else',
      label:            'Do Something Else',
      url:              'https://example.com/other',
      showInMiniSidebar: true,
      svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>`
    }
    // …add more buttons as needed…
  ];

  const CSS = `
/* full sidebar */
.custom-entry tp-yt-paper-item { display:flex!important; align-items:center!important; }
.custom-entry yt-img-shadow      { display:none!important; }
.custom-entry span.entry-label   {
  flex:1 1 auto!important; min-width:0!important;
  overflow:hidden!important; text-overflow:ellipsis!important; white-space:nowrap!important;
  font-size:14px!important; font-weight:400!important; color:var(--yt-spec-text-primary)!important;
}
.custom-entry tp-yt-paper-item:hover { background-color:rgba(17,17,17,0.1)!important; }

/* mini sidebar: icon + label inside anchor */
.custom-mini-entry {
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  padding:4px 0!important;
}
.custom-mini-entry yt-icon.guide-icon {
  margin:0!important;
  transform: translateY(-4px)!important;
}
.custom-mini-entry a#endpoint {
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
}
.custom-mini-entry span.mini-label {
  margin-top:2px!important;   /* spacing under icon */
  max-width:100% !important;  /* allow full width */
  text-align:center!important;
  font-size:1rem!important;   /* updated font-size */
  line-height:1.4rem!important;
  font-weight:400!important;
  color:var(--yt-spec-text-primary)!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}
`;

  function makeFullHTML(btn) {
    return `
<ytd-guide-entry-renderer id="${btn.id}" class="custom-entry style-scope ytd-guide-section-renderer">
  <a id="endpoint" class="yt-simple-endpoint style-scope ytd-guide-entry-renderer"
     href="${btn.url}" title="${btn.label}" tabindex="-1" role="tablist">
    <tp-yt-paper-item class="style-scope ytd-guide-entry-renderer" role="tab"
                      tabindex="0" aria-disabled="false" animated>
      <yt-icon class="guide-icon style-scope ytd-guide-entry-renderer"
               disable-upgrade>${btn.svg}</yt-icon>
      <yt-img-shadow class="style-scope ytd-guide-entry-renderer"
                     disable-upgrade width="24" height="24"></yt-img-shadow>
      <span class="title style-scope ytd-guide-entry-renderer entry-label">${btn.label}</span>
      <span class="guide-entry-count style-scope ytd-guide-entry-renderer"></span>
      <yt-icon class="guide-entry-badge style-scope ytd-guide-entry-renderer"
               disable-upgrade></yt-icon>
      <div id="newness-dot" class="style-scope ytd-guide-entry-renderer"></div>
    </tp-yt-paper-item>
  </a>
  <yt-interaction class="style-scope ytd-guide-entry-renderer">
    <div class="stroke style-scope yt-interaction"></div>
    <div class="fill style-scope yt-interaction"></div>
  </yt-interaction>
</ytd-guide-entry-renderer>`;
  }

  function makeMiniHTML(btn) {
    return `
<ytd-mini-guide-entry-renderer id="${btn.id}-mini" class="custom-mini-entry style-scope ytd-mini-guide-renderer">
  <a id="endpoint" class="yt-simple-endpoint style-scope ytd-mini-guide-entry-renderer"
     href="${btn.url}" title="${btn.label}" tabindex="-1">
    <yt-icon class="guide-icon style-scope ytd-mini-guide-entry-renderer"
             disable-upgrade>${btn.svg}</yt-icon>
    <span class="mini-label">${btn.label}</span>
  </a>
</ytd-mini-guide-entry-renderer>`;
  }

  function ensure() {
    if (!document.getElementById('custom-sidebar-css')) {
      const style = document.createElement('style');
      style.id = 'custom-sidebar-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const fullSub = document
      .querySelector('ytd-guide-entry-renderer a#endpoint[href*="/feed/subscriptions"]')
      ?.closest('ytd-guide-entry-renderer');
    const miniSub = document
      .querySelector('ytd-mini-guide-entry-renderer a#endpoint[href*="/feed/subscriptions"]')
      ?.closest('ytd-mini-guide-entry-renderer');

    BUTTONS.slice().reverse().forEach(btn => {
      // Full sidebar
      if (fullSub && !document.getElementById(btn.id)) {
        fullSub.insertAdjacentHTML('afterend', makeFullHTML(btn));
      }
      const fe = document.getElementById(btn.id);
      if (fe) {
        const a = fe.querySelector('a#endpoint');
        if (a.href !== btn.url || a.title !== btn.label) {
          a.href = btn.url; a.title = btn.label;
        }
        const icon = fe.querySelector('yt-icon.guide-icon');
        if (icon && !icon.innerHTML.trim()) icon.innerHTML = btn.svg;
        let lbl = fe.querySelector('span.entry-label');
        if (!lbl) {
          const paper = fe.querySelector('tp-yt-paper-item');
          const span  = document.createElement('span');
          span.className   = 'title style-scope ytd-guide-entry-renderer entry-label';
          span.textContent = btn.label;
          paper.insertBefore(span, paper.querySelector('.guide-entry-count'));
        }
      }

      // Mini sidebar
      if (btn.showInMiniSidebar && miniSub && !document.getElementById(btn.id + '-mini')) {
        miniSub.insertAdjacentHTML('afterend', makeMiniHTML(btn));
      }
      const me = document.getElementById(btn.id + '-mini');
      if (me) {
        const a = me.querySelector('a#endpoint');
        if (a.href !== btn.url || a.title !== btn.label) {
          a.href = btn.url; a.title = btn.label;
        }
        const icon = me.querySelector('yt-icon.guide-icon');
        if (icon && !icon.innerHTML.trim()) icon.innerHTML = btn.svg;
        let ml = me.querySelector('span.mini-label');
        if (!ml) {
          me.querySelector('a#endpoint').appendChild(document.createElement('span')).className = 'mini-label';
          me.querySelector('span.mini-label').textContent = btn.label;
        }
      }
    });
  }

  new MutationObserver(ensure).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('yt-navigate-finish', ensure);
  document.addEventListener('DOMContentLoaded', ensure);
  setInterval(ensure, 200);
})();
