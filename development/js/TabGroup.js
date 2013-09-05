var TabGroup = function TabGroup(groupId,htmlElement) {
	this.id = groupId;
	this.htmlElement = htmlElement;
	this.tabs={};
};

TabGroup.prototype = {
	name : "New Group",
	default: false,
	title: null
}
