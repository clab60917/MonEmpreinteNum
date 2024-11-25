// popup.js
document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        if (response) {
          // Calcul et affichage du score
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
                <span class="font-medium">📱 Résolution</span><br>
                <span class="text-sm">${response.technicalInfo.screenResolution}</span>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <span class="font-medium">⚡️ Processeurs</span><br>
                <span class="text-sm">${response.technicalInfo.cores} cœurs</span>
              </div>
            </div>
  
            <h3 class="text-lg font-semibold text-green-600 mt-4 mb-3">Scripts externes (${response.externalScripts?.length || 0})</h3>
            <div class="max-h-40 overflow-y-auto space-y-2">
              ${response.externalScripts?.map(script => `
                <div class="bg-green-50 p-2 rounded text-sm">
                  <div class="font-medium truncate">${new URL(script.src).hostname}</div>
                  <div class="text-xs text-gray-600">
                    ${script.async ? '⚡️ async' : ''} 
                    ${script.defer ? '⏳ defer' : ''}
                  </div>
                </div>
              `).join('') || 'Aucun script externe détecté'}
            </div>
          `;
        }
      });
    });
  });
  
  function calculatePrivacyScore(data) {
    let score = 100;
    
    // Pénalités pour les cookies
    const cookiesCount = data.cookies.split(';').filter(c => c.trim()).length;
    score -= cookiesCount * 5;
  
    // Pénalités pour trackers spécifiques
    const cookieString = data.cookies.toLowerCase();
    const trackers = {
      analytics: {
        patterns: ['_ga', '_gid', 'analytics', 'gtag'],
        penalty: 15,
        description: 'Analyse du comportement'
      },
      social: {
        patterns: ['fbp', 'facebook', 'twitter', 'linkedin', 'instagram'],
        penalty: 20,
        description: 'Réseaux sociaux'
      },
      ads: {
        patterns: ['adwords', 'ads', 'doubleclick', 'adsense', 'campaign'],
        penalty: 15,
        description: 'Publicité'
      },
      tracking: {
        patterns: ['tracking', 'visitor', 'session', 'uid', 'user'],
        penalty: 10,
        description: 'Suivi utilisateur'
      }
    };
  
    Object.values(trackers).forEach(tracker => {
      if (tracker.patterns.some(pattern => cookieString.includes(pattern))) {
        score -= tracker.penalty;
      }
    });
  
    // Garantir un score entre 0 et 100
    score = Math.max(0, Math.min(100, Math.round(score)));
  
    return {
      score: score,
      rating: score >= 90 ? "Excellent" :
             score >= 75 ? "Bon" :
             score >= 60 ? "Moyen" :
             score >= 40 ? "Préoccupant" :
             "Critique",
      details: {
        cookiesCount: cookiesCount,
        hasTrackers: Object.values(trackers).some(tracker => 
          tracker.patterns.some(pattern => cookieString.includes(pattern))
        ),
        trackersFound: Object.entries(trackers)
          .filter(([_, tracker]) => 
            tracker.patterns.some(pattern => cookieString.includes(pattern))
          )
          .map(([key, tracker]) => tracker.description)
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
              `<div class="text-red-500">⚠️ Trackers détectés :</div>
               <div class="text-red-500 text-sm">${scoreData.details.trackersFound.join(', ')}</div>` : 
              '<div class="text-green-500">✅ Pas de trackers publicitaires</div>'}
          </div>
        </div>
      </div>
    `;
  
    // Mise à jour du badge
    let color;
    if (scoreData.score >= 75) {
      color = [39, 174, 96, 255]; // Vert
    } else if (scoreData.score >= 40) {
      color = [241, 196, 15, 255]; // Orange
    } else {
      color = [231, 76, 60, 255]; // Rouge
    }
  
    chrome.action.setBadgeBackgroundColor({
      color: color
    });
  
    chrome.action.setBadgeText({
      text: scoreData.score.toString()
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
      },
      'gtag': {
        name: 'Google Tag Manager',
        icon: '🏷️',
        description: 'Gestionnaire de tags Google'
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