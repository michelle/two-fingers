chrome.browserAction.onClicked.addListener(function(tab) {
	
	
  	chrome.windows.create({'url': 'http://localhost:8000/camera.html', 'type': 'popup', 'width': 600, 'height': 200}, function(window) {
	});
	
	
	chrome.extension.onConnect.addListener(function(port) {
	  console.assert(port.name == "activate");
	  port.onMessage.addListener(function(msg) {
		chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function(tab) {
			if (tab[0] && tab[0].id) {
				if (msg.command == 'back') {
					chrome.tabs.executeScript(tab[0].id, {code: "history.go(-1);"}, function() {
						console.log('go back', tab[0].id);
					});
				} else if (msg.command == 'forward') {
					chrome.tabs.executeScript(tab[0].id, {code: "history.go(1);"}, function() {
						console.log('go forward', tab[0].id);
					});
				}
			}
		});
	  });
	});
	
});
