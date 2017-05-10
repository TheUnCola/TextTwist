var rack;
var wordBank;
var correctWordsSoFar = [];
var incorrectWordsSoFar = [];
var wordToSubmit = "";
var isPaused = false;
var gameTime = 120; //in seconds
var loadingGame = false;
var loadedGame;

var genericGetRequest = function(URL, callback){
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		if (this.status == 200){
			callback(JSON.parse(this.response));
		}
	};
	xhr.open("GET", URL);
	xhr.send();
};

var showRack = function(JSON){
	document.querySelector('.rack').innerHTML = JSON.rack;
	rack = JSON.rack.split("");
	populateButtons(JSON.rack);
	
	wordBank = JSON.words;

	showWords();
};

var populateButtons = function(rack){
	var bID = "C";
	for (var i = 0; i < 6; i++){
		bID = "C".concat(i);
		var butt = document.getElementById(bID);
		butt.innerHTML = rack.charAt(i); 
		
		butt.addEventListener('click', function(event){
			var target = event.target || event.srcElement;
			letterToSubmit(target);
		});

	}
};

var twistButtons = function() {
	var bID = "C";
	
	// var randPoses = [0,1,2,3,4,5,6];
	// randPoses.sort(function(a, b){return 0.5 - Math.random()});
	
	// https://stackoverflow.com/questions/7070054/javascript-shuffle-html-list-element-order
	// gets rid of spacing for some reason...
	var ul = document.getElementById("rackButtons");
	for (var i = ul.children.length; i >= 0; i--) {
	    setTimeout(function(_ul){
	    	_ul.appendChild(_ul.children[Math.random() * i | 0]);
	    }(ul), 5); // testing to see if it fixes styling
	}
};

/*
* On a rack button press
*	adds that letter to the current word so far and
*	adds that letter to the screen
*	disables that button
*/
var letterToSubmit = function(butt){
	butt.disabled = true;
	wordToSubmit += butt.innerHTML;
	document.getElementById("L" + wordToSubmit.length).value = butt.innerHTML;
};

function getAllInputBoxes() {
	return document.querySelectorAll("[id^='L']");
}

function getAllInputButtons() {
	return document.querySelectorAll("[id^='C']");
}

function resetInputs() {
	var stuff = getAllInputBoxes();
	for(var i = 0; i < stuff.length; i++) {
		var box = stuff[i];
		box.value = "";	
	}
	
	var stuff2 = getAllInputButtons();
	for(var i = 0; i < stuff2.length; i++) {
		stuff2[i].disabled = false;
	}
};

function submitWord(evt) {
	// First, reset all the input things
	resetInputs();
	
	// Prevent from submitting duplicate words
	if( wordToSubmit == "" ||
		correctWordsSoFar.includes(wordToSubmit) ||
		incorrectWordsSoFar.includes(wordToSubmit))
		return;
	
	//
	// Client-side validation
	//
	
	// If the the word is valid
	if(wordBank.includes(wordToSubmit)) {
		correctWordsSoFar.push(wordToSubmit);
		//document.getElementById("correctWords").appendChild(text);
	}
	else {
		incorrectWordsSoFar.push(wordToSubmit);
		//document.getElementById("incorrectWords").appendChild(text);
	}
	wordToSubmit = "";
	showWords();
	
	document.getElementById("score").innerHTML = correctWordsSoFar.length*10 + " / " + wordBank.length*10;
};

function getWordsFound() {
	var wordString = correctWordsSoFar[0];
	for(var i=1;i<correctWordsSoFar.length;i++) {
		wordString = wordString + ":" + correctWordsSoFar[i];
	}
	return wordString;
}

function clearInput() {
	resetInputs();
	wordToSubmit = "";
}

var showWords = function() {
	var wordList = [];
	var foundWords = "<tr>";
	for(var k in wordBank) {
		if(wordBank.hasOwnProperty(k))
			wordList.push(wordBank[k]);
	}
	wordList.sort(function(a,b){
		var len = a.length - b.length;
	    return len ? len : a.localeCompare(b); // Sorts by word length. If the length is equal, then sort them alphabetically
	});
	for(var i = 0; i < wordList.length; i++) {
		if(i % 4 == 0) foundWords = foundWords + "</tr><tr>";
		if(correctWordsSoFar.includes(wordList[i]))
			foundWords = foundWords + "</td><td>" + wordList[i];
		else {
			foundWords = foundWords + "</td><td>";//<!-- " + wordList[i] + " -->";
			for(var j = 0; j < wordList[i].length; j++) {
				foundWords = foundWords + "<img src='pics/box.png' style='width:15px;'/>";
			}
		}
	}
	
	document.getElementById("wordsFound").innerHTML = foundWords;
};


