var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var rules = null;
var accessCode = null;
var background = null;
var backgrounds = ['winter', 'moon', 'forest', 'desert', 'sky'];
var sounds = ["boing", "spring", "twang", "slidewhistle", "pop", "splat", "welldone", "random"];
var player = null;
var scene = null;
var map = null;
var score = 0;
var scoreText;
var tipText;
var gameOver = null;
var socket = null;
this.tips = [
    {
        prompt: "When the game starts the player needs to move forward.  Say, 'Alexa, ask Voice Coder to add rule, when start, move forward'.",
        event: "start",
        action: "move forward",
        order: 0
    },
    {
        prompt: "On tap, the player should fly up.  Say, 'Alexa, ask Voice Coder to add rule, on tap, flap'.",
        event: "tap",
        action: "flap",
        order: 1
    },
    {
        prompt: `Try adding a rule, when the player hits a star, then add points.  Say, 'add rule, when hit star, add points'.  `,
        event: "hit star",
        action: "add points",
        order: 2
    },
    {
        prompt: `Try adding a rule, when the player hits a star, then play a sound.  Say, 'add rule, when hit star, play sound, ping'.  `,
        event: "hit star",
        action: "play sound",
        order: 2
    },
    {
        prompt: `Try adding a rule, when the player hits a box, then crash.  Say, 'add rule, when hit box, crash'.  `,
        event: "hit box",
        action: "crash",
        order: 2
    },
    {
        prompt: `Try changing the background.  Say, 'add rule, when start, set background'.  `,
        event: "start",
        action: "set background",
        order: 2
    },

    {
        prompt: `Try adding a rule, when the player hits a box, then play a sound.  Say, 'add rule, when hit box, play sound'.  `,
        event: "hit box",
        action: "play sound",
        order: 2
    },
    {
        prompt: `Try adding a silly rule.  Say, 'add rule, on tap, flip gravity'.  `,
        event: "tap",
        action: "flip gravity",
        order: 2
    },
    {
        prompt: `You can clear your current game and start fresh by saying, 'Create new game'.  `,
        event: null,
        action: null,
        order: 2
    },
    {
        prompt: `Try adding a silly rule.  Say, 'add rule, when tap, set background to random'.  `,
        event: "tap",
        action: "set background",
        order: 2
    },
    {
        prompt: `To add another rule, say "Add Rule".  You can always ask me for help.  `,
        event: null,
        action: null,
        order: 2
    }
];



var socketUrl = 'ws://' + window.location.hostname;
if (window.location.protocol === "https:") {
    socketUrl = 'wss://' + window.location.hostname;
}

