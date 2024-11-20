chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "GET_DATA") {
      const collectedData = {
        cookies: document.cookie.split(';').reduce((acc, current) => {
          const [key, value] = current.trim().split('=');
          acc[key] = value;
          return acc;
        }, {}),
        
        navigationData: {
          currentURL: window.location.href,
          referrer: document.referrer,
          lastVisited: localStorage.getItem('lastVisit'),
        },
        
        technicalInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        
        formData: Array.from(document.getElementsByTagName('form')).map(form => ({
          id: form.id,
          fields: Array.from(form.elements).map(element => ({
            type: element.type,
            name: element.name,
            id: element.id
          }))
        }))
      };
      
      sendResponse(collectedData);
    }
  });