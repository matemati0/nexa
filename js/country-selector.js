/**
 * Country / region selector UI (injectable)
 */
(function () {
  function buildSelector() {
    if (!window.NexaGeo) return;
    const countries = window.NexaGeo.listCountries();
    if (!countries.length) return;

    // If page already has #countryDropdown, just bind
    let root = document.getElementById('countryDropdown');
    if (!root) {
      const host = document.querySelector('.header-inner, .nav, header .container') || document.body;
      root = document.createElement('div');
      root.id = 'countryDropdown';
      root.className = 'country-dropdown';
      root.innerHTML = `
        <button type="button" class="country-toggle" id="countryToggle" aria-haspopup="listbox" aria-expanded="false">
          <span id="countryLabel">Region</span>
          <span class="chev">▾</span>
        </button>
        <div class="country-menu" id="countryMenu" role="listbox"></div>
      `;
      // insert before lang dropdown or at end of header actions
      const lang = document.getElementById('langDropdown');
      if (lang && lang.parentNode) lang.parentNode.insertBefore(root, lang);
      else host.appendChild(root);
    }

    const menu = document.getElementById('countryMenu');
    if (menu && !menu.children.length) {
      menu.innerHTML = countries.map(c => `
        <button type="button" class="country-option" role="option" data-country="${c.code}">
          <span class="c-flag">${c.flag}</span>
          <span class="c-name">${c.name}</span>
          <span class="c-price">${c.pricing.display.range}</span>
        </button>
      `).join('');
    }

    const toggle = document.getElementById('countryToggle');
    const dd = document.getElementById('countryDropdown');
    if (toggle && dd) {
      toggle.onclick = (e) => {
        e.stopPropagation();
        const open = dd.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      document.addEventListener('click', () => {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    document.querySelectorAll('.country-option').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        window.NexaGeo.setCountry(btn.getAttribute('data-country'), { manual: true });
        dd.classList.remove('open');
      };
    });
  }

  function injectStyles() {
    if (document.getElementById('nexa-country-css')) return;
    const s = document.createElement('style');
    s.id = 'nexa-country-css';
    s.textContent = `
      .country-dropdown { position: relative; }
      .country-toggle {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,0.04); border: 1px solid rgba(148,163,184,0.2);
        color: inherit; padding: 8px 12px; border-radius: 999px;
        font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit;
      }
      .country-toggle:hover { border-color: rgba(34,211,238,0.45); }
      .country-menu {
        display: none; position: absolute; top: calc(100% + 8px); right: 0;
        min-width: 280px; max-height: 360px; overflow-y: auto;
        background: rgba(10,16,28,0.98); backdrop-filter: blur(16px);
        border: 1px solid rgba(56,189,248,0.15); border-radius: 14px;
        padding: 6px; box-shadow: 0 16px 40px rgba(0,0,0,0.45); z-index: 220;
      }
      [dir="rtl"] .country-menu { right: auto; left: 0; }
      .country-dropdown.open .country-menu { display: block; }
      .country-option {
        display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center;
        width: 100%; text-align: start; background: transparent; border: none;
        color: #cbd5e1; padding: 10px 12px; border-radius: 10px; font-size: 0.85rem;
        cursor: pointer; font-family: inherit;
      }
      .country-option:hover, .country-option.active {
        background: rgba(34,211,238,0.12); color: #e0f2fe;
      }
      .c-flag { font-size: 1.1rem; }
      .c-name { font-weight: 600; }
      .c-price { font-size: 0.72rem; color: #22d3ee; font-weight: 700; white-space: nowrap; }
      @media (max-width: 720px) {
        .country-menu {
          position: fixed; left: 16px; right: 16px; top: 72px;
          min-width: 0; width: auto;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function boot() {
    injectStyles();
    buildSelector();
    if (window.NexaGeo) {
      window.NexaGeo.init().then(() => window.NexaGeo.applyToDOM());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