function keyHandler(charCode) {
	// a-z			65-90
	// backspace	8
	// enter		13
	if (65 <= charCode && charCode <= 90) { // a-z
		// find first occurrance (if any in rack) in rack (via the [enabled] buttons)
		let letter = String.fromCharCode(charCode).toUpperCase();
		let buttons = getAllInputButtons();
		for(let i = 0; i < buttons.length; i++) {
			let butt = buttons[i];
			if((butt.innerHTML == letter) && !butt.disabled) {
		    	letterToSubmit(butt);
		    	break; // Done once found
			} // else do nothing
		}
	}
	else if(charCode == 8) { // Backspace
		let letter = wordToSubmit[wordToSubmit.length - 1];
		let boxes = getAllInputBoxes();
		boxes[wordToSubmit.length - 1].value = "";
		
		wordToSubmit = wordToSubmit.substr(0, wordToSubmit.length - 1); // start, length
		
		let buttons = getAllInputButtons();
		for(let i = 0; i < buttons.length; i++) {
			let butt = buttons[i];
			if((butt.innerHTML == letter) && butt.disabled) {
		    	butt.disabled = false;
		    	break; // Done once found
			}
		}
	}
	else if((charCode == 13) && (document.body === document.activeElement)) { // Enter (and the active element is 'nothing'. Otherwise e.g. if you click twist, then enter, it will twist)
		submitWord(undefined);
	}
}

var refresh = function() {
	window.location.reload();
}

var pauseGame = function() {
	if(!isPaused) {
		isPaused = true;
		document.getElementById("pauseContainer").style = "display:block;";
	} else {
		isPaused = false;
		document.getElementById("pauseContainer").style = "display:none;";
	}
};

var saveGame = function() {
	document.getElementById("saveContainer").style = "display:block;";
}

var loadGame = function() {
	document.getElementById("loadContainer").style = "display:block;";
}

function xButton(x) {
	if(x == "l")
		document.getElementById("loadContainer").style = "display:none;";
	else if(x == "s")
		document.getElementById("saveContainer").style = "display:none;";
	else if(x == "p")
		document.getElementById("pauseContainer").style = "display:none;";
}

var xLButton = function() {
	document.getElementById("loadContainer").style = "display:none;";
}
var xPButton = function() {
	document.getElementById("pauseContainer").style = "display:none;";
	pauseGame();
}
var xSButton = function() {
	document.getElementById("saveContainer").style = "display:none;";
}

function endGame() {
	document.getElementById("endContainer").style = "display:block;";
	document.getElementById("endScore").innerHTML = correctWordsSoFar.length*10 + " / " + wordBank.length*10;
}

// init
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("startGame").addEventListener('click', function(evt){
		// Start Menu
		var element = document.getElementById("startContainer");
		var op = 1;  // initial opacity
	    var timer = setInterval(function () {
	        if (op <= 0.1){
	            clearInterval(timer);
	            element.style.display = 'none';
	        }
	        element.style.opacity = op;
	        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
	        op -= op * 0.1;
	    }, 50);
		//
		
		var countdown = document.getElementById("time");
		var sec;
		var gameTimer = setInterval(function () {
	        if (gameTime < 0){
	            clearInterval(gameTimer);
	            endGame();
	        } else if(!isPaused) {
	        	sec = gameTime-Math.floor(gameTime/60)*60;
		        if(sec < 10) sec = "0" + sec;
		        countdown.innerHTML = Math.floor(gameTime/60) + ":" + sec;
		        gameTime-=1;
	        } else if(loadingGame) {
	        	gameTime = parseInt(loadedGame[0]['timeLeft']);
	        	populateButtons(loadedGame[0]['rack']);
	        	for(var i=0;i<wordBank.length;i++) delete wordBank[i];
	        	for(var i=0;i<loadedGame[1].length;i++) {
	        		wordBank[i] = loadedGame[1][i];
	        	}
	        	showWords();
	        	loadingGame = false;
	        	document.getElementById("userLoad").style = "display:none;";
	        }
	    }, 1000);
	    
		evt.target.disabled = true; // added bc this messes things up if pressed twice
		genericGetRequest("server.php", showRack);
		
		document.getElementById("pause").addEventListener('click', pauseGame);
		document.getElementById("xP").addEventListener('click', xPButton);
		document.getElementById("saveGame").addEventListener('click', saveGame);
		document.getElementById("xS").addEventListener('click', xSButton);
		document.getElementById("loadGame").addEventListener('click', loadGame);
		document.getElementById("xL").addEventListener('click', xLButton);
		document.getElementById("clear").addEventListener('click', clearInput);
		document.getElementById("twist").addEventListener('click', twistButtons);
		document.getElementById("submitWord").addEventListener('click', submitWord);
		document.getElementById("newGame").addEventListener('click',refresh);
		document.getElementById("endNewGame").addEventListener('click',refresh);
		
		// window.addEventListener('onkeypress', function(e) {
		window.onkeydown = function(e) {
		    e = e || window.event;
		    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		    keyHandler(charCode);
		// });
		};
		
	},
	{once: true});
});