function setUpSocket(id) {
    if (socket) return;

    socket = new WebSocket(socketUrl);
    socket.onopen = function (e) {
        socket.send("setId:" + id);
    };
    socket.onmessage = function (e) { onSocketMessage(e.data); };
    socket.onerror = function (e) { console.log("Socket Error: " + e); };
}
function onSocketMessage(data) {
    var command = null;
    var value = null;
    if (typeof data === "string") {
        //split cmd and value
        if (data.indexOf(":") > -1) {
            command = data.split(":")[0];
            value = data.substring(data.indexOf(":") + 1);
            //try to phase json
            try {
                value = JSON.parse(value);
            } catch (e) { }
        } else {
            command = data;
        }
    }
    if (command === "Restart") {
        window.location.reload();
    }
    if (command === "Update") {
        updateLogic(value);
    }
    if (command === "Data") {
        //todo: load data and soft restart game.  run onStart 
    }
    if (command === "Exec") {
        //exec action
        execCommand(value.action, value.value);
    }
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
function preload() {

    var urlVars = getUrlVars();

    // this.load.setBaseURL('http://labs.phaser.io');

    accessCode = "QB31";
    if (urlVars && urlVars["id"]) {
        accessCode = urlVars["id"];
    }

    setUpSocket(accessCode);

    var rand = Math.floor(Math.random() * 100000000000);
    this.load.json('data', 'data/' + accessCode + '?random=' + rand);


    this.load.audioSprite('sfx', 'Audio/Sounds.json', [
        'Audio/Sounds.ogg',
        'Audio/Sounds.mp3'
    ]);


    // this.load.audioSprite('sfx', 'Audio/fx_mixdown.json', [
    //     'Audio/fx_mixdown.ogg',
    //     'Audio/fx_mixdown.mp3'
    // ]);

    // this.load.audio('bong', 'Audio/whoop.wav');


    //sources
    //https://www.gameart2d.com/winter-platformer-game-tileset.html

    //buttons
    this.load.image('refresh', 'Images/Buttons/refresh.png');



    //backgrounds
    this.load.image('sky', 'Images/BG/Sky.png');
    this.load.image('winter', 'Images/BG/Winter.png');
    this.load.image('moon', 'Images/BG/Grave.png');
    this.load.image('forest', 'Images/BG/Forest.png');
    this.load.image('desert', 'Images/BG/Desert.png');

    //dialogs
    this.load.image('StartDialog', 'Images/Dialogs/StartDialog.png');
    this.load.image('GameOver', 'Images/Dialogs/GameOver.png');
    this.load.image('WinDialog', 'Images/Dialogs/WinDialog.png');


    //player
    this.load.image('Fly', 'Images/Player/Fly.png');
    this.load.image('Dead', 'Images/Player/Dead.png');

    //Obstacle
    this.load.image('Crate', 'Images/Obstacle/Crate.png');
    this.load.image('Star', 'Images/Obstacle/Star.png');


    // //tiles
    // // tiles in spritesheet 
    // this.load.spritesheet('tiles', 'Images/Tiles/platform.png', { frameWidth: 64, frameHeight: 64 });

    // // map made with Tiled in JSON format
    // this.load.tilemapTiledJSON('map', 'Images/Tiles/map1.json');


}

function create() {
    //api docs https://photonstorm.github.io/phaser3-docs
    scene = this;
    var gameWidth = 21000;
    this.cameras.main.setBounds(0, 0, gameWidth, 600);
    this.physics.world.setBounds(0, 0, gameWidth, 600);
    // this.physics.world.gravity.y = 500;
    scene.physics.world.gravity.y = 0;


    // background = this.add.image(400, 300, 'sky');
    background = this.add.tileSprite(gameWidth / 2, 300, gameWidth, 600, 'winter');
    background1 = this.add.image(250, 300, 'Fly');
    obstacles = this.physics.add.staticGroup();

    stars = this.physics.add.staticGroup();


    createPipes(stars, obstacles);


    player = this.physics.add.image(400, 100, 'Fly');
    player.displayWidth = 100;
    player.displayHeight = 75;
    player.setBounce(1, 0.0);
    player.setCollideWorldBounds(true);

    //this.physics.add.collider(groundLayer, player);
    // this.physics.add.collider(obstacles, player);

    scoreText = this.add.text(5, 5, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
    scoreText.setScrollFactor(0);


    accesscodeText = this.add.text(500, 5, accessCode, { fontSize: '32px', fill: '#ffffff' });
    accesscodeText.setScrollFactor(0);







    startScreen = this.add.image(300, 300, 'StartDialog');
    startScreen.setScrollFactor(0);
    startScreen.setInteractive();
    startScreen.on('pointerdown', function () {
        start();
        startScreen.visible = false;

    });

    winScreen = this.add.image(300, 300, 'WinDialog');
    winScreen.setScrollFactor(0);
    winScreen.setInteractive();
    winScreen.on('pointerdown', function () {
        scene.scene.restart();
    });
    winScreen.visible = false;


    gameOverScreen = this.add.image(300, 300, 'GameOver');
    gameOverScreen.setScrollFactor(0);
    gameOverScreen.setInteractive();
    gameOverScreen.on('pointerdown', function () {
        scene.scene.restart();
    });
    gameOverScreen.visible = false;

    refreshBtn = this.add.image(570, 570, 'refresh');
    refreshBtn.setScrollFactor(0);
    refreshBtn.setInteractive();
    refreshBtn.on('pointerdown', function () {
        scene.scene.restart();
    });

    this.cameras.main.startFollow(player, true, 1, 1, -200, 0);



    var data = this.cache.json.get('data');
    if (data && !rules) {
        rules = data.rules;
    }

    // var defaultTip = 'To add more rules, say,"Alexa open Voice Coder".';
    // tipText = this.add.text(5, 570, defaultTip,
    //     {
    //         fontSize: '14px',
    //         fill: '#ffffff',
    //         align: 'center',
    //         wordWrap: { width: 600, useAdvancedWrap: true }
    //     }
    // );
    // tipText.setScrollFactor(0);


    //update tip
    setTip();
    //update rules
    setRules();

    //Event Hit Star
    //all events ["Start", "Tap", "Hit Obstacle", "Hit Ground", "Pass Star"];

    //Event Hit Obstacle
    // this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
    this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
    //Event Hit Star
    this.physics.add.overlap(player, stars, hitStar, null, this);
    //Event Tap
    this.input.on('pointerdown', pointerdown);
    //Event Start




    // this.load.once('complete',  function (){
    //     loaded();
    // }, this);
    // this.load.once('loadError', function (){
    //     loaded();    
    //  }, this);
    // var rand = Math.floor(Math.random() * 100000000000);  
    // this.load.json('data', id+'.json?random='+rand);
}
function update() {
    // cloud1.tilePositionX += 0.5;
    //if(player.body.touching.down){
    //var i = player.body.touching.down;

    //Event "Hit Ground"
    if (player.y > 550) {
        if (!player.isTouchingGround) {
            processEvent("hit ground");
            player.isTouchingGround = true;
            if (player.isDead) {
                lose();
            }
        }
    } else {
        player.isTouchingGround = false;
    }
    //check for hit top
    if (player.y <= 40) {
        if (!player.isTouchingTop) {
            processEvent("hit top");
            player.isTouchingTop = true;
            if (player.isDead && !gameOver) {
                lose();
            }
        }
    } else {
        player.isTouchingTop = false;
    }

    //check for hit top or bot for end
    if (player.y <= 40 || player.y > 550) {
        if (player.isDead && !gameOver) {
            lose();
        }
    }

    if (player.x > scene.physics.world.bounds.width - 300) {
        if (!gameOver) {
            win();
        }
    }

}
function updateLogic(data) {
    if (data) {
        //update rules
        rules = data.rules;

        //trigger start
        if (gameOver === true || player.isDead === true) {
            scene.scene.restart();
        } else {
            //soft start event for in game live update
             //update tip
            setTip();
            setRules();
            processEvent("start");
        }
    }
}
function createPipes(stars, obstacles) {
    var offset = 600;
    for (var i = 1; i < 30; i++) {
        var x = (i * 650) + offset;
        createPipe(x, stars, obstacles);
    }
}
function createPipe(x, stars, obstacles) {
    var rand = 1 + Math.floor(Math.random() * 5);
    for (var i = 0; i < 7; i++) {
        var y = i * 100;
        if (i == rand) {
            stars.create(x, y, 'Star');
        } else if (i == rand - 1) {
            stars.create(x, y, 'Star');
        }
        else {
            obstacles.create(x, y, 'Crate');
        }
    }
}
//events
function loaded() {

}
function start() {

    //reset all 
    score = 0;
    scoreText.setText("Score: " + score);
    player.angle = 0;
    player.setVelocity(200, 0);
    scene.physics.world.gravity.y = 500;
    player.isDead = false;
    gameOver = false;
    //update tip
    setTip();
    setRules();
    processEvent("start");
}
function pointerdown(pointer) {
    processEvent("tap");
};
function hitObstacle(player, obstacle) {
    //todo: fix to not retrigger when alternating between 2.
    //todo: could try if alive - player.canFlap== true;
    //add to list or recent objects hit
    if (!obstacle.hasBeenhit && !player.isDead) {
        processEvent("hit box");
        obstacle.hasBeenhit = true;
    }
}
function hitStar(player, star) {
    star.disableBody(true, true);
    processEvent("hit star");
}
function win() {
    gameOver = true;
    player.setVelocity(0, 0);
    scene.physics.world.gravity.y = 0;
    winScreen.visible = true;
    processEvent("win");
}
function lose() {
    gameOver = true;
    gameOverScreen.visible = true;
    processEvent("lose");
}
//actions
function processEvent(event) {
    console.log("Event:" + event);
    if (!rules) return;

    var filteredRules = rules.filter(rule => rule.event === event);
    for (i = 0; i < filteredRules.length; i++) {
        var rule = filteredRules[i];
        var action = rule.action;
        var value = rule.value;

        execCommand(action, value);
    }

}
function execCommand(action, value) {


    //this.actions = ["Play Sound", "Flap", "Explode", "Set Background", "Win", "Lose"];

    if (action === "move forward") {
        moveForward(value);
    }
    //do action   
    if (action === "set background") {
        SetBackground(value);
    }
    if (action === "set gravity") {
        SetGravity(value);
    }
    if (action === "flip gravity") {
        flipGravity();
    }
    //do action   
    if (action === "crash") {
        crash();
    }
    //do action   
    if (action === "play sound") {
        playSound(value);
    }
    //do action   
    if (action === "flap") {
        flap(value);
    }
    //do action   
    if (action === "add points") {
        AddPoints(value);
    }

}

function AddPoints(value) {
    if (!value) return;
    value = value.replace(/,/g, "");
    score += parseInt(value) || 1;
    scoreText.setText("Score: " + score);
}
function moveForward(value) {
    var strength = 200;
    if (value === "super fast")
        strength = 500;
    if (value === "fast")
        strength = 300;
    if (value === "medium")
        strength = 200;
    if (value === "slow")
        strength = 150;

    player.setVelocity(strength, 0);
}
function flap(value) {
    var strength = -300;
    if (value === "large")
        strength = -600;
    if (value === "medium")
        strength = -300;
    if (value === "small")
        strength = -150;
    var gravityValue = scene.physics.world.gravity.y;
    strength = strength * Math.sign(gravityValue);
    if (!player.isDead)
        player.setVelocityY(strength);
}
function crash() {
    player.setTexture('Dead');
    player.angle = 90;
    player.setVelocity(0, 0);
    player.isDead = true;
}

function SetBackground(value) {
    if (value === "random") {
        var randBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        background.setTexture(randBackground);
    }
    else {
        background.setTexture(value);
    }
}
function SetGravity(value) {
    var gravityValue = 500;
    if (value === "large")
        gravityValue = 1000;
    if (value === "medium")
        gravityValue = 500;
    if (value === "small")
        gravityValue = 200;
    if (value === "reverse")
        gravityValue = -500;

    // scene could be this
    scene.physics.world.gravity.y = gravityValue;
}
function flipGravity() {

    player.setVelocityY(0);
    scene.physics.world.gravity.y *= -1;
}

function playSound(value) {

    if (value === "random") {
        var randSound = sounds[Math.floor(Math.random() * sounds.length)];
        game.sound.playAudioSprite('sfx', randSound);
    } else {
        if (value === "slide whistle")
            value = "slidewhistle";
        if (value === "well done")
            value = "welldone";
        if (sounds.indexOf(value) == -1)
            value = "pop";
        game.sound.playAudioSprite('sfx', value);
    }
}
function setTip() {
    if (!rules) rules = [];
    var tip = getTip(rules, tips);
    var tipElement = document.getElementById("tip");
    if (tipElement)
        tipElement.innerHTML = tip;
}
function setRules() {
    if (!rules) rules = [];
    var rulesElement = document.getElementById("rules");
    var rulesList = rules;
    if (rulesElement) {
        if (rulesList.length > 0) rulesElement.innerHTML = "";
        for (var i = 0; i < rulesList.length; i++) {
            var rule = rulesList[i];
            rulesElement.innerHTML += "<li>On <b>" + rule.event + "</b>, then <b>" + rule.action + "</b>  " + rule.value + "</li>";
        }
    }
}
function getTip(rules, allTips) {
    if (!rules) rules = [];
    //default tip
    let output = `To add another rule, say "Add Rule".  You can always ask me for help`;
    let tipsNotDone = allTips.filter(function (tip) {
        let ruleFound = rules.find(function (rule) {
            if (tip.event && tip.event !== rule.event) {
                return false;
            }
            if (tip.action && tip.action !== rule.action) {
                return false;
            }
            if (!tip.event && !tip.action) {
                return false;
            }
            return true;
        });
        let noMatch = !ruleFound;
        return noMatch; //return tips with no matching rule
    });
    // get lowest order possible
    let allOrders = tipsNotDone.map(function (tip) {
        return tip.order;
    });
    let lowestOrder = allOrders.reduce(function (prev, curr) {
        return prev < curr ? prev : curr;
    });
    //all with order number
    const tips = tipsNotDone.filter(tip => tip.order === lowestOrder);
    if (tips.length > 0) {
        let tip = tips[Math.floor(Math.random() * tips.length)];
        output = tip.prompt;
    }
    return output;
}
