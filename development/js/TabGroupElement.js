var TabGroupElement = function TabGroupElement(arg) {
	this.tab = arg.tab;
	this.htmlElements = arg.htmlElements;
};

TabGroupElement.prototype = {
	tab : null,
	htmlElements : {
		li : null,
		link : null,
		settings : null,
		url : null
	}
}
