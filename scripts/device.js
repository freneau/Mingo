define(function() {
	
	var device = {};

	var ua = navigator.userAgent.toLowerCase();
	device.isAndroid = ua.indexOf("android") > -1;
	device.isIPhone = ua.indexOf("iphone") > -1;
	device.isIPad = ua.indexOf("ipad") > -1;
	device.isBB = ua.indexOf("BB10") > -1 || ua.indexOf("RIM") > -1;
	device.isOther = ua.indexOf("mobile") > -1;
	device.isMobile = device.isAndroid || device.isIPhone || device.isIPad || device.isBB || device.isOther;

	return device;
});