/** Country module: us — sourced from /js/countries.js central registry */
(function () {
  if (!window.NexaCountries || !window.NexaCountries.list['us']) return;
  window.NexaCountryModule = window.NexaCountryModule || {};
  window.NexaCountryModule['us'] = window.NexaCountries.list['us'];
})();
