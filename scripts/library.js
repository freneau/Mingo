define(function() {

	var library = {};
	library.ready = false;
	library.images = new Array();
	library.nbImage = 0;

	library.preload = function(liste)
	{
		library.nbImage = liste.length;
		for (var i in liste)
		{
			var link = liste[i];
			var image = new Image();
			image.onload = function()
			{
				library.imageLoaded();
			}
			image.src = "image/" + link + ".png";
			library.images[link] = image;
		}
	};

	library.imageLoaded = function()
	{
		library.nbImage--;
		if (library.nbImage == 0)
		{
			library.ready = true;
		}
	};

	return library;
})