define(function()
{
	var Dictionnary = function(dictionnary)
	{
		this.dico = [];
		this.realDico = [];
		this.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for (var i = 0; i < dictionnary.length; ++i)
		{
			this.realDico.push(dictionnary[i]);
			var word = this.accentsTidy(dictionnary[i]).toUpperCase();
			this.dico.push(word);
		}
		this.words = [];
	}

	Dictionnary.prototype.pick = function()
	{
		if (this.current != undefined)
		{
			this.words.push(this.current);
		}

		var newWord = this.randomWord();
		while ($.inArray(newWord, this.words) != -1)
		{
			newWord = this.randomWord();
		}
		this.current = newWord;
		console.log(this.current);

		this.speech(newWord[0]);
	};

	Dictionnary.prototype.randomWord = function()
	{
		this.index = Math.floor(Math.random() * this.dico.length)
		var newWord = this.dico[this.index];
		this.realWord = this.realDico[this.index];
		newWord = this.accentsTidy(newWord);
		return newWord.toUpperCase();
	};

	Dictionnary.prototype.accentsTidy = function(s) {
	    var map = [
	        ["\\s", ""],
	        ["[àáâãäå]", "a"],
	        ["æ", "ae"],
	        ["ç", "c"],
	        ["[èéêë]", "e"],
	        ["[ìíîï]", "i"],
	        ["ñ", "n"],
	        ["[òóôõö]", "o"],
	        ["œ", "oe"],
	        ["[ùúûü]", "u"],
	        ["[ýÿ]", "y"]
	    ];
	    for (var i=0; i<map.length; ++i) {
	        s = s.replace(new RegExp(map[i][0], "gi"), function(match) {
				return map[i][1];
	        });
	    }
	    return s;
	};

	Dictionnary.prototype.speech = function(word)
	{
		//console.log(word);
		$.get('speech.php', { word: word }, function(data) {
			//console.log(data);
			audio.setAttribute('src', data);
			audio.load();
			audio.play();
		});
	};

	Dictionnary.prototype.count = function(number)
	{
		audio.setAttribute('src', "sounds/" + number + ".mp3");
		audio.load();
		audio.play();
	};

	return Dictionnary;
});