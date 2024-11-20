chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "GET_DATA") {
      const data = {
        cookies: document.cookie,
        technicalInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          connection: navigator.connection ? {
            type: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink + ' Mbps',
            rtt: navigator.connection.rtt + 'ms'
          } : 'Non disponible',
          mode: window.history.length ? 'Navigation normale' : 'Navigation privée possible',
          // Nouvelles informations
          device: {
            memory: navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'Non disponible',
            cores: navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' cores' : 'Non disponible',
            battery: 'Checking...'
          },
          security: {
            https: window.location.protocol === 'https:',
            certificate: window.location.protocol === 'https:' ? 'SSL/TLS actif' : 'Non sécurisé',
            permissions: checkPermissions()
          },
          webGL: detectWebGL(),
          audioContext: detectAudioContext(),
          canvas: detectCanvas()
        },
        formData: Array.from(document.forms).map(form => ({
          id: form.id || 'Formulaire sans ID',
          elements: form.elements.length,
          types: getFormFieldTypes(form)
        })),
        scripts: detectThirdPartyScripts(),
        apis: detectSensitiveAPIs()
      };
  
      // Vérification de la batterie si disponible
      if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
          data.technicalInfo.device.battery = `${Math.round(battery.level * 100)}% ${battery.charging ? '(en charge)' : ''}`;
        });
      }
  
      sendResponse(data);
    }
    return true;
  });
  
  // Fonctions utilitaires pour content.js
  function checkPermissions() {
    const permissions = {
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      microphone: 'MediaRecorder' in window,
      camera: navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
      clipboard: 'clipboard' in navigator
    };
    return Object.entries(permissions)
      .filter(([_, available]) => available)
      .map(([name]) => name);
  }
  
  function detectWebGL() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl ? true : false;
  }
  
  function detectAudioContext() {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }
  
  function detectCanvas() {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  }
  
  function getFormFieldTypes(form) {
    const types = {};
    Array.from(form.elements).forEach(element => {
      if (element.type) {
        types[element.type] = (types[element.type] || 0) + 1;
      }
    });
    return types;
  }
  
  function detectThirdPartyScripts() {
    const scripts = Array.from(document.scripts);
    return scripts
      .filter(script => script.src)
      .map(script => {
        const url = new URL(script.src);
        return {
          domain: url.hostname,
          url: script.src
        };
      })
      .filter(script => script.domain !== window.location.hostname);
  }
  
  function detectSensitiveAPIs() {
    return {
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webRTC: 'RTCPeerConnection' in window,
      bluetooth: 'bluetooth' in navigator,
      usb: 'usb' in navigator,
      nfc: 'nfc' in navigator
    };
  }
  