var tabHandler;
(function() {
	var TabHandler = function TabHandler() {
	};
	var tabsContainer;
	var groupId = 0;
	var tabGroups = {
		
	};
	TabHandler.prototype = {
		init : function() {

			chrome.windows
					.getCurrent(
							{
								populate : true
							},
							function(window) {
								
								jQuery('#addCategory').click({
								}, function() {
									addCategory();
								}).disableSelection();
								tabsContainer = jQuery("#tabsContainer");

								var tabsList = addCategory();

								var row = 0;
								var defaultTabGroup = tabGroups[0];
								
//								tabGroups[defaultTabGroup.id] = defaultTabGroup;
								for (key in window.tabs) {
									if (window.tabs.hasOwnProperty(key)
											&& window.tabs[key].title != "TabHandler") {
										row++;

										defaultTabGroup.tabs[window.tabs[key].id] = createTabListElementContent(window.tabs[key]);
		
										defaultTabGroup.tabs[window.tabs[key].id].htmlElements.li.appendTo(tabsList);
										
										// chrome.tabs.remove(window.tabs[key].id);
									}
								}
								console.info("groups:",tabGroups);
							});

			addEventListeners();

		},
		getGroups : function(){
			return tabGroups;
		}
	};

	function createTabListElementContent(tab, groupId) {

		var link = jQuery("<a href='' class='tabTitle'>" + tab.title + "</a>");

		var settings = jQuery('<div class="settings"></div>').appendTo(link);
		settings.append("<div class='handler'></div>");

		var url = jQuery('<span class="tabListUrl">' + tab.url + '</span>');
		url.appendTo(link);

		link.click({
			tab : tab
		}, function(e) {
			e.preventDefault();
			console.info("tab that is opened: {}", e.data.tab);
			chrome.tabs.highlight({
				tabs : [ e.data.tab.index ]
			}, function() {
			});

		});

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
				url : url
			}
		});
		
		return tabListElement;
	}
	function addCategory() {
		var tabGroup = jQuery('<div class="tabGroup"></div>').appendTo(
				tabsContainer);
		var tabsList = jQuery('<ol  class="tabList"><ol>').sortable({
			connectWith : ".tabList",
			handle : ".handler",
			dropOnEmpty : true
		}).disableSelection().appendTo(tabGroup);
		
		
		tabGroups[groupId] = new TabGroup(groupId++,tabsList);
		return tabsList;

		
		
	}
	function addEventListeners() {
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			console.info("changed ", changeInfo.url);
		});
	}
	tabHandler = new TabHandler();

})();
jQuery(function() {

	// if(chrome.extension.getBackgroundPage().tabHandlerTab == null){
	tabHandler.init();

	// }
});