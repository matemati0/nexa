# NexaSites International Architecture (Phase 1)

## Files
- `/js/countries.js` — single source of truth for all country configs
- `/js/geo.js` — detection (IP → locale → language → default) + persistence
- `/js/country-selector.js` — UI dropdown
- `/js/demo-intl.js` — applies local demo content via `data-demo-*`
- `/countries/{code}.js` — optional per-country module hooks

## Detection priority
1. localStorage (`nexa_country`)
2. IP geolocation (ipapi.co / country.is)
3. Browser locale + timezone
4. Default: `us`

## Adding a country
1. Add entry to `NexaCountries.list` in `countries.js`
2. Include pricing, terms, demo content, SEO
3. Map country code in `geo.js` IP_LOCALE_MAP and LANG_MAP
4. No component rewrites required

## Demo pages
Set `data-demo-niche="cafe|fitness|studio|realty|beauty|lawyer"` on `<body>`.
Mark text with `data-demo="name"` / `tagline` / `address` etc.
