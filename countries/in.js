/** Country module: in — sourced from /js/countries.js central registry */
(function () {
  if (!window.NexaCountries || !window.NexaCountries.list['in']) return;
  window.NexaCountryModule = window.NexaCountryModule || {};
  window.NexaCountryModule['in'] = window.NexaCountries.list['in'];
})();
