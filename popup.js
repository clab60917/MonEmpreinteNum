document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        if (response) {
          // Calcul et affichage du score
          const cookiesCount = response.cookies.split(';').filter(c => c.trim()).length;
          let score = 100 - (cookiesCount * 5);
          score = Math.max(0, Math.min(100, score));
          
          const scoreElement = document.getElementById('privacyScore');
          scoreElement.textContent = `${score}%`;
          scoreElement.className = `text-3xl font-bold ${score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500'}`;
  
          // Trackers
          const cookiesContainer = document.getElementById('cookiesData');
          cookiesContainer.innerHTML = `
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-semibold text-blue-600">Trackers détectés</h2>
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${cookiesCount} trackers</span>
            </div>
            <div class="space-y-2">
              ${response.cookies.split(';').map(cookie => {
                const [name, value] = cookie.trim().split('=');
                return `
                  <div class="bg-blue-50 p-3 rounded">
                    <span class="font-medium">📍 ${name || 'Cookie sans nom'}</span>
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
                <span class="text-sm">${response.technicalInfo.connection}</span>
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
                  <span class="font-medium">📝 ${form.id}</span><br>
                  <span class="text-sm">${form.elements} champs détectés</span>
                </div>
              `).join('')}
            </div>
          `;
        }
      });
    });
  });
  