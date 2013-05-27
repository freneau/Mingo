define(function () {
	
	var canvas = {};
	canvas.frameTab = {};
	canvas.ctxTab = {};
	canvas.widthToHeight = 1;
	canvas.fullWidth = false;

	canvas.init = function(container, width, height, levelWidth, levelHeight)
	{
		canvas.width = width;
		canvas.height = height;
		canvas.widthToHeight = width / height;
		
		canvas.levelWidth = levelWidth;
		canvas.levelHeight = levelHeight;

		var mainCanvas = document.createElement('canvas');
		mainCanvas.id = "canvas";
		mainCanvas.width = width;
		mainCanvas.height = height;
		mainCanvas.className = "canvas";
		container.appendChild(mainCanvas);

		canvas.frameTab["main"] = mainCanvas;
		canvas.ctxTab["main"] = mainCanvas.getContext("2d", {antialias : true});
		
		canvas.create(container, "temp", 0);
		canvas.resize();
	};

	canvas.create = function(container, name)
	{
		var newCanvas = document.createElement("canvas")
		newCanvas.width = canvas.levelWidth;
		newCanvas.height = canvas.levelHeight;
		canvas.frameTab[name] = newCanvas;
		canvas.ctxTab[name] = newCanvas.getContext("2d");
	};

	canvas.resize = function()
	{
		canvas.newWidth = window.innerWidth;
		canvas.newHeight = window.innerHeight;
		var newWidthToHeight = canvas.newWidth / canvas.newHeight;
		
		if (newWidthToHeight > canvas.widthToHeight)
		{
			canvas.newWidth = canvas.newHeight * canvas.widthToHeight;
		}
		else
		{
			canvas.newHeight = canvas.newWidth / canvas.widthToHeight;
		}

		canvas.ratio = canvas.width / canvas.newWidth;
		if (canvas.ratio < 10 && canvas.fullWidth == false)
		{
			canvas.frameTab["main"].style.width = canvas.newWidth + "px";
			canvas.frameTab["main"].style.height = canvas.newHeight + "px";
		}
		else
		{
			canvas.frameTab["main"].style.width = canvas.width + "px";
			canvas.frameTab["main"].style.height = canvas.height + "px";
		}
		
		canvas.center();
		
		canvas.offsetLeft = window.innerWidth/2 + canvas.frameTab["main"].offsetLeft;
		canvas.offsetTop = window.innerHeight/2 + canvas.frameTab["main"].offsetTop;
	};

	canvas.center = function()
	{
		if (canvas.ratio < 10 && canvas.fullWidth == false)
		{
			canvas.frameTab["main"].style.marginLeft = (-canvas.newWidth / 2) + 'px';
			canvas.frameTab["main"].style.marginTop = (-canvas.newHeight / 2) + 'px';
		}
		else
		{
			canvas.frameTab["main"].style.marginLeft = (-canvas.width / 2) + 'px';
			canvas.frameTab["main"].style.marginTop = (-canvas.height / 2) + 'px';
		}

		// TODO : why ?
		if (canvas.frameTab["main"].offsetLeft < 0)
		{
			canvas.frameTab["main"].style.marginLeft = (-canvas.newWidth / 2) - (canvas.frameTab["main"].offsetLeft) + 'px';
		}
	};

	return canvas;
});