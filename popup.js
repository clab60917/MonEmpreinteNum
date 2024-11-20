// popup.js
document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        if (response) {
          // Calcul et affichage du score
          let score = calculatePrivacyScore(response);
          const scoreElement = document.getElementById('privacyScore');
          scoreElement.textContent = `${score}%`;
          scoreElement.className = `text-3xl font-bold ${
            score > 70 ? 'text-green-500' : 
            score > 40 ? 'text-yellow-500' : 
            'text-red-500'
          }`;
  
          // Trackers
          const cookiesCount = response.cookies.split(';').filter(c => c.trim()).length;
          const cookiesContainer = document.getElementById('cookiesData');
          cookiesContainer.innerHTML = `
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold text-blue-600">Trackers détectés</h2>
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${cookiesCount} trackers</span>
            </div>
            <div class="space-y-2">
              ${response.cookies.split(';').map(cookie => {
                const [name, value] = cookie.trim().split('=');
                let type = getTrackerType(name);
                return `
                  <div class="bg-blue-50 p-3 rounded">
                    <span class="font-medium">${type.icon} ${type.name || name}</span>
                    ${type.description ? `<p class="text-sm text-gray-600 mt-1">${type.description}</p>` : ''}
                  </div>`;
              }).join('')}
            </div>
          `;
  
          // Infos techniques
          const techContainer = document.getElementById('techData');
          techContainer.innerHTML = `
            <h2 class="text-lg font-semibold text-green-600 mb-3">Informations techniques</h2>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">💻 Système</span><br>
                <span class="text-sm">${response.technicalInfo.userAgent.match(/\((.*?)\)/)[1]}</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">🌍 Langue</span><br>
                <span class="text-sm">${response.technicalInfo.language}</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">📱 Écran</span><br>
                <span class="text-sm">${response.technicalInfo.screenResolution}</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">🕒 Fuseau</span><br>
                <span class="text-sm">${response.technicalInfo.timezone}</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">📡 Connexion</span><br>
                <span class="text-sm">${
                  typeof response.technicalInfo.connection === 'object' 
                  ? `${response.technicalInfo.connection.type} (${response.technicalInfo.connection.downlink})`
                  : response.technicalInfo.connection
                }</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">🔍 Mode</span><br>
                <span class="text-sm">${response.technicalInfo.mode}</span>
              </div>
            </div>
          `;
  
          // Sécurité
          if (response.technicalInfo.security) {
            const securityContainer = document.createElement('div');
            securityContainer.className = 'bg-white rounded-lg shadow p-4 mb-4';
            securityContainer.innerHTML = `
              <h2 class="text-lg font-semibold text-yellow-600 mb-3">Sécurité</h2>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-yellow-50 p-3 rounded">
                  <span class="font-medium">🔒 HTTPS</span><br>
                  <span class="text-sm">${response.technicalInfo.security.https ? 'Actif' : 'Non actif'}</span>
                </div>
                <div class="bg-yellow-50 p-3 rounded">
                  <span class="font-medium">🛡️ Protection</span><br>
                  <span class="text-sm">${response.technicalInfo.security.certificate}</span>
                </div>
              </div>
            `;
            document.body.insertBefore(securityContainer, document.getElementById('formData'));
          }
  
          // Formulaires
          const formContainer = document.getElementById('formData');
          formContainer.innerHTML = `
            <h2 class="text-lg font-semibold text-purple-600 mb-3">Formulaires détectés</h2>
            <div class="space-y-2">
              ${response.formData.map(form => `
                <div class="bg-purple-50 p-3 rounded">
                  <span class="font-medium">📝 ${form.id}</span>
                  <div class="text-sm mt-1">
                    ${form.elements} champs détectés
                    ${form.types ? `<br>Types: ${Object.entries(form.types).map(([type, count]) => 
                      `${count} ${type}`
                    ).join(', ')}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
      });
    });
  });
  
  // Fonctions utilitaires
  function calculatePrivacyScore(data) {
    let score = 100;
    
    // Pénalités cookies
    const cookiesCount = data.cookies.split(';').filter(c => c.trim()).length;
    score -= cookiesCount * 5;
  
    // Pénalités pour trackers spécifiques
    if (data.cookies.includes('_ga')) score -= 10; // Google Analytics
    if (data.cookies.includes('fbp')) score -= 15; // Facebook
    if (data.cookies.includes('_gid')) score -= 10; // Google tracking
  
    // Bonus sécurité
    if (data.technicalInfo.security?.https) score += 10;
  
    return Math.max(0, Math.min(100, score));
  }
  
  function getTrackerType(cookieName) {
    const trackers = {
      '_ga': {
        name: 'Google Analytics',
        icon: '📊',
        description: 'Suivi statistique Google'
      },
      'fbp': {
        name: 'Facebook Pixel',
        icon: '👥',
        description: 'Tracking publicitaire Facebook'
      },
      'euconsent': {
        name: 'Consentement GDPR',
        icon: '🔒',
        description: 'Gestion du consentement cookies'
      },
      '_gid': {
        name: 'Google User Tracking',
        icon: '👤',
        description: 'Suivi utilisateur Google'
      }
    };
  
    for (let [key, value] of Object.entries(trackers)) {
      if (cookieName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
  
    return {
      name: cookieName,
      icon: '🍪'
    };
  }