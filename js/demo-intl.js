/**
 * Applies country-specific demo content to data-demo-* elements.
 * Usage: mark elements with data-demo="cafe.name" etc.
 */
(function () {
  function applyDemo(niche) {
    if (!window.NexaGeo) return;
    const country = window.NexaGeo.getCountry();
    const demo = country.demo && country.demo[niche];
    if (!demo) return;

    document.querySelectorAll('[data-demo]').forEach(el => {
      const path = el.getAttribute('data-demo');
      const parts = path.split('.');
      let val = demo;
      for (const p of parts) {
        if (val == null) break;
        // array index
        if (/^\d+$/.test(p)) val = val[Number(p)];
        else val = val[p];
      }
      if (val == null) return;
      if (typeof val === 'object') return;
      el.textContent = val;
    });

    // Special: menu rows, plans, listings
    if (niche === 'cafe' && demo.menu) {
      const list = document.querySelector('[data-demo-menu]');
      if (list) {
        list.innerHTML = demo.menu.map(m =>
          `<div class="menu-row"><div><span class="name">${m.name}</span></div><span class="price">${m.price}</span></div>`
        ).join('');
      }
    }
    if (niche === 'fitness' && demo.plans) {
      document.querySelectorAll('[data-demo-plan]').forEach((el, i) => {
        if (!demo.plans[i]) return;
        const p = demo.plans[i];
        const name = el.querySelector('[data-plan-name]');
        const price = el.querySelector('[data-plan-price]');
        if (name) name.textContent = p.name;
        if (price) price.innerHTML = p.price + ' <span>' + (p.per || '') + '</span>';
      });
    }
    if (niche === 'realty' && demo.listings) {
      document.querySelectorAll('[data-demo-listing]').forEach((el, i) => {
        if (!demo.listings[i]) return;
        const L = demo.listings[i];
        const t = el.querySelector('[data-list-title]');
        const m = el.querySelector('[data-list-meta]');
        const p = el.querySelector('[data-list-price]');
        if (t) t.textContent = L.title;
        if (m) m.textContent = L.meta;
        if (p) p.textContent = L.price;
      });
    }
    if (niche === 'beauty' && demo.treatments) {
      document.querySelectorAll('[data-demo-treatment]').forEach((el, i) => {
        if (!demo.treatments[i]) return;
        const T = demo.treatments[i];
        const n = el.querySelector('[data-tx-name]');
        const p = el.querySelector('[data-tx-price]');
        if (n) n.textContent = T.name;
        if (p) p.textContent = T.price;
      });
    }
  }

  function boot() {
    const niche = document.body.getAttribute('data-demo-niche');
    if (!niche) return;
    const run = () => applyDemo(niche);
    window.addEventListener('nexa:country', run);
    if (window.NexaGeo) {
      // wait for init
      setTimeout(run, 100);
      window.NexaGeo.init().then(run);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.NexaDemoIntl = { applyDemo };
})();
