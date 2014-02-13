var tabHandler;
(function() {
	var TabHandler = function TabHandler() {
	};
	var tabsContainer;
	var groupId = 0;
	var tabGroups = [];
	_grabbedRow = null;
	TabHandler.prototype = {
		init : function() {

			chrome.windows.getCurrent({populate : true},
				function(window) {
	
					jQuery('#addGroup').click({}, function() {
						addGroup();
					}).disableSelection();
					tabsContainer = jQuery("#tabsContainer");
	
					var tabsList = addGroup();
	
					var row = 0;
					var initTabGroup = tabGroups[0];
	
					for (key in window.tabs) {
						if (window.tabs.hasOwnProperty(key)
								&& window.tabs[key].title != "TabHandler") {
							row++;
	
							initTabGroup.tabs[window.tabs[key].id] = createTabListElementContent(window.tabs[key]);
	
							initTabGroup.tabs[window.tabs[key].id].htmlElements.li
									.appendTo(tabsList);
	
							// chrome.tabs.remove(window.tabs[key].id);
						}
					}
					
				});
				
				addEventListeners();

		},
		getGroups : function() {
			return tabGroups;
		}
	};
	function createTabListElementContent(tab, groupId) {

		var link = jQuery("<a href=''></a>");
		var title = jQuery("<span class='tabTitle'>" + tab.title + "</span>");
		
		var settings = createListSettings();
		var url = jQuery('<span class="tabListUrl">' + tab.url + '</span>');
		
		title.appendTo(link);
		settings.container.appendTo(link);
		
		url.appendTo(link);

		link.click({tab : tab}, highlightTab);

		var favicon = jQuery("<img class='favicon' src='" + tab.favIconUrl
				+ "'/>");

		var tabListElement = new TabGroupElement({
			tab : tab,
			htmlElements : {
				li : jQuery('<li class="tabListElement"></li>').append(
						jQuery('<div class="listElementContainer"></div>')
								.append(favicon).append(link)),
				link : link,
				settings : settings,
				favicon : favicon,
				title : title,
				url : url
			}
		});
		
		tabListElement.htmlElements.li.mouseover({tabListElement : tabListElement},function(evt){
			var htmlElements = evt.data.tabListElement.htmlElements;
			htmlElements.settings.container.css({"display" : "inline-block"});
			htmlElements.settings.container.animate({opacity : 1},200);
			htmlElements.url.animate({"margin-left" : "30px" } ,200);
		});
		
		tabListElement.htmlElements.li.mouseleave({tabListElement : tabListElement},function(evt){
			var htmlElements = evt.data.tabListElement.htmlElements;

			htmlElements.settings.container.animate({opacity : 0},200,function(){
					evt.data.tabListElement.htmlElements.settings.container.css({"display" : "none"});
			});
			htmlElements.url.animate({"margin-left" : "0px"},200);
		});
		
		settings.dropDownHandler.mousedown({
			tabListElement : tabListElement
		}, function(ev) {
			_grabbedRow = {
				tabListElement : ev.data.tabListElement,
				group : getGroupByTab(tab)
			}
		});

		return tabListElement;
	}
	function createListSettings(){
		var settings = jQuery('<div class="settings"></div>');
		var dropDownHandler = jQuery("<div class='handler'></div>");
		var closeButton = jQuery("<div class='closeButton'></div>");
		
		settings.css({"display" : "none",opacity : 0});
		
		dropDownHandler.appendTo(settings);	
		closeButton.appendTo(settings);
		
		return {
			container : settings,
			dropDownHandler : dropDownHandler,
			closeButton : closeButton
		};
	}
	function highlightTab(event) {
		event.preventDefault();
		
		chrome.tabs.get(event.data.tab.id,function(tab){	
			chrome.tabs.highlight({
				tabs : [ tab.index ]
			}, function() {}); 
		})
		
	}
	function addGroup() {
		var tabGroup = jQuery('<div id=tabGroup' + groupId + ' class="tabGroup"></div>');
		addGroupTitle(tabGroup); 
		var tabsList = jQuery('<ol class="tabList"><ol>')
				.sortable({
					connectWith : ".tabList",
					handle : ".handler",
					dropOnEmpty : true,
					stop : handleDropEvent
				}).disableSelection().appendTo(tabGroup);
				
		if(typeof tabsContainer.children()[0] == "undefined"){
			tabsContainer.append(tabGroup);
		}else {
			jQuery(tabsContainer.children()[0]).before(tabGroup);
		}
		
		var newTabGroup = new TabGroup(groupId++, tabGroup);
		tabGroups.push(newTabGroup);
		
		return tabsList;

	}
	function addGroupTitle(tabGroupJ){
		var groupTitle = jQuery("<div class='groupTitle'><input type='text'/><div>").appendTo(tabGroupJ);
	
		groupTitle.change(function(evt){
			var tabGroup = getGroupByElement(tabGroupJ);
			
			tabGroup.title = jQuery(this).children("input").val();
				
		});
	}
	function handleDropEvent(event, ui) {
		if (_grabbedRow != null) {
			var newGroup = getGroupByElement(ui.item.parent().parent());
			console.info("new group is ", newGroup);
			delete _grabbedRow.group.tabs[_grabbedRow.tabListElement.tab.id];
			newGroup.tabs[_grabbedRow.tabListElement.tab.id] = _grabbedRow.tabListElement;

			_grabbedRow = null;
		}
	}
	function addEventListeners() {
		chrome.tabs.onUpdated.addListener(refreshListElement);
		chrome.tabs.onCreated.addListener(tabCreatedEventHandler)
	}
	function refreshListElement(tabId, changeInfo, tab){
	console.info("refreshListElement: ",tabId)
		
		var parentGroup = getGroupByTab(tab);
		
	}
	//TODO: Need to refactor this.
	function tabCreatedEventHandler(tab){
		console.info("tabCreatedEventHandler, ");
//		var defaultGroup = getDefaultGroup();
//		var listElement = createTabListElementContent(tab);
//		if(defaultGroup != null){
//			
//			defaultGroup.htmlElement.children("ol").append(listElement.htmlElements.li);
//			defaultGroup.tabs[tab.id] = tabs;
//			
//		}else{
//			var tabsList = addGroup();
//			tabsList.append(listElement.htmlElements.li);
//			tabGroups[tabGroups.length-1].tabs[tab.id] = tab;
//			console.info("the last  ",tabGroups[tabGroups.length-1].tabs);
//		}
		
	}
	function getGroupByTab(tab) {
		for (var i = 0;i<tabGroups.length; i++) {
			for ( var tabKey in tabGroups[i].tabs) {
				if (tabGroups[i].tabs.hasOwnProperty(tabKey)) {
					if (tab.id == tabGroups[i].tabs[tabKey].tab.id) {
						return tabGroups[i];
					}
				}
			}
		}
		return null;
	}
	function getGroupByElement(element) {
		for(var i = 0;i<tabGroups.length; i++){
			if (tabGroups[i].htmlElement.attr("id") == element.attr("id")) {
				return tabGroups[i];
			}
		}
		return null;
	}
	
	tabHandler = new TabHandler();

})();
jQuery(function() {

	// if(chrome.extension.getBackgroundPage().tabHandlerTab == null){
	tabHandler.init();

	// }
});