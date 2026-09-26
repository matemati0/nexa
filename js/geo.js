/**
 * NexaSites geo + country runtime
 * Priority: saved preference → IP → locale → language → default
 */
(function (global) {
  const STORAGE_KEY = 'nexa_country';
  const LANG_KEY = 'nexa_lang_locale';

  const IP_LOCALE_MAP = {
    US: 'us', CA: 'ca', GB: 'uk', UK: 'uk', IE: 'ie',
    AU: 'au', NZ: 'nz', ZA: 'za', SG: 'sg', PH: 'ph', IN: 'in',
  };

  const LANG_MAP = {
    'en-us': 'us', 'en-ca': 'ca', 'en-gb': 'uk', 'en-ie': 'ie',
    'en-au': 'au', 'en-nz': 'nz', 'en-za': 'za', 'en-sg': 'sg',
    'en-ph': 'ph', 'en-in': 'in',
  };

  function getCountries() {
    return (global.NexaCountries && global.NexaCountries.list) || {};
  }

  function getDefault() {
    return (global.NexaCountries && global.NexaCountries.defaultCountry) || 'us';
  }

  function isValid(code) {
    return !!getCountries()[code];
  }

  function fromBrowserLocale() {
    try {
      const loc = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (LANG_MAP[loc]) return LANG_MAP[loc];
      const short = loc.split('-')[0];
      // timezone hints
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('America/') && (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal'))) return 'ca';
      if (tz.startsWith('America/')) return 'us';
      if (tz.startsWith('Europe/London')) return 'uk';
      if (tz.startsWith('Europe/Dublin')) return 'ie';
      if (tz.startsWith('Australia/')) return 'au';
      if (tz.startsWith('Pacific/Auckland')) return 'nz';
      if (tz.startsWith('Africa/Johannesburg')) return 'za';
      if (tz === 'Asia/Singapore') return 'sg';
      if (tz === 'Asia/Manila') return 'ph';
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'in';
      if (loc.startsWith('en')) return 'us';
    } catch (e) {}
    return null;
  }

  async function fromIP() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return null;
      const data = await res.json();
      const cc = (data.country_code || data.country || '').toUpperCase();
      return IP_LOCALE_MAP[cc] || null;
    } catch (e) {
      try {
        const res = await fetch('https://api.country.is/');
        if (!res.ok) return null;
        const data = await res.json();
        const cc = (data.country || '').toUpperCase();
        return IP_LOCALE_MAP[cc] || null;
      } catch (e2) {
        return null;
      }
    }
  }

  function getSaved() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && isValid(v)) return v;
    } catch (e) {}
    return null;
  }

  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  function getCountry() {
    const code = getSaved() || getDefault();
    return getCountries()[code] || getCountries()[getDefault()];
  }

  function getCode() {
    return getCountry().code;
  }

  function setCountry(code, opts) {
    if (!isValid(code)) return;
    save(code);
    const country = getCountries()[code];
    try {
      localStorage.setItem(LANG_KEY, country.primaryLanguage);
    } catch (e) {}
    document.documentElement.lang = country.primaryLanguage;
    document.documentElement.dataset.country = code;
    global.dispatchEvent(new CustomEvent('nexa:country', { detail: { code, country, manual: !!(opts && opts.manual) } }));
    applyToDOM(country);
  }

  function formatMoney(amount, country) {
    const c = country || getCountry();
    try {
      return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency, maximumFractionDigits: 0 }).format(amount);
    } catch (e) {
      return c.currencySymbol + amount;
    }
  }

  function applyToDOM(country) {
    const c = country || getCountry();
    document.querySelectorAll('[data-i18n-price="starter"]').forEach(el => { el.textContent = c.pricing.display.starter; });
    document.querySelectorAll('[data-i18n-price="growth"]').forEach(el => { el.textContent = c.pricing.display.growth; });
    document.querySelectorAll('[data-i18n-price="pro"]').forEach(el => { el.textContent = c.pricing.display.pro; });
    document.querySelectorAll('[data-i18n-price="range"]').forEach(el => { el.textContent = c.pricing.display.range; });
    document.querySelectorAll('[data-i18n-price="from"]').forEach(el => { el.textContent = c.pricing.display.from; });
    document.querySelectorAll('[data-i18n-price="per"]').forEach(el => { el.textContent = c.terms.perYear; });
    document.querySelectorAll('[data-country-name]').forEach(el => { el.textContent = c.name; });
    document.querySelectorAll('[data-country-flag]').forEach(el => { el.textContent = c.flag; });
    document.querySelectorAll('[data-cta-primary]').forEach(el => { el.textContent = c.ctaPrimary; });
    document.querySelectorAll('[data-cta-secondary]').forEach(el => { el.textContent = c.ctaSecondary; });
    document.querySelectorAll('[data-cta-contact]').forEach(el => { el.textContent = c.ctaContact; });

    // SEO
    if (c.seo) {
      if (c.seo.title) document.title = c.seo.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && c.seo.description) meta.setAttribute('content', c.seo.description);
    }

    // Update selector UI
    const label = document.getElementById('countryLabel');
    if (label) label.textContent = c.flag + ' ' + c.regionLabel;
    document.querySelectorAll('.country-option').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-country') === c.code);
    });
  }

  async function init() {
    const saved = getSaved();
    if (saved) {
      setCountry(saved);
      return saved;
    }
    // try IP then browser
    let code = await fromIP();
    if (!code || !isValid(code)) code = fromBrowserLocale();
    if (!code || !isValid(code)) code = getDefault();
    setCountry(code);
    return code;
  }

  function listCountries() {
    return Object.values(getCountries());
  }

  global.NexaGeo = {
    init,
    getCountry,
    getCode,
    setCountry,
    listCountries,
    formatMoney,
    applyToDOM,
    fromBrowserLocale,
  };
})(window);
