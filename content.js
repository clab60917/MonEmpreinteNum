chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "GET_DATA") {
      const data = {
        cookies: document.cookie,
        technicalInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          connection: navigator.connection ? navigator.connection.effectiveType : 'Non disponible',
          mode: window.history.length ? 'Navigation normale' : 'Navigation privée possible'
        },
        formData: Array.from(document.forms).map(form => ({
          id: form.id || 'Formulaire sans ID',
          elements: form.elements.length
        }))
      };
      sendResponse(data);
    }
    return true;
  });