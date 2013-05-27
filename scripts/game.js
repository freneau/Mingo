define(["device", "requestAnimationFrame", "library", "canvas", "dictionnary", "area"],
	function(device, requestAnimationFrame, library, canvas, Dictionnary, Area) {
	
	var game = {};

	game.init = function(container)
	{
		game.width = 768;
		game.height = 90;
		game.ratio = 1;

		library.preload([
			"logo"
		]);

		if (device.isMobile)
		{
			if (window.innerWidth < game.width)
			{
				canvas.fullWidth = true;
				game.width = window.innerWidth;
				game.height = game.width/8;
			}
		}
		
		game.lastTimestamp = Date.now();
		game.inLobby = 0;
		game.ready = 0;
		game.started = 0;
		game.paused = 0;
		game.ended = 0;
		game.timer = 0;

		requestAnimationFrame.onEachFrame(function () {
			var current = Date.now();
			game.delta = (current - game.lastTimestamp) / 1000;
			game.lastTimestamp = current;
		
			if (library.ready)
			{
				if (game.ready == 0)
				{
					game.searchLobby();
				}

				if (game.ended == 1)
				{
					// nothing
				}
				else if (game.hosted && game.timer == 0)
				{
					game.animateMenu();
				}
				else if (game.paused == 0)
				{
					game.animate();
					game.render();
				}
				else
				{
					game.animatePause();
				}
			}
		});
	};

	game.searchLobby = function()
	{
		game.ready = 1;
		game.players = [];
		game.playerId = "Anonymous" + Math.floor(Math.random() * 10000);

		// TODO : select
		game.language = "fr";
		game.wordLength = 8;

		game.letterScore = [];
		game.wordScore = [];
		game.totalScore = [];

		if (local)
		{
			game.playerName = game.playerId;
			game.joinParty();
			//game.hosted = true;
			//game.startGame();
		}
		else
		{
			Clay.Player.onUserReady( function( response ) {
				game.playerName = response.name;
				//console.log(Clay.Player);
				if (Clay.Player.data != undefined)
				{
					game.playerName = Clay.Player.data.name;
				}
		    	game.joinParty();
			});

			/*if( Clay.Player.loggedIn )
			{
				//game.playerId = Clay.Player.name;
				game.joinParty();
			}
			else
			{*/
				Clay.Player.login( function( response ) {
					// nothing
				}, true );
			//}
		}
	};

	game.createPlayer = function(idPeer, host)
	{
		if (host == undefined || idPeer == game.playerId)
		{
			return;
		}

		var player = {name: idPeer};
		game.players[idPeer] = player;
		if (!local)
		{
			game.players[idPeer] = Clay.Player;
			game.players[idPeer].name = Clay.Player.data.name;
		}
		game.players[idPeer].idPeer = idPeer;
		game.players[idPeer].lastDataTime = Date.now();
	};

	game.displayMenu = function(host)
	{
		if (host == undefined)
		{
			return;
		}

		if (local)
		{
			game.joinLobby(host);
		}
		else
		{
			if ( Clay.Player.loggedIn )
			{
			    game.joinLobby(host);
			}
			else
			{
				Clay.Player.requireLogin( function( response ) {
				    game.joinLobby(host);
				}, true );
			}
		}
	}

	game.joinLobby = function(host)
	{
		game.letters = "        ";
		if (host)
		{
			$("#gameArea").load("menu.html", function()
			{
				$.get("dico_" + game.language + ".txt", function(data)
				{
					game.dictionnary = new Dictionnary(data.split(","), true);
					$("#create").focus();

					$("#create").click(function() {
						if ($("#group").val().length > 0)
						{
							game.name = $("#group").val();
							$("#notready").css("display", "none");
							$("#ready").css("display", "block");

							for (var connId in game.connections)
							{
								var conn = game.connections[connId];
								conn.send({
									ready: true
								});
							}
						}
					});

					$("#launch").click(function() {
						game.startGame();
					});
				});
			});
		}
		else
		{
			$("#gameArea").load("game.html", function()
			{
				$.get("dico_" + game.language + ".txt", function(data)
				{
					game.dictionnary = new Dictionnary(data.split(","), false);

					var container = document.getElementById("letters");
					canvas.init(container, game.width, game.height, game.width, game.height);
					canvas.create(container, "bg");
					window.addEventListener('resize', game.resize, false);
					window.addEventListener('orientationchange', game.resize, false);
					game.renderBg();

					game.areas = [];
					for (var i = 0; i < game.wordLength; i++)
					{
						var area = new Area(i*game.width/game.wordLength, 0, game.width/game.wordLength, game.height);
						game.areas.push(area);
					}
					game.resize();

					game.paused = 0;
				});

				game.input = $("#word");
				game.input.focus();

				var beforeEntry = "";
				$(document).on("keydown", game.input, function(event) {
					if (game.blockCount > 0 || game.timer <= 0)
					{
						return false;
					}
					if (!device.isMobile)
					{
						beforeEntry = game.input.val().toUpperCase();
					}
					else
					{
						var entry = game.input.val();
						game.animEntry(beforeEntry, entry);
						beforeEntry = entry;
					}
				});

				if (!device.isMobile)
				{
					$(document).on("keyup", game.input, function(event) {
						if (game.blockCount > 0)
						{
							return false;
						}
						var entry = game.input.val();
						game.animEntry(beforeEntry, entry);
					});
				}

				$("#form").submit(function(){
					var entry = game.input.val().toUpperCase();
					if (entry.length != game.wordLength)
					{
						return false;
					}
					game.checkWord(entry);
					return false;
				});
			});
			if (game.timer != undefined && game.timer > 0)
			{
				// TODO : wait
				$("#room").html("Game in progress, please wait");
			}
		}

		game.started = 1;
		game.paused = 1;
	};

	game.startGame = function()
	{
		$("#gameArea").load("main.html", function()
		{
			$("#score").load("counter.html", function()
			{
				var container = document.getElementById("letters");
				canvas.init(container, game.width, game.height, game.width, game.height);
				canvas.create(container, "bg");
				window.addEventListener('resize', game.resize, false);
				window.addEventListener('orientationchange', game.resize, false);
				game.renderBg();
				$("#gameDiv").css("display", "block");
				game.resize();

				game.dictionnary.pick();

				game.areas = [];
				for (var i = 0; i < game.wordLength; i++)
				{
					var area = new Area(i*game.width/game.wordLength, 0, game.width/game.wordLength, game.height);
					game.areas.push(area);
				}
				
				game.areas[0].letter = game.dictionnary.current[0];
				game.sendWord(game.dictionnary.current);

				for (var pId in game.players)
				{
					var p = game.players[pId];
					p.play = true;
				}

				for (var connId in game.connections)
				{
					var conn = game.connections[connId];
					conn.send({
						start: true
					});
				}

				game.paused = 0;
				game.timer = 180; // TODO : 180 ?

				$("#fancyClock").tzineClock({timer: game.timer});
				$('#countdown').init();
			});
		});
	};

	game.joinGame = function()
	{
		$("#gameDiv").css("display", "block");
		$("#room").css("display", "none");
	};

	game.animEntry = function(beforeEntry, entry)
	{
		if (entry.length > 0)
		{
			if (game.dictionnary.letters.indexOf(entry[entry.length-1].toUpperCase()) == -1 || entry.length > game.wordLength)
			{
				game.input.val(entry.substring(0, entry.length-1));
			}
		}
		entry = game.input.val().toUpperCase();
		if (beforeEntry != entry)
		{
			if (beforeEntry.length < entry.length)
			{
				// nouveau caractere
				for (var i = 0; i < entry.length; i++)
				{
					var area = game.areas[i];
					if (area.letter == area.blank)
					{
						area.letter = entry[i];
						area.setTextAnimation("appear", 0.5);
					}
				}
			}
			else if (beforeEntry.length > entry.length)
			{
				// suppression d'un caractere
				for (var i = entry.length; i < game.wordLength; i++)
				{
					var area = game.areas[i];
					if (area.letter != area.blank)
					{
						area.setTextAnimation("disappear", 0.5);
					}
				}
			}
		}
	};

	game.checkWord = function(word, player)
	{
		if (game.hosted)
		{
			if ($.inArray(word, game.dictionnary.dico) != -1)
			{
				if (word == game.dictionnary.current)
				{
					for (var i = 0; i < game.wordLength; i++)
					{
						var area = game.areas[i];
						area.letter = word[i];
						area.setBgAnimation("validate", 0.5);
						area.setTextAnimation("appear", 0.5);
					}
					game.wordTimer = 2;
					game.dictionnary.speech(game.dictionnary.realWord);
					game.totalScore.push({word: word, player: player});
					$('#countdown').setScore(game.totalScore.length);
				}
				else
				{
					game.wordScore.push({word: word, player: player});
					var corrects = 0;
					for (var i = 1; i < game.wordLength; i++)
					{
						var area = game.areas[i];
						if (area.bgState == "validate")
						{
							continue;
						}
						if (word[i] == game.dictionnary.current[i])
						{
							area.letter = word[i];
							area.setBgAnimation("validate", 0.5);
							area.setTextAnimation("appear", 0.5);
							corrects++;
						}
						else if (game.dictionnary.current.indexOf(word[i]) != -1)
						{
							area.letter = word[i];
							area.setBgAnimation("wrong", 0.5);
							area.setTextAnimation("appear", 0.5);
						}
					}
					game.letterScore.push({letters: corrects, player: player});
				}
			}
			game.letters = word;
		}
		else
		{
			if ($.inArray(word, game.dictionnary.dico) != -1)
			{
				game.sendEntry(word);
				if (word == game.dictionnary.current)
				{
					game.inputColor = {r: 0, g: 255, b: 0, a: 1};
					for (var i = 0; i < game.wordLength; i++)
					{
						var area = game.areas[i];
						area.setBgAnimation("validate", 1);
					}
					game.blockCount = 1;
				}
				else
				{
					game.inputColor = {r: 255, g: 160, b: 0, a: 1};
					game.blockCount = 1;
					// check des lettres via checkCount mis a 0
					game.checkCount = 0;
				}
			}
			else
			{
				game.inputColor = {r: 255, g: 0, b: 0, a: 1};
				for (var i = 0; i < game.wordLength; i++)
				{
					var area = game.areas[i];
					area.setBgAnimation("error", 0.5);
					game.resetCount = -game.wordLength;
				}
				game.blockCount = 0.5;
			}
			game.letters = word;
			game.input.val("");
		}
	};

	game.resize = function()
	{
		canvas.resize();
		game.posY = -canvas.newHeight/2;
		$("#form").css("top", game.posY + "px");
		$("#form").css("width", (canvas.newWidth) + "px");
		$("#form").css("height", canvas.newHeight + "px");
		$("#word").css("line-height", canvas.newHeight + "px").css("font-size", (canvas.newHeight-4) + "px");
	};

	game.animateMenu = function()
	{
		var count = 0;
		for (var pId in game.players)
		{
			var p = game.players[pId];
			if (pId != game.playerId)
			{
				++count;
			}
		}
		$("#counter").text("Players connected : " + count);
		$("#counter").css("-webkit-animation", "appear 0.5s ease-in backwards");
	};

	game.animatePause = function()
	{
		
	};

	game.animate = function()
	{
		game.sendData();
		for (var pId in game.players)
		{
			var p = game.players[pId];
			if (Date.now() - p.lastDataTime > 5000)
			{
				console.log("Player timed out");
				delete game.players[pId];
				continue;
			}
		}

		if (game.hosted)
		{
			$("#fancyClock").animation(Math.ceil(game.timer));

			if (game.wordTimer != undefined)
			{
				if (game.wordTimer > 0)
				{
					game.wordTimer -= game.delta;
				}
				if (game.wordTimer < 0)
				{
					game.dictionnary.pick();
					game.areas[0].letter = game.dictionnary.current[0];
					game.sendWord(game.dictionnary.current);
					game.wordTimer = 0;
					game.resetCount = 0;
				}
			}

			if (game.resetCount != undefined && game.resetCount < game.wordLength)
			{
				var c = Math.floor(game.resetCount);
				if (c >= 0 && game.letters[c] != " ")
				{
					var area = game.areas[c];
					if (c == 0)
					{
						area.setBgAnimation("resetvalidate", 0.5);
					}
					else
					{
						area.reset(0.5);
					}
					game.letters[c] = " ";
				}
				game.resetCount += game.delta*game.wordLength;
			}

			if (game.timer > 0)
			{
				// vocal countdown
				if (game.timer >= 5 && game.timer - game.delta < 5)
				{
					game.dictionnary.count("5");
				}
				else if (game.timer >= 4 && game.timer - game.delta < 4)
				{
					game.dictionnary.count("4");
				}
				else if (game.timer >= 3 && game.timer - game.delta < 3)
				{
					game.dictionnary.count("3");
				}
				else if (game.timer >= 2 && game.timer - game.delta < 2)
				{
					game.dictionnary.count("2");
				}
				else if (game.timer >= 1 && game.timer - game.delta < 1)
				{
					game.dictionnary.count("1");
				}

				game.timer -= game.delta;
				if (game.timer <= 0)
				{
					game.dictionnary.count("end");
					game.ended = 1;
					game.timer = 0;

					game.showStats();
				}
			}

			if (game.areas != undefined && game.areas.length > 0)
			{
				for (var i = 0; i < game.areas.length; i++)
				{
					var area = game.areas[i];
					area.animate(game.delta);
				}
			}
		}
		else
		{
			if (game.inputColor != undefined)
			{
				if (game.inputColor.a > 0)
				{
					game.inputColor.a -= game.delta;
					$("#word").css("background", "rgba(" + game.inputColor.r + ", " + game.inputColor.g + ", " + game.inputColor.b + ", " + game.inputColor.a + ")");
				}
			}

			if (game.blockCount != undefined && game.blockCount > 0)
			{
				game.blockCount -= game.delta;
			}
			if (game.checkCount != undefined && game.checkCount < game.wordLength)
			{
				var c = Math.floor(game.checkCount);
				if (game.letters[c] != "_")
				{
					var area = game.areas[c];
					if (game.letters[c] == game.dictionnary.current[c])
					{
						area.setBgAnimation("validate", 0.5);
					}
					else if (game.dictionnary.current.indexOf(game.letters[c]) != -1)
					{
						area.setBgAnimation("wrong", 0.5);
					}
					else
					{
						area.setBgAnimation("error", 0.5);
					}
					game.letters[c] = "_";
				}
				game.checkCount += game.delta*game.wordLength/2;
				if (game.checkCount >= game.wordLength)
				{
					game.resetCount = 0;
				}
			}
			if (game.resetCount != undefined && game.resetCount < game.wordLength)
			{
				var c = Math.floor(game.resetCount);
				if (c >= 0 && game.letters[c] != " ")
				{
					var area = game.areas[c];
					area.reset(0.5);
					game.letters[c] = " ";
				}
				game.resetCount += game.delta*game.wordLength;
			}

			if (game.areas != undefined && game.areas.length > 0)
			{
				for (var i = 0; i < game.areas.length; i++)
				{
					var area = game.areas[i];
					area.animate(game.delta);
				}
			}

			$("#word").focus();
		}
	};

	// creation de la partie sous l'id host
	game.createParty = function()
	{
		game.playerId = "host";
		if (!localPeer)
		{
			game.peer = new Peer(game.playerId, {key :"kvhjcf96kcsor"});
		}
		else
		{
			game.peer = new Peer(game.playerId, {host: 'localhost', port: 9000});
		}
		game.connections = []; // liste des peers qui se connecteront
		game.hosted = true;
		console.log("Game created");
		game.createPlayer(game.playerId, true);
		game.displayMenu(true);

		// si la connexion s'effectue
		game.peer.on('connection', function(conn) {
			// ecoute chaque nouvelle connexion distante
			conn.on('open', function() {
				console.log(conn.peer + " has joined the game");
				game.makeConnection(conn);
				conn.send({
					timer: game.timer
				});
			});
		});

		// fermeture propre du peer (sera fait automatiquement dans une version future)
		window.onunload = window.onbeforeunload = function(e) {
		  if (!!game.peer && !game.peer.destroyed) {
		    game.peer.destroy();
		  }
		};
	};

	// si la partie est deja creee on tente de la rejoindre
	game.joinParty = function()
	{
		if (!localPeer)
		{
			game.peer = new Peer(game.playerId, {key :"kvhjcf96kcsor"});
		}
		else
		{
			game.peer = new Peer(game.playerId, {host: '192.168.26.1', port: 9000});
		}
		game.peer.on("open", function(id) {
			// connexion a l'host
			game.conn = game.peer.connect("host");
			game.createPlayer(game.playerId, false);
			game.conn.on('open', function() {
				game.hosted = false;
				console.log("Connected");
				game.displayMenu(false);
				game.makeConnection(game.conn);
			});
			game.conn.on('error', function(error) {
				console.log("Fail");
			});
		});
		game.peer.on("error", function(error) {
			console.log("Unable to etablish connection !");
			game.peer.destroy();
			game.createParty();
		});
		game.connections = [];

		window.onunload = window.onbeforeunload = function(e) {
		  if (!!game.peer && !game.peer.destroyed) {
		    game.peer.destroy();
		  }
		};
	};

	// ajout des ecouteurs
	game.makeConnection = function(conn)
	{
		game.connections[conn.peer] = conn;
		// on check les donnees receptionnees
		conn.on('data', function(data){
			if (game.players[conn.peer] == undefined)
			{
				game.createPlayer(conn.peer, conn.peer == "host");
			}
			else
			{
				game.players[conn.peer].lastDataTime = Date.now();
				game.players[conn.peer].timedOut = false;
			}
			if (data.start && !game.hosted)
			{
				game.joinGame();
			}

			if (game.hosted)
			{
				if (data.entry && game.timer > 0)
				{
					game.checkWord(data.entry, data.player);
				}
			}
			else
			{
				if (data.timer)
				{
					game.timer = data.timer;
				}
				if (data.word)
				{
					game.dictionnary.current = data.word;
					game.resetCount = -game.wordLength;
				}
				if (data.end)
				{
					game.name = data.name;
					game.totalScore = data.end;
					game.wordScore = data.wordScore;
					game.letterScore = data.letterScore;
					game.totalPlayers = data.players;
					game.showStats();
				}
			}
		});
		// lorsqu'un joueur se deconnecte
		conn.on("close", function(){
			delete game.players[conn.peer];
			delete game.connections[conn.peer];
			console.log(conn.peer + " left");
			if (conn.peer == "host")
			{
				// si le createur de la partie s'en va on reset tous les joueurs connectes
				setTimeout(function(){window.location.reload()},5000);
			}
		})
	};

	// envoie des donnees aux joueurs connectes
	game.sendData = function()
	{
		for (var connId in game.connections)
		{
			var conn = game.connections[connId];
			if (game.playerId == "host")
			{
				conn.send({
					peerId: game.playerId,
					player: game.playerName,
					timer: game.timer
					// TODO : ajouter infos manquantes
				});
			}
			else
			{
				conn.send({
					peerId: game.playerId,
					player: game.playerName
					// TODO : ajouter infos manquantes
				});
			}
		}
	};

	game.sendEntry = function(entry)
	{
		for (var connId in game.connections)
		{
			var conn = game.connections[connId];
			conn.send({
				peerId: game.playerId,
				player: game.playerName,
				entry: entry
			});
		}
	};

	game.sendWord = function(word)
	{
		for (var connId in game.connections)
		{
			var conn = game.connections[connId];
			conn.send({
				word: word
			});
		}
	};

	game.sendEnd = function()
	{
		var players = [];
		for (var pId in game.players)
		{
			var p = game.players[pId];
			players.push({name: p.name});
		}
		for (var connId in game.connections)
		{
			var conn = game.connections[connId];
			conn.send({
				name: game.name,
				end: game.totalScore,
				wordScore: game.wordScore,
				letterScore: game.letterScore,
				players: players
			});
		}
	}

	game.renderBg = function()
	{
		canvas.ctxTab["bg"].fillStyle = "white";
		canvas.ctxTab["bg"].fillRect(0, 0, game.width, game.height);
	};

	game.render = function()
	{
		if (canvas.ctxTab.main == undefined)
		{
			return;
		}
		game.ratio = canvas.ratio;

		canvas.ctxTab["temp"].drawImage(canvas.frameTab["bg"], 0, 0);
		for (var i = 0; i < game.areas.length; i++)
		{
			var area = game.areas[i];
			area.render(canvas.ctxTab["temp"]);
		}

		canvas.ctxTab["main"].drawImage(canvas.frameTab["temp"], 0, 0);
	};

	game.showStats = function()
	{
		var scorePerso = {player: game.playerName, letters: 0, words: 0, score: 0};
		var scoreBest = {player: "Toto", letters: 0, words: 0, score: 0};
		var scoreGlobal = {letters: 0, words: 0, score: 0};
		var scores = [];

		// pas beau
		for (var i = 0; i < game.totalScore.length; i++)
		{
			var s = game.totalScore[i];
			if (s.player == undefined)
			{
				continue;
			}
			if (s.player == game.playerName)
			{
				scorePerso.score++;
			}
			if (scores[s.player] == undefined)
			{
				scores[s.player] = {player: s.player, score: 0, words: 0, letters: 0};
			}
			scores[s.player].score++;
		}
		for (var i = 0; i < game.wordScore.length; i++)
		{
			var s = game.wordScore[i];
			if (s.player == undefined)
			{
				continue;
			}
			if (s.player == game.playerName)
			{
				scorePerso.words++;
			}
			if (scores[s.player] == undefined)
			{
				scores[s.player] = {player: s.player, score: 0, words: 0, letters: 0};
			}
			scores[s.player].words++;
		}
		for (var i = 0; i < game.letterScore.length; i++)
		{
			var s = game.letterScore[i];
			if (s.player == undefined)
			{
				continue;
			}
			if (s.player == game.playerName)
			{
				scorePerso.letters++;
			}
			if (scores[s.player] == undefined)
			{
				scores[s.player] = {player: s.player, score: 0, words: 0, letters: 0};
			}
			scores[s.player].letters++;
		}
		scores.sort(function(o1, o2)
		{
			if (o1.score == o2.score && o1.words == o2.words)
			{
				return o2.letters - o1.letters;
			}
			else if (o1.score == o2.score)
			{
				return o2.words - o1.words;
			}
			return o2.score - o1.score;
		});
		for (var sId in scores)
		{
			var s = scores[sId];
			if (scoreBest.score == 0)
			{
				scoreBest = s;
			}
			scoreGlobal.score += s.score;
			scoreGlobal.words += s.words;
			scoreGlobal.letters += s.letters;
		}
		var c = 0;
		//

		if (game.hosted)
		{
			game.sendEnd();
			$("body").load("end.html", function()
			{
				$("#tab1").click(function() {
					$("#googleMap").css("display", "block");
					$("#stats").css("display", "none");
				})
				$("#tab2").click(function() {
					$("#googleMap").css("display", "none");
					$("#stats").css("display", "block");
				})
				if (local)
				{
					$("#googleMap").css("display", "none");
					$("#stats").css("display", "block");
				}

				$("#best .avatar img").attr("src", "https://graph.facebook.com/" + scoreBest.player.replace(/\s/g, ".") + "/picture");
				var text = "Best score : <b>" + scoreBest.player + "</b> with " + scoreBest.score + " correct word" + (scoreBest.score > 1 ? "s" : "")
					+ ", " + scoreBest.words + " wrong word" + (scoreBest.words > 1 ? "s" : "")
					+ " and " + scoreBest.letters + " letter" + (scoreBest.letters > 1 ? "s" : "") + " found";
				$("#best .info").html(text);

				var imgPerso = $('<img width="50">'); // equivalent a $(document.createElement('img'))
				imgPerso.attr('src', "https://graph.facebook.com/" + scorePerso.player.replace(/\s/g, ".") + "/picture");
				$("#global .avatar").append(imgPerso);
				for (var sId in game.players)
				{
					var s = game.players[sId];
					var img = $('<img width="50">'); // equivalent a $(document.createElement('img'))
					img.attr('src', "https://graph.facebook.com/" + s.name.replace(/\s/g, ".") + "/picture");
					$("#global .avatar").append(img);
					c++;
				}
				text = "Global score : " + scoreGlobal.score + " correct word" + (scoreGlobal.score > 1 ? "s" : "")
					+ ", " + scoreGlobal.words + " wrong word" + (scoreGlobal.words > 1 ? "s" : "")
					+ " and " + scoreGlobal.letters + " letter" + (scoreGlobal.letters > 1 ? "s" : "") + " found";
				$("#global .info").html(text);

				if (navigator.geolocation)
				{
					navigator.geolocation.getCurrentPosition(game.showPosition);
				}

				$("#social").html(
					'<a href="http://twitter.com/share?url="http://www.florianreneau.com/meetup"&amp;via='+game.playerName+'&amp;count=horizontal'
						+'" data-text="#'+game.name+' : '+scoreGlobal.score+' mots trouvés avec '+c+' personnes, qui dit mieux ?" class="twitter-share-button" rel="nofollow">Tweet</a>'
				);
				!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
			});
		}
		else
		{
			$("body").load("endPlayer.html", function()
			{
				$("#stats").css("display", "block");
				$("#perso .avatar img").attr("src", "https://graph.facebook.com/" + scorePerso.player.replace(/\s/g, ".") + "/picture");
				var text = "Your score : <b>" + scorePerso.score + " correct word" + (scorePerso.score > 1 ? "s" : "")
					+ ", " + scorePerso.words + " wrong word" + (scorePerso.words > 1 ? "s" : "")
					+ " and " + scorePerso.letters + " letter" + (scorePerso.letters > 1 ? "s" : "") + " found";
				$("#perso .info").html(text);

				$("#best .avatar img").attr("src", "https://graph.facebook.com/" + scoreBest.player.replace(/\s/g, ".") + "/picture");
				text = "Best score : <b>" + scoreBest.player + "</b> with " + scoreBest.score + " correct word" + (scoreBest.score > 1 ? "s" : "")
					+ ", " + scoreBest.words + " wrong word" + (scoreBest.words > 1 ? "s" : "")
					+ " and " + scoreBest.letters + " letter" + (scoreBest.letters > 1 ? "s" : "") + " found";
				$("#best .info").html(text);

				var imgPerso = $('<img width="50">'); // equivalent a $(document.createElement('img'))
				imgPerso.attr('src', "https://graph.facebook.com/" + scorePerso.player.replace(/\s/g, ".") + "/picture");
				$("#global .avatar").append(imgPerso);
				for (var i = 0; i < game.totalPlayers.length; i++)
				{
					var p = game.totalPlayers[i];
					var img = $('<img width="50">'); // equivalent a $(document.createElement('img'))
					img.attr('src', "https://graph.facebook.com/" + p.name.replace(/\s/g, ".") + "/picture");
					$("#global .avatar").append(img);
				}
				text = "Global score : " + scoreGlobal.score + " correct word" + (scoreGlobal.score > 1 ? "s" : "")
					+ ", " + scoreGlobal.words + " wrong word" + (scoreGlobal.words > 1 ? "s" : "")
					+ " and " + scoreGlobal.letters + " letter" + (scoreGlobal.letters > 1 ? "s" : "") + " found";
				$("#global .info").html(text);

				$("#social").html(
					'<a href="http://twitter.com/share?url="http://www.florianreneau.com/meetup"&amp;via='+game.playerName+'&amp;count=horizontal'
						+'" data-text="#'+game.name+' : '+scoreGlobal.score+' mots trouvés avec '+c+' personnes, qui dit mieux ?" class="twitter-share-button" rel="nofollow">Tweet</a>'
				);
				!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
			});
		}
	};

	game.showPosition = function(position)
	{
		$("#googleMap").css("height", window.innerHeight + "px");
		var mapProp = {
			center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		game.map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

		var c = 0;
		for (var p in game.players)
		{
			c++;
		}
		var result = {
			score: game.totalScore.length,
			name: game.name + "@" + c + "#" + position.coords.latitude + ";" + position.coords.longitude
		};
		console.log(result);
		game.addMarker(result, true);
		if (!local)
		{
			var myCallback = function( results )
			{
			    for (var i = 0; i < results.length; i++)
				{
					var r = results[i];
					if (r.name != result.name)
					{
						game.addMarker(r, false);
					}
				}
			    //console.log( results );
			};
			window.leaderboard.fetch( {}, myCallback );
			
			window.leaderboard.post( { score: result.score, name: result.name, hideUI: true }, function(response) {
				console.log("Score saved");
			} );
			
		}
	}

	game.addMarker = function(result, animation)
	{
		if (result.name == undefined)
		{
			return;
		}
		var name = result.name.substring(0, result.name.indexOf('@'));
		var players = result.name.substring(result.name.indexOf('@') + 1, result.name.indexOf('#'));
		var pos = result.name.substring(result.name.indexOf('#') + 1).split(';');
		var title = "<b>" + name + "</b> : " + result.score + " correct words<br />found by " + players + " player" + (players > 1 ? "s" : "") + " !";

		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pos[0], pos[1]),
			title: title,
			icon: "image/logo.png",
			animation: animation ? google.maps.Animation.BOUNCE : ""
		});
		var infowindow = new google.maps.InfoWindow({
			content: title
		});
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(game.map, marker);
		});
		marker.setMap(game.map);
	};

	return game;
});