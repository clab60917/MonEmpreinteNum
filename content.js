chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log("Message reçu dans content.js");
      if (request.type === "GET_DATA") {
        const data = {
          cookies: document.cookie,
          navigationData: {
            currentURL: window.location.href,
            referrer: document.referrer
          },
          technicalInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`
          },
          formData: Array.from(document.forms).map(form => ({
            id: form.id,
            elements: form.elements.length
          }))
        };
        console.log("Données envoyées:", data);
        sendResponse(data);
      }
      return true;
    }
  );
  