document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        if (response) {
          const container = document.getElementById('cookiesData');
          const techContainer = document.getElementById('techData');
          const formContainer = document.getElementById('formData');
  
          // Analyse des cookies
          const cookies = response.cookies.split(';');
          let cookieInfo = '';
          
          // Extraire les infos importantes des cookies
          const trackers = {
            'ga': 'Google Analytics',
            'euconsent': 'Consentement GDPR',
            'ownpage': 'Statistiques de page'
          };
  
          cookieInfo = `
            <div class="bg-white rounded-lg shadow p-4 mb-4">
              <h2 class="text-lg font-semibold mb-2 text-blue-600">Trackers détectés</h2>
              <div class="space-y-2">
                ${cookies.map(cookie => {
                  const [name] = cookie.trim().split('=');
                  for (let [key, description] of Object.entries(trackers)) {
                    if (name.toLowerCase().includes(key)) {
                      return `
                        <div class="bg-blue-50 p-3 rounded">
                          <span class="font-medium">📍 ${description}</span>
                        </div>`;
                    }
                  }
                }).filter(Boolean).join('')}
              </div>
            </div>`;
          container.innerHTML = cookieInfo;
  
          // Analyse des informations techniques
          const techInfo = response.technicalInfo;
          const parsedTechInfo = `
            <div class="bg-white rounded-lg shadow p-4 mb-4">
              <h2 class="text-lg font-semibold mb-2 text-green-600">Informations techniques</h2>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-green-50 p-3 rounded">
                  <span class="font-medium">💻 Système</span><br/>
                  <span class="text-sm">${techInfo.userAgent.match(/\((.*?)\)/)[1]}</span>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <span class="font-medium">🌍 Langue</span><br/>
                  <span class="text-sm">${techInfo.language}</span>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <span class="font-medium">📱 Écran</span><br/>
                  <span class="text-sm">${techInfo.screenResolution}</span>
                </div>
              </div>
            </div>`;
          techContainer.innerHTML = parsedTechInfo;
  
          // Analyse des formulaires
          const formInfo = `
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-lg font-semibold mb-2 text-purple-600">Formulaires détectés</h2>
              <div class="space-y-2">
                ${response.formData.map(form => `
                  <div class="bg-purple-50 p-3 rounded">
                    <span class="font-medium">📝 ${form.id || 'Formulaire sans ID'}</span><br/>
                    <span class="text-sm">${form.elements} champs détectés</span>
                  </div>
                `).join('')}
              </div>
            </div>`;
          formContainer.innerHTML = formInfo;
        }
      });
    });
  });