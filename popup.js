// popup.js
document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        if (response) {
          // Calcul et affichage du score amélioré
          const scoreData = calculatePrivacyScore(response);
          updatePrivacyScore(scoreData);
  
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
                <span class="font-medium">🔍 Navigation</span><br>
                <span class="text-sm">${response.technicalInfo.mode}</span>
              </div>
            </div>
          `;
  
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
  
  function calculatePrivacyScore(data) {
    let score = 100;
    
    // 1. Pénalités pour les cookies
    const cookiesCount = data.cookies.split(';').filter(c => c.trim()).length;
    score -= cookiesCount * 5;
    if (cookiesCount > 10) score -= 10;
  
    // 2. Pénalités pour trackers majeurs
    const cookieString = data.cookies.toLowerCase();
    const trackers = {
      google: {
        patterns: ['_ga', '_gid', 'google'],
        penalty: 15
      },
      facebook: {
        patterns: ['fbp', 'facebook', '_fbp'],
        penalty: 20
      },
      marketing: {
        patterns: ['adwords', 'analytics', 'tracking', 'campaign'],
        penalty: 10
      },
      behavioral: {
        patterns: ['user', 'session', 'visitor'],
        penalty: 8
      }
    };
  
    Object.values(trackers).forEach(tracker => {
      if (tracker.patterns.some(pattern => cookieString.includes(pattern))) {
        score -= tracker.penalty;
      }
    });
  
    // 3. Pénalités pour les formulaires
    const formFields = data.formData.reduce((acc, form) => acc + form.elements, 0);
    score -= Math.min(20, formFields * 2);
  
    // 4. Évaluation finale
    let rating;
    if (score >= 90) {
      rating = "Excellent";
    } else if (score >= 75) {
      rating = "Bon";
    } else if (score >= 60) {
      rating = "Moyen";
    } else if (score >= 40) {
      rating = "Préoccupant";
    } else {
      rating = "Critique";
    }
  
    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      rating: rating,
      details: {
        cookiesCount: cookiesCount,
        hasTrackers: Object.values(trackers).some(tracker => 
          tracker.patterns.some(pattern => cookieString.includes(pattern))
        ),
        formFieldsCount: formFields
      }
    };
  }
  
  function updatePrivacyScore(scoreData) {
    const scoreContainer = document.getElementById('scoreContainer');
  
    scoreContainer.innerHTML = `
      <div class="text-center">
        <div class="text-3xl font-bold ${getScoreColorClass(scoreData.score)}">${scoreData.score}%</div>
        <div class="text-lg font-medium mt-1">${scoreData.rating}</div>
        <div class="text-sm text-gray-600 mt-2">
          <div class="flex flex-col gap-1">
            <div>🍪 ${scoreData.details.cookiesCount} cookies détectés</div>
            ${scoreData.details.hasTrackers ? 
              '<div class="text-red-500">⚠️ Trackers publicitaires présents</div>' : 
              '<div class="text-green-500">✅ Pas de trackers publicitaires</div>'}
            ${scoreData.details.formFieldsCount > 0 ? 
              `<div>📝 ${scoreData.details.formFieldsCount} champs de formulaire</div>` : ''}
          </div>
        </div>
      </div>
    `;
  
    // Mise à jour du badge de l'extension
    updateExtensionBadge(scoreData);
  }
  
  function updateExtensionBadge(scoreData) {
    // Définir la couleur en fonction du score
    let color;
    if (scoreData.score >= 75) {
      color = [39, 174, 96, 255]; // Vert
    } else if (scoreData.score >= 40) {
      color = [241, 196, 15, 255]; // Orange
    } else {
      color = [231, 76, 60, 255]; // Rouge
    }
  
    // Mettre à jour la couleur de la pastille
    chrome.action.setBadgeBackgroundColor({
      color: color
    });
  
    // Mettre à jour le texte de la pastille
    chrome.action.setBadgeText({
      text: `${scoreData.score}`
    });
  }
  
  function getScoreColorClass(score) {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
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
      },
      'adwords': {
        name: 'Google Ads',
        icon: '🎯',
        description: 'Publicité ciblée Google'
      },
      'campaign': {
        name: 'Campaign Tracker',
        icon: '📣',
        description: 'Suivi de campagne marketing'
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