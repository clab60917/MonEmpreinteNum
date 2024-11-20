document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "GET_DATA"}, function(response) {
        displayData(response);
      });
    });
  });
  
  function displayData(data) {
    const container = document.getElementById('dataContainer');
    
    const sections = {
      'Cookies': data.cookies,
      'Données de navigation': data.navigationData,
      'Informations techniques': data.technicalInfo,
      'Données de formulaire': data.formData
    };
  
    for (const [title, content] of Object.entries(sections)) {
      if (content && Object.keys(content).length > 0) {
        const section = document.createElement('div');
        section.className = 'data-section';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'data-title';
        titleEl.textContent = title;
        
        const valueEl = document.createElement('div');
        valueEl.className = 'data-value';
        valueEl.textContent = JSON.stringify(content, null, 2);
        
        section.appendChild(titleEl);
        section.appendChild(valueEl);
        container.appendChild(section);
      }
    }
  }
  

  