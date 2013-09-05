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
	
					jQuery('#addCategory').click({}, function() {
						addCategory();
					}).disableSelection();
					tabsContainer = jQuery("#tabsContainer");
	
					var tabsList = addCategory();
	
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
					console.info("groups:", tabGroups);
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
	function addCategory() {
		var tabGroup = jQuery('<div class="tabGroup"></div>').appendTo(
				tabsContainer);
		addCategoryTitle(tabGroup); 
		var tabsList = jQuery('<ol id=list' + groupId + ' class="tabList"><ol>')
				.sortable({
					connectWith : ".tabList",
					handle : ".handler",
					dropOnEmpty : true,
					stop : handleDropEvent
				}).disableSelection().appendTo(tabGroup);

		tabGroups[groupId] = new TabGroup(groupId++, tabsList);

		return tabsList;

	}
	function addCategoryTitle(tabGroup){
		var categoryTitle = jQuery("<div class='categoryTitle'><input type='text'/><div>").appendTo(tabGroup);
		
	}
	function handleDropEvent(event, ui) {
		if (_grabbedRow != null) {
			var newGroup = getGroupByElement(ui.item.parent());
			console.info("new group is ", newGroup);
			delete _grabbedRow.group.tabs[_grabbedRow.tabListElement.tab.id];
			newGroup.tabs[_grabbedRow.tabListElement.tab.id] = _grabbedRow.tabListElement;

			_grabbedRow = null;
		}
	}
	function addEventListeners() {
		chrome.tabs.onUpdated.addListener(refreshListElement);
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
	tabHandler = new TabHandler();

})();
jQuery(function() {

	// if(chrome.extension.getBackgroundPage().tabHandlerTab == null){
	tabHandler.init();

	// }
});