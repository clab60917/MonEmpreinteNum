console.log("Popup script chargé");
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM chargé");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("Tab active trouvée:", tabs[0].id);
    chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
      console.log("Réponse reçue:", response);
      if (response) {
        try {
          document.getElementById('cookiesData').textContent = 
            typeof response.cookies === 'object' ? 
            JSON.stringify(response.cookies, null, 2) : 
            response.cookies;

          document.getElementById('techData').textContent = 
            JSON.stringify(response.technicalInfo, null, 2);

          document.getElementById('formData').textContent = 
            JSON.stringify(response.formData, null, 2);
        } catch (error) {
          console.error("Erreur lors de l'affichage:", error);
        }
      } else {
        console.error("Pas de réponse reçue");
      }
    });
  });
});
