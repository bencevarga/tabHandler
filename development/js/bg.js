var tabHandlerTab = null;
chrome.browserAction.onClicked.addListener(function(activeTab) {
	var newURL = "/index.html";

	if (null == tabHandlerTab) {
		chrome.tabs.create({
			url : newURL
		}, function(tab) {
			tabHandlerTab = tab;
			
		});
	}else{
		console.info(tabHandlerTab);
		
		chrome.tabs.get(tabHandlerTab.id,function(tab){
			chrome.tabs.highlight({tabs:[tab.index]},function(){});
			tabHandlerTab = tab;
		});
		
	}
});
chrome.tabs.onRemoved.addListener(function(id){
	if(id == tabHandlerTab.id){
		tabHandlerTab = null;
	}
	
});