// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(800, 400, Phaser.AUTO, 'gameDiv');
var highscore=0;
// Create our 'main' state that will contain the game
var mainState = {

preload: function() {  
    // Change the background color of the game
    game.stage.backgroundColor = '#71c5cf';

    // Load the bird sprite
    game.load.image('bird', 'assets/patro.png'); 
		game.load.image('pipe', 'assets/weed.png');  
},

create: function() {  
    // Set the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
		var barConfig = {x: 600, y: 30, height:20, width:120};
    this.myHealthBar = new HealthBar(this.game, barConfig);
	 	this.myHealthBar.setPercent(100); 
		this.weedcount=0;
    // Display the bird on the screen
    this.bird = this.game.add.sprite(300, 200, 'bird');

    // Add gravity to the bird to make it fall 
		//this.highscore=0;
		this.score = 0;  
		this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
    // Call the 'jump' function when the spacekey is hit
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);  
		this.weeds = game.add.group(); // Create a group  
		this.weeds.enableBody = true;  // Add physics to the group  
		this.weeds.createMultiple(3, 'pipe'); // Create 20 pipes   
    var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.add(this.startGame, this);

	
},

update: function() {  
		game.physics.arcade.overlap(this.bird, this.weeds, this.incScore, null, this);  
    if (this.bird.inWorld == false)
        this.restartGame();
},

startGame: function(){
		document.getElementById("gameover").innerHTML="";
		game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000; 
		this.timer = game.time.events.loop(2000, this.addOnePipe, this);  
	},
// Make the bird jump 
jump: function() {  
    // Add a vertical velocity to the bird
    this.bird.body.velocity.y = -350;
},

// Restart the game
restartGame: function() {  
    //bmpText = game.add.bitmapText(10, 100, 'carrier_command','Drag me around !',34);
    // Start the 'main' state, which restarts the game	
		this.scoreSave();
		document.getElementById("gameover").innerHTML="Patro is sober. Game over.";		
    game.state.start('main');
},

addOnePipe: function(x, y) {  
		this.weedcount+=1;
		var percentage=100+(this.score-(this.weedcount)*9)*2;
	 	this.myHealthBar.setPercent(percentage);
		var pos = Math.floor(Math.random() * 4) ;
		var weed=this.weeds.getFirstDead();
		weed.reset(750, pos * 80 + 30, 'pipe');
    game.physics.arcade.enable(weed);
    weed.body.velocity.x = -700; 
    weed.checkWorldBounds = true;
    weed.outOfBoundsKill = true;
},

scoreSave: function(){
document.getElementById("score").innerHTML="High Score : "+highscore.toString();
},

incScore: function(){
	this.score+=1;
	this.labelScore.text = this.score;  
	if(this.score>highscore) highscore=this.score;
	var percentage=100+(this.score-(this.weedcount)*9)*2;
	 	this.myHealthBar.setPercent(percentage); 	
	if(percentage<0) this.restartGame();
	},
};


// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  

//Healthbar

var HealthBar = function(game, providedConfig) {
    this.game = game;

    this.setupConfiguration(providedConfig);
    this.setPosition(this.config.x, this.config.y);
    this.drawBackground();
    this.drawHealthBar();
    this.setFixedToCamera(this.config.isFixedToCamera);
};
HealthBar.prototype.constructor = HealthBar;

HealthBar.prototype.setupConfiguration = function (providedConfig) {
    this.config = this.mergeWithDefaultConfiguration(providedConfig);
    this.flipped = this.config.flipped;
};

HealthBar.prototype.mergeWithDefaultConfiguration = function(newConfig) {
    var defaultConfig= {
        width: 250,
        height: 40,
        x: 0,
        y: 0,
        bg: {
            color: '#651828'
        },
        bar: {
            color: '#FEFF03'
        },
        animationDuration: 200,
        flipped: false,
        isFixedToCamera: false
    };

    return mergeObjetcs(defaultConfig, newConfig);
};

function mergeObjetcs(targetObj, newObj) {
    for (var p in newObj) {
        try {
            targetObj[p] = newObj[p].constructor==Object ? mergeObjetcs(targetObj[p], newObj[p]) : newObj[p];
        } catch(e) {
            targetObj[p] = newObj[p];
        }
    }
    return targetObj;
}

HealthBar.prototype.drawBackground = function() {

    var bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bg.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();

    this.bgSprite = this.game.add.sprite(this.x, this.y, bmd);
    this.bgSprite.anchor.set(0.5);

    if(this.flipped){
        this.bgSprite.scale.x = -1;
    }
};

HealthBar.prototype.drawHealthBar = function() {
    var bmd = this.game.add.bitmapData(this.config.width, this.config.height);
    bmd.ctx.fillStyle = this.config.bar.color;
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, this.config.width, this.config.height);
    bmd.ctx.fill();

    this.barSprite = this.game.add.sprite(this.x - this.bgSprite.width/2, this.y, bmd);
    this.barSprite.anchor.y = 0.5;

    if(this.flipped){
        this.barSprite.scale.x = -1;
    }
};

HealthBar.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;

    if(this.bgSprite !== undefined && this.barSprite !== undefined){
        this.bgSprite.position.x = x;
        this.bgSprite.position.y = y;

        this.barSprite.position.x = x - this.config.width/2;
        this.barSprite.position.y = y;
    }
};


HealthBar.prototype.setPercent = function(newValue){
    if(newValue < 0) newValue = 0;
    if(newValue > 100) newValue = 100;

    var newWidth =  (newValue * this.config.width) / 100;

    this.setWidth(newWidth);
};

HealthBar.prototype.setWidth = function(newWidth){
    if(this.flipped) {
        newWidth = -1 * newWidth;
    }
    this.game.add.tween(this.barSprite).to( { width: newWidth }, this.config.animationDuration, Phaser.Easing.Linear.None, true);
};

HealthBar.prototype.setFixedToCamera = function(fixedToCamera) {
    this.bgSprite.fixedToCamera = fixedToCamera;
    this.barSprite.fixedToCamera = fixedToCamera;
};


