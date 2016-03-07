// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for AT @ Univ. Rey Juan Carlos

const BUTTON_UP = 38;
const BUTTON_DOWN = 40;
const BUTTON_RIGHT = 39;
const BUTTON_LEFT = 37;
const numStones = 5;

// Create the canvas
var canvas = document.createElement("canvas");
canvas.innerHTML = "Your browser doesn't support HTML5 canvas";
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
const TOP = 32;
const BOT = canvas.height - 64;
const LEFT = 32;
const RIGHT = canvas.width - 64;
const SAVESPACE = 120;
const RANGETOP = {
	min: TOP,
	max: SAVESPACE
};
const RANGEBOT = {
	min: BOT - SAVESPACE,
	max: BOT
};
const RANGERIGHT = {
	min: RIGHT - SAVESPACE,
	max: RIGHT
};
const RANGELEFT = {
	min: LEFT,
	max: LEFT + SAVESPACE
};
const RANGESX = [RANGETOP, RANGEBOT];
const RANGESY = [RANGERIGHT, RANGELEFT];
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function() {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function() {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// Stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function() {
	stoneReady = true;
};
stoneImage.src = "images/stone.png";

// Green Monster image
var greenMonsterReady = false;
var greenMonsterImage = new Image();
greenMonsterImage.onload = function() {
	greenMonsterReady = true;
};
greenMonsterImage.src = "images/monsterGreen.png";

// Blue Monster image
var blueMonsterReady = false;
var blueMonsterImage = new Image();
blueMonsterImage.onload = function() {
	blueMonsterReady = true;
};
blueMonsterImage.src = "images/monsterBlue.png";

// Tower image
var towerReady = false;
var towerImage = new Image();
towerImage.onload = function() {
	towerReady = true;
};
towerImage.src = "images/tower.png";

// Heart image
var heartReady = false;
var heartImage = new Image();
heartImage.onload = function() {
	heartReady = true;
};
heartImage.src = "images/heart.png";

// Shield image
var shieldReady = false;
var shieldImage = new Image();
shieldImage.onload = function() {
	shieldReady = true;
};
shieldImage.src = "images/shield.png";

// Sword image
var swordReady = false;
var swordImage = new Image();
swordImage.onload = function() {
	swordReady = true;
};
swordImage.src = "images/sword.png";

// Boot image
var bootReady = false;
var bootImage = new Image();
bootImage.onload = function() {
	bootReady = true;
};
bootImage.src = "images/boot.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var princessesSaved = 0;
var stones = [];
var tower = {};
var shield = {};
var sword = {};
var boot = {};
var greenMonsters = [];
var numGreenMonsters;
var blueMonsters = [];
var numBlueMonsters;
var died = false;
var greenMonstersSpeed = 76;
var blueMonstersSpeed = 46;
var level;
var lives = 3;
var numAttacks = 0;
var shieldPicked = false;
var swordPicked = false;
var bootPicked = false;
var onPause = false;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var getDistance = function(element1, element2) {
	return Math.sqrt(Math.pow((element2.x - element1.x), 2) 
					+ Math.pow((element2.y - element1.y), 2));
};

var isTouching = function(first, second) {
	return (first.x <= (second.x + 31)
		&& second.x <= (first.x + 31)
		&& first.y <= (second.y + 31)
		&& second.y <= (first.y + 31));
};

var isStoneNear = function(element) {
	for (var i = 0; i < stones.length; i++) {
		if (getDistance(element, stones[i]) < 32) {
			return true;
		}
	}
	return false;
}

var isNear = function(arr, element) {
	for (var i = 0; i < arr.length; i++) {
		if (element == arr[i]) {
			continue;
		}
		if (isTouching(arr[i], element)) {
			return true;
		}
	}
	return false;
};

var checkStones = function(element) {
	return (isNear(stones, element));
};

var checkMonsters = function(element) {
	return (isNear(greenMonsters, element)
		|| isNear(blueMonsters, element));
}

var checkOverlap = function(element) {
	return (isTouching(hero, element) 
		|| checkStones(element)
		|| checkMonsters(element));
};

var getSign = function() {
	return (Math.random() < 0.5) ? -1 : 1;
};

var getRandPos = function(min, max) {
	return Math.floor(Math.random()*(max - min)) + min;
};

var setCenterPos = function(element) {
	element.x = canvas.width / 2;
	element.y = canvas.height / 2;
};

var setRangePos = function(element) {
	var posX = Math.floor(Math.random() * RANGESX.length);
	var posY = Math.floor(Math.random() * RANGESY.length);
	element.x = getRandPos(RANGESX[posX].min, RANGESX[posX].max);
	element.y = getRandPos(RANGESX[posY].min, RANGESX[posY].max);
}

var setRandPos = function(element) {
	element.x = getRandPos(LEFT,RIGHT);
	element.y = getRandPos(TOP, BOT);
};

// Initialize elements of array
var init = function(arr, size) {
	for (var i = 0; i < size; i++) {
		var element = {};
		arr[i] = element;
	}
};

var saveGame = function() {
	localStorage.setItem("hero", JSON.stringify(hero));
	localStorage.setItem("princess", JSON.stringify(princess));
	localStorage.setItem("princessesSaved", princessesSaved);
	localStorage.setItem("stones", JSON.stringify(stones));
	localStorage.setItem("tower", JSON.stringify(tower));
	localStorage.setItem("shield", JSON.stringify(shield));
	localStorage.setItem("sword", JSON.stringify(sword));
	localStorage.setItem("boot", JSON.stringify(shield));
	localStorage.setItem("greenMonsters", JSON.stringify(greenMonsters));
	localStorage.setItem("numGreenMonsters", numGreenMonsters);
	localStorage.setItem("blueMonsters", JSON.stringify(blueMonsters));
	localStorage.setItem("numBlueMonsters", numBlueMonsters);
	localStorage.setItem("greenMonstersSpeed", greenMonstersSpeed);
	localStorage.setItem("blueMonstersSpeed", blueMonstersSpeed);
	localStorage.setItem("level", level);
	localStorage.setItem("lives", lives);
	localStorage.setItem("numAttacks", numAttacks);
};

var loadGame = function() {
	if (localStorage.getItem("princess")) {
		hero = JSON.parse(localStorage.getItem("hero"));
		princess = JSON.parse(localStorage.getItem("princess"));
		princessesSaved = localStorage.getItem("princessesSaved");
		stones = JSON.parse(localStorage.getItem("stones"));		tower = localStorage.getItem("tower");
		tower = JSON.parse(localStorage.getItem("tower"));
		shield = JSON.parse(localStorage.getItem("shield"));
		sword = JSON.parse(localStorage.getItem("sword"));
		boot = JSON.parse(localStorage.getItem("boot"));
		greenMonsters = JSON.parse(localStorage.getItem("greenMonsters"));
		numGreenMonsters = localStorage.getItem("numGreenMonsters");
		blueMonsters = JSON.parse(localStorage.getItem("blueMonsters"));
		numBlueMonsters = localStorage.getItem("numBlueMonsters");
		greenMonstersSpeed = localStorage.getItem("greenMonstersSpeed");
		blueMonstersSpeed = localStorage.getItem("blueMonstersSpeed");
		level = localStorage.getItem("level");
		lives = localStorage.getItem("lives");
		numAttacks = localStorage.getItem("numAttacks");
	} else {
		reset();
	}
};

// Reset the game when the player catches a princess
var reset = function() {
	shieldPicked = false;
	swordPicked = false;
	bootPicked = false;
	level = princessesSaved / 10  || 1;
	numGreenMonsters = level < 5 ? level : 5;
	numBlueMonsters = level < 3 ? level : 3;
	greenMonstersSpeed = greenMonstersSpeed + level;
	blueMonstersSpeed = blueMonstersSpeed + level;

	init(stones, numStones);
	init(greenMonsters, numGreenMonsters);
	init(blueMonsters, numBlueMonsters);

	setCenterPos(hero);
	setCenterPos(tower);
	// Throw the princess somewhere on the screen randomly
	for (var i in stones) {
		do {
			setRandPos(stones[i]);
		} while (checkOverlap(stones[i]));
	}
	do {
		setRandPos(shield);
	} while (checkOverlap(shield));
	do {
		setRandPos(sword);
	} while (checkOverlap(sword));
	do {
		setRandPos(boot);
	} while (checkOverlap(boot));
	do {
		setRandPos(princess);
	} while (checkOverlap(princess));
	for (var i in greenMonsters) {
		do {
			setRangePos(greenMonsters[i]);
		} while (checkOverlap(greenMonsters[i]));
	}
	for (var i in blueMonsters) {
		do {
			setRangePos(blueMonsters[i]);
		} while (checkOverlap(blueMonsters[i]));
	}
	saveGame();
};

var getPos = function(origin, destiny) {
	destiny.x = origin.x;
	destiny.y = origin.y;
};

var canMoveUp = function(y) {
	return (y > TOP);
};

var canMoveDown = function(y) {
	return (y < BOT);
};

var canMoveRight = function(x) {
	return (x < RIGHT);
};

var canMoveLeft = function(x) {
	return (x > LEFT);
};

var moveMonsterClose = function(monsters, speed, modifier) {
	var aux = {};
	var posBefore = {};
	for (var i in monsters) {
		aux.x = hero.x - monsters[i].x;
		aux.y = hero.y - monsters[i].y;
		getPos(monsters[i], posBefore);
		monsters[i].x = monsters[i].x + Math.sign(aux.x) * speed * modifier;
		monsters[i].y = monsters[i].y + Math.sign(aux.y) * speed * modifier;
		if (isStoneNear(monsters[i])) {
			getPos(posBefore, monsters[i]);
		}
		if (isTouching(hero, monsters[i])) {
			if (numAttacks > 0) {
				monsters.splice(i, 1);
				--numAttacks;
			} else if (lives) {
				--lives;
				reset();
			} else {
				localStorage.removeItem("princess");
				died = true;
			}
		}
	}
}

// Parkinson Party
var moveMonsterRand = function(monsters, speed, modifier) {
	var posBefore = {};
	for (var i in monsters) {
		getPos(monsters[i], posBefore);
		monsters[i].x = monsters[i].x + getSign() * speed * modifier;
		monsters[i].y = monsters[i].y + getSign() * speed * modifier;
		if (isNear(stones, monsters[i])) {
			getPos(posBefore, monsters[i]);
		}
	}
};

var pause = function() {
	onPause ^= true; 
};

// Update game objects
var update = function(modifier) {
	if (died || onPause) {
		return;
	}
	var posBefore = {};
	getPos(hero, posBefore);
	if (BUTTON_UP in keysDown && canMoveUp(hero.y)) { // Player holding up
		hero.y -= hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_DOWN in keysDown && canMoveDown(hero.y)) { // Player holding down
		hero.y += hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_LEFT in keysDown && canMoveLeft(hero.x)) { // Player holding left
		hero.x -= hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_RIGHT in keysDown && canMoveRight(hero.x)) { // Player holding right
		hero.x += hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (isStoneNear(hero)) {
		getPos(posBefore, hero);
	}
	moveMonsterClose(blueMonsters, blueMonstersSpeed, modifier);
	//moveMonsterRand(blueMonsters, blueMonstersSpeed, modifier);

	// Are they touching?
	if (isTouching(hero, shield) && !shieldPicked) {
		++lives;
		shieldPicked = true;
	}
	if (isTouching(hero, sword) && !swordPicked) {
		++numAttacks;
		swordPicked = true;
	}
	if (isTouching(hero, boot) && !bootPicked) {
		hero.speed += 5;
		bootPicked = true;
	}
	if (isTouching(hero, princess)) {
		++princessesSaved;
		reset();
	}
};

// Draw everything
var render = function() {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if (heartReady) {
		if (lives > 3) {
			ctx.drawImage(heartImage, 200, 8);
			ctx.fillText("x " + lives, 200 + 32, 8);
		} else {
			for (var i = 0; i < lives; i++) {
				ctx.drawImage(heartImage, 200 + i * 32, 8);
			}
		}
	}
	if (shieldReady && !shieldPicked) {
		ctx.drawImage(shieldImage, shield.x, shield.y);
	}
	if (swordReady && !swordPicked) {
		
		ctx.drawImage(swordImage, sword.x, sword.y);
	}
	if (bootReady && !bootPicked) {
		ctx.drawImage(bootImage, boot.x, boot.y);
	}
	if (towerReady) {
		ctx.drawImage(towerImage, tower.x, tower.y);
	}
	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}
	if (stoneReady) {
		for (var i in stones) {
			ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
		}
	}
	if (greenMonsterReady) {
		for (var i in greenMonsters) {
			ctx.drawImage(greenMonsterImage, greenMonsters[i].x, greenMonsters[i].y)
		}
	}
	if (blueMonsterReady) {
		for (var i in blueMonsters) {
			ctx.drawImage(blueMonsterImage, blueMonsters[i].x, blueMonsters[i].y)
		}
	}
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Level: " + Math.ceil(level) + "  Lives: ", 32, 12);
	var stage = document.getElementById("stage");
	var heroSpeed = document.getElementById("speed");
	ctx.fillText("Swords: " + numAttacks, 300, 8)
	stage.innerHTML = "Princesses saved: " + princessesSaved;
	heroSpeed.innerHTML = "Hero speed: " + hero.speed;
	if (died) {
		ctx.fillText("Game Over", 200, 200);
	}
};

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if (key == 82) {
		reset();
	} else if (key == 80) {
		pause();
	}
}

// The main game loop
var main = function() {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
console.log("compila");
loadGame();
//reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
