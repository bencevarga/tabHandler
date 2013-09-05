var tabHandler;
(function() {
	var TabHandler = function TabHandler() {
	};
	var tabsContainer;
	var groupId = 0;
	var tabGroups = {

	};
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
					var defaultTabGroup = tabGroups[0];
	
					for (key in window.tabs) {
						if (window.tabs.hasOwnProperty(key)
								&& window.tabs[key].title != "TabHandler") {
							row++;
	
							defaultTabGroup.tabs[window.tabs[key].id] = createTabListElementContent(window.tabs[key]);
	
							defaultTabGroup.tabs[window.tabs[key].id].htmlElements.li
									.appendTo(tabsList);
	
							// chrome.tabs.remove(window.tabs[key].id);
						}
					}
					defaultTabGroup.default = true;
					
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
		
		var settings = jQuery('<div class="settings"></div>');
		var dropDownHandler = jQuery("<div class='handler'></div>");
		var url = jQuery('<span class="tabListUrl">' + tab.url + '</span>');
		title.appendTo(link);
		settings.appendTo(link);
		dropDownHandler.appendTo(settings);	
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

		dropDownHandler.mousedown({
			tabListElement : tabListElement
		}, function(ev) {
			_grabbedRow = {
				tabListElement : ev.data.tabListElement,
				group : getGroupByTab(tab)
			}
		});

		return tabListElement;
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
		var tabGroup = jQuery('<div id=tabGroup' + groupId + ' class="tabGroup"></div>').appendTo(tabsContainer);
		addGroupTitle(tabGroup); 
		var tabsList = jQuery('<ol class="tabList"><ol>')
				.sortable({
					connectWith : ".tabList",
					handle : ".handler",
					dropOnEmpty : true,
					stop : handleDropEvent
				}).disableSelection().appendTo(tabGroup);

		tabGroups[groupId] = new TabGroup(groupId++, tabGroup);

		return tabsList;

	}
	function addGroupTitle(tabGroupJ){
		var groupTitle = jQuery("<div class='groupTitle'><input type='text'/><div>").appendTo(tabGroupJ);
	
		groupTitle.change(function(evt){
			var tabGroup = getGroupByElement(tabGroupJ);
			var newTitle = jQuery(this).children("input").val();
			
			if((tabGroup.title == null || tabGroup.title == "") &&  newTitle != ""){
				console.info("delete default: ",newTitle);
				tabGroup.title = newTitle;
				tabGroup.default = false;
			}else if(newTitle == "" && getDefaultGroup().id == null){
				console.info("sadasdasd: ",newTitle);
				tabGroup.default = true;
			}
			
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
		var parentGroup = getGroupByTab(tab);
		if(null != parentGroup){
			var updatedTablistElement = parentGroup.tabs[tab.id];
			console.info("updatedTablistElement: ",updatedTablistElement.htmlElements);
			updatedTablistElement.htmlElements.title.html(tab.title);
			updatedTablistElement.htmlElements.url.html(tab.url);
			updatedTablistElement.htmlElements.favicon.attr("src",tab.favIconUrl);
			
		}
	}
	function tabCreatedEventHandler(tab){
		var tabsList = addGroup();
		
		defaultTabGroup.tabs[tab.id] = createTabListElementContent(window.tabs[key]);
	
		defaultTabGroup.tabs[window.tabs[key].id].htmlElements.li
									.appendTo(tabsList);
	}
	function getGroupByTab(tab) {
		for ( var key in tabGroups) {
			if (tabGroups.hasOwnProperty(key)) {
				for ( var tabKey in tabGroups[key].tabs) {
					if (tabGroups[key].tabs.hasOwnProperty(tabKey)) {
						if (tab.id == tabGroups[key].tabs[tabKey].tab.id) {
							return tabGroups[key];
						}
					}
				}
			}
		}
		return null;
	}
	function getGroupByElement(element) {
		for ( var key in tabGroups) {
			if (tabGroups.hasOwnProperty(key)) {
				if (tabGroups[key].htmlElement.attr("id") == element.attr("id")) {
					return tabGroups[key];
				}
			}
		}
		return null;
	}
	function getDefaultGroup(){
		for ( var key in tabGroups) {
			if (tabGroups.hasOwnProperty(key) && tabGroups[key].default) {
				return tabGroups[key];
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