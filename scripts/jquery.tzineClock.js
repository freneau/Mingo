/*!
 * jquery.tzineClock.js - Tutorialzine Colorful Clock Plugin
 *
 * Copyright (c) 2009 Martin Angelov
 * http://tutorialzine.com/
 *
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Launch  : December 2009
 * Version : 1.0
 * Released: Monday 28th December, 2009 - 00:00
 */

(function($){

	// A global array used by the functions of the plug-in:
	var gVars = {};
	var gOpts = {};

	// The colors of the dials:
	var colors = ["green", "orange", "red"];
	var currentIndex = 0;

	// Extending the jQuery core:
	$.fn.tzineClock = function(opts){
	
		// "this" contains the elements that were selected when calling the plugin: $('elements').tzineClock();
		// If the selector returned more than one element, use the first one:
		
		var container = this.eq(0);
	
		if(!container)
		{
			try{
				console.log("Invalid selector!");
			} catch(e){}
			
			return false;
		}
		
		if(opts != undefined) gOpts = opts;
		
		var defaults = {
			/* Additional options will be added in future versions of the plugin. */
		};
		
		/* Merging the provided options with the default ones (will be used in future versions of the plugin): */
		$.each(defaults,function(k,v){
			gOpts[k] = gOpts[k] || defaults[k];
		})

		// Calling the setUp function and passing the container,
		// will be available to the setUp function as "this":
		setUp.call(container);
		
		return this;
	}
	
	function setUp()
	{
		for (var i = 0; i < 3; i++)
		{
			var tmp = $('<div>').attr("id", "clock"+i).attr('class',colors[i]+' clock').html(
				'<div class="display"></div>'+
				
				'<div class="rotate left">'+
					'<div class="bg left"></div>'+
				'</div>'+

				'<div class="front right"></div>'+
				
				'<div class="rotate right">'+
					'<div class="bg right"></div>'+
				'</div>'
			);
			
			// Assigning some of the elements as variables for speed:
			tmp.rotateLeft = tmp.find('.rotate.left');
			tmp.rotateRight = tmp.find('.rotate.right');
			tmp.front = tmp.find('.front.right');
			tmp.display = tmp.find('.display');

			$(this).append(tmp);
			
			// Adding the dial as a global variable. Will be available as gVars.colorName
			gVars[colors[i]] = tmp;
		}
		
		// Animate
		$(this).animation(gOpts.timer);
	}
	
	$.fn.animation = function(current)
	{
		var clock = gVars.green;

		// Calculating the current angle:
		var angle = (360/gOpts.timer)*(current);
		if (angle < 45)
		{
			if (currentIndex < 2)
			{
				currentIndex = 2;
				$("#clock0").css("display", "none");
				$("#clock1").css("display", "none");
				$("#clock2").css("display", "block");
			}
			clock = gVars.red;
		}
		else if (angle < 90)
		{
			if (currentIndex < 1)
			{
				currentIndex = 1;
				$("#clock0").css("display", "none");
				$("#clock1").css("display", "block");
				$("#clock2").css("display", "none");
			}
			clock = gVars.orange;
		}
		else
		{
			$("#clock0").css("display", "block");
			$("#clock1").css("display", "none");
			$("#clock2").css("display", "none");
		}
	
		var element;
		if(angle>180)
		{
			angle = angle-180;
			element = clock.rotateLeft;
			clock.rotateRight.hide();
		}
		else
		{
			// The first part of the rotation has completed, so we start rotating the right part:
			clock.rotateRight.show();
			clock.rotateLeft.show();
			clock.front.hide();
			
			rotateElement(clock.rotateRight,180);
			
			element = clock.rotateLeft;
			angle = angle-180;
		}

		rotateElement(element,angle);
		
		// Setting the text inside of the display element, inserting a leading zero if needed:
		clock.display.html(current);
	}
	
	function rotateElement(element,angle)
	{
		// Rotating the element, depending on the browser:
		var rotate = 'rotate('+angle+'deg)';
		
		if(element.css('WebkitTransform')!=undefined)
			element.css('WebkitTransform',rotate);
	}
	
})(jQuery)