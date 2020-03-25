(function (window) {
  window.__env = window.__env || {};

  // API url
  // For demo purposes we fetch from local file in this plunk
  // In your application this can be a url like https://api.github.com
  //window.__env.apiUrl = '';
  //window.__env.apiUrl = '/expeditor';
  window.__env.API_BASE_URL = '';
  window.__env.OTA_BASE_URL = 'http://portal.iotocean.org:8730/fw/';

  window.API_BASE_URL = window.__env.API_BASE_URL;
  window.OTA_BASE_URL = window.__env.OTA_BASE_URL;


  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.ENABLE_DEBUG = true;

}(this));
