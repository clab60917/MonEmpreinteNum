// content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === "GET_DATA") {
        const data = {
          cookies: document.cookie,
          externalScripts: Array.from(document.scripts)
            .filter(script => script.src)
            .map(script => ({
              src: script.src,
              type: script.type,
              async: script.async,
              defer: script.defer
            })),
          navigationData: {
            currentURL: window.location.href,
            referrer: document.referrer
          },
          technicalInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            connection: navigator.connection ? navigator.connection.effectiveType : 'Non disponible',
            mode: window.history.length ? 'Navigation normale' : 'Navigation privée possible',
            platform: navigator.platform,
            vendor: navigator.vendor || 'Non disponible',
            cores: navigator.hardwareConcurrency || 'Non disponible',
            webGL: detectWebGL()
          },
          formData: Array.from(document.forms).map(form => ({
            id: form.id || 'Formulaire sans ID',
            elements: form.elements.length
          }))
        };
        sendResponse(data);
      }
    }
);

function detectWebGL() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return gl ? 'Supporté' : 'Non supporté';
}

// Fonction pour calculer le score et mettre à jour le badge automatiquement
function updateBadgeAuto() {
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
      id: form.id || 'Formulaire sans ID',
      elements: form.elements.length
    }))
  };

  // Calcul du score
  let score = 100;
  const cookiesCount = data.cookies.split(';').filter(c => c.trim()).length;
  score -= cookiesCount * 5;
  if (cookiesCount > 10) score -= 10;

  const cookieString = data.cookies.toLowerCase();
  if (cookieString.includes('_ga')) score -= 15;
  if (cookieString.includes('fbp')) score -= 20;
  if (cookieString.includes('analytics')) score -= 10;

  const formFields = data.formData.reduce((acc, form) => acc + form.elements, 0);
  score -= Math.min(20, formFields * 2);

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Mise à jour du badge
  chrome.runtime.sendMessage({
    type: "UPDATE_BADGE",
    score: score
  });
}

// Mise à jour au chargement de la page
document.addEventListener('DOMContentLoaded', updateBadgeAuto);
window.addEventListener('load', updateBadgeAuto);