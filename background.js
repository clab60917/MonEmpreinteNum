// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { type: "GET_DATA" }, response => {
            if (response) {
                updateBadge(response, tabId);
            }
        });
    }
});

function updateBadge(data, tabId) {
    // Calcul du score simplifié et plus pertinent
    let score = 100;
    
    // Pénalités pour les cookies
    const cookiesCount = data.cookies.split(';').filter(c => c.trim()).length;
    score -= cookiesCount * 5;

    // Pénalités pour trackers majeurs
    const cookieString = data.cookies.toLowerCase();
    if (cookieString.includes('_ga') || cookieString.includes('analytics')) score -= 15; // Google Analytics
    if (cookieString.includes('fbp') || cookieString.includes('facebook')) score -= 20; // Facebook
    if (cookieString.includes('ads') || cookieString.includes('adwords')) score -= 15; // Publicités
    if (cookieString.includes('tracking') || cookieString.includes('tracker')) score -= 10; // Trackers génériques

    score = Math.max(0, Math.min(100, score));

    // Définir la couleur
    let color;
    if (score >= 75) {
        color = [39, 174, 96, 255]; // Vert
    } else if (score >= 40) {
        color = [241, 196, 15, 255]; // Orange
    } else {
        color = [231, 76, 60, 255]; // Rouge
    }

    // Mettre à jour le badge
    chrome.action.setBadgeBackgroundColor({
        color: color,
        tabId: tabId
    });

    chrome.action.setBadgeText({
        text: score.toString(),
        tabId: tabId
    });
}