document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        console.log("Réponse reçue:", response);
        if (response) {
          document.getElementById('cookiesData').textContent = JSON.stringify(response.cookies, null, 2);
          document.getElementById('techData').textContent = JSON.stringify(response.technicalInfo, null, 2);
          document.getElementById('formData').textContent = JSON.stringify(response.formData, null, 2);
        }
      });
    });
  });
  
