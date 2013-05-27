define(function() {
	
	var Area = function(x, y, width, height)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.bgState = "idle";
		this.bgTime = 0;
		this.bgTimeTotal = 0;
		this.textState = "idle";
		this.textTime = 0;
		this.blank = " ";
		this.letter = this.blank;
	};

	Area.prototype.reset = function(duration)
	{
		if (this.bgTime == 0)
		{
			this.setBgAnimation("reset" + this.bgState, duration);
			this.setTextAnimation("disappear", duration);
		}
	};

	Area.prototype.setTextAnimation = function(animation, duration)
	{
		this.textState = animation;
		if (this.textTime == 0)
		{
			this.textTime = duration;
		}
	};

	Area.prototype.setBgAnimation = function(animation, duration)
	{
		this.bgState = animation;
		this.bgTimeTotal = duration;
		if (this.bgTime == 0)
		{
			this.bgTime = duration;
		}
	}

	Area.prototype.animate = function(delta)
	{
		if (this.bgTime > 0)
		{
			this.bgTime -= delta;
			if (this.bgTime <= 0)
			{
				this.bgTime = 0;
				if (this.bgState == "resetvalidate" || this.bgState == "resetwrong" || this.bgState == "reseterror")
				{
					this.bgState = "idle";
				}
			}
		}

		if (this.textTime > 0)
		{
			this.textTime -= delta;
			if (this.textTime <= 0)
			{
				this.textTime = 0;
				if (this.textState == "disappear")
				{
					this.letter = this.blank;
				}
			}
		}
	};

	Area.prototype.render = function(ctx)
	{
		if (this.idleGradient == undefined)
		{
			this.idleGradient = ctx.createLinearGradient(0, 0, 0, this.height);
			this.idleGradient.addColorStop(0, "#0080FF");
			this.idleGradient.addColorStop(1, "#0040FF");

			this.validGradient = ctx.createLinearGradient(0, 0, 0, this.height);
			this.validGradient.addColorStop(0, "#00FF80");
			this.validGradient.addColorStop(1, "#00FF40");

			this.wrongGradient = ctx.createLinearGradient(0, 0, 0, this.height);
			this.wrongGradient.addColorStop(0, "#FFE000");
			this.wrongGradient.addColorStop(1, "#FFA000");

			this.errorGradient = ctx.createLinearGradient(0, 0, 0, this.height);
			this.errorGradient.addColorStop(0, "#FF8080");
			this.errorGradient.addColorStop(1, "#FF4040");
		}

		switch (this.bgState)
		{
			case "idle":
				this.drawIdle(ctx);
			break;

			case "validate":
				this.drawIdle(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawValid(ctx);
				ctx.restore();
			break;

			case "resetvalidate":
				this.drawValid(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawIdle(ctx);
				ctx.restore();
			break;

			case "error":
				this.drawIdle(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawError(ctx);
				ctx.restore();
			break;

			case "reseterror":
				this.drawError(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawIdle(ctx);
				ctx.restore();
			break;

			case "wrong":
				this.drawIdle(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawWrong(ctx);
				ctx.restore();
			break;

			case "resetwrong":
				this.drawWrong(ctx);
				ctx.save();
				ctx.globalAlpha = 1 - (this.bgTime / this.bgTimeTotal);
				this.drawIdle(ctx);
				ctx.restore();
			break;
		}

		var width = ctx.measureText(this.letter).width;
		ctx.font = this.width + "px Verdana";
		ctx.fillStyle = "white";
		ctx.shadowBlur = 20;
		ctx.shadowColor = "black";
		var posY = this.y + this.height - this.height/8;
		switch (this.textState)
		{
			case "idle":
				ctx.fillText(this.letter, this.x + this.width/2 - width/2, posY);
			break;

			case "appear":
				ctx.save();
				var decal = 1 - this.textTime*2;
				ctx.translate(this.x + this.width/2 - (width/2)*decal, posY);
				ctx.scale(decal, decal);
				ctx.fillText(this.letter, 0, 0);
				ctx.restore();
			break;

			case "disappear":
				ctx.save();
				var decal = this.textTime*2;
				ctx.translate(this.x + this.width/2 - (width/2)*decal, posY);
				ctx.scale(decal, decal);
				ctx.fillText(this.letter, 0, 0);
				ctx.restore();
			break;
		}
		ctx.shadowBlur = 0;
	};

	Area.prototype.drawIdle = function(ctx)
	{
		ctx.fillStyle = this.idleGradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeStyle = "#00C0FF";
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x+1, this.y+1, this.width-2, this.height-2);
	};

	Area.prototype.drawValid = function(ctx)
	{
		ctx.fillStyle = this.validGradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeStyle = "#00FFC0";
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x+1, this.y+1, this.width-2, this.height-2);
	};

	Area.prototype.drawError = function(ctx)
	{
		ctx.fillStyle = this.errorGradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeStyle = "#FFC0C0";
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x+1, this.y+1, this.width-2, this.height-2);
	};

	Area.prototype.drawWrong = function(ctx)
	{
		ctx.fillStyle = this.wrongGradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeStyle = "FFA000";
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x+1, this.y+1, this.width-2, this.height-2);
	};

	return Area;
});