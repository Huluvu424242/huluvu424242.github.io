// change to the version you get from `npm ls workbox-build`
importScripts('workbox-v6.0.2/workbox-sw.js');

// custom service worker code
self.addEventListener('fetch', function (event) {
  console.log('Handling fetch event for', event.request.url);

  responsePromise = fetch(event.request)
    .then(function (response) {
      console.log('Response from network is:', response);
      console.log(new Map(response.headers));

      const newHeaders = new Headers(response.headers);
      newHeaders.append('Access-Control-Allow-Origin', '*');

      const anotherResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

      console.log(new Map(anotherResponse.headers));
      return anotherResponse;
    })
    .catch(function (error) {
      console.error('Fetching failed:', error);
      throw error;
    });

  event.respondWith(responsePromise);

});


// the precache manifest will be injected into the following line
// self.workbox.precaching.precacheAndRoute([]);
precacheAndRoute(self.__WB_MANIFEST);
