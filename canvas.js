var gamepadAPI = {
  controller: {},
  turbo: false,
  connect: function(evt) {
    gamepadAPI.controller = evt.gamepad;
    gamepadAPI.turbo = true;
    console.log('Gamepad connected.');
  },
  disconnect: function(evt) {
    gamepadAPI.turbo = false;
    delete gamepadAPI.controller;
    console.log('Gamepad disconnected.');
  },
  update: function() {
    // clear the buttons cache
    gamepadAPI.buttonsCache = [];
    // move the buttons status from the previous frame to the cache
    for(var k=0; k<gamepadAPI.buttonsStatus.length; k++) {
      gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    }
    // clear the buttons status
    gamepadAPI.buttonsStatus = [];
    // get the gamepad object
    var c = gamepadAPI.controller || {};
  
    // loop through buttons and push the pressed ones to the array
    var pressed = [];
    if(c.buttons) {
      for(var b=0,t=c.buttons.length; b<t; b++) {
        if(c.buttons[b].pressed) {
          pressed.push(gamepadAPI.buttons[b]);
        }
      }
    }
    // loop through axes and push their values to the array
    var axes = [];
    if(c.axes) {
      for(var a=0,x=c.axes.length; a<x; a++) {
        axes.push(c.axes[a].toFixed(2));
      }
    }
    // assign received values
    gamepadAPI.axesStatus = axes;
    gamepadAPI.buttonsStatus = pressed;
    // return buttons for debugging purposes
    return pressed;
  },
  buttonPressed: function(button, hold) {
    var newPress = false;
    // loop through pressed buttons
    for(var i=0,s=gamepadAPI.buttonsStatus.length; i<s; i++) {
      // if we found the button we're looking for...
      if(gamepadAPI.buttonsStatus[i] == button) {
        // set the boolean variable to true
        newPress = true;
        // if we want to check the single press
        if(!hold) {
          // loop through the cached states from the previous frame
          for(var j=0,p=gamepadAPI.buttonsCache.length; j<p; j++) {
            // if the button was already pressed, ignore new press
            if(gamepadAPI.buttonsCache[j] == button) {
              newPress = false;
            }
          }
        }
      }
    }
    return newPress;
  },
  buttons: [
    'DPad-Up','DPad-Down','DPad-Left','DPad-Right',
    'Start','Back','Axis-Left','Axis-Right',
    'LB','RB','Power','A','B','X','Y',
  ],
  buttonsCache: [],
  buttonsStatus: [],
  axesStatus: []
};




const playerId = 'id'+Math.floor(Math.random() * 1000)
const socket = new WebSocket(`ws://${window.location.host}/ws`)
socket.onerror = (err) => console.log('error', err)

const map = {
  "tileMap": [
    [33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33]
  ]
}

const TILE_SIZE = 40

var movementKeys = {
  up: ["Up", "ArrowUp", "w", "W"],
  left: ["Left", "ArrowLeft", "a", "A"],
  down: ["Down", "ArrowDown", "s", "S"],
  right: ["Right", "ArrowRight", "d", "D"],
  bomb: ["x", "k"]
}

var mapSprites
var floorSPrites

var pushedKeys = {
  left: false,
  right: false,
  up: false,
  down: false
}

var pushedGamepadKeys = {
  left: false,
  right: false,
  up: false,
  down: false
}

var player
var otherPlayers = {}
var bombs = []

function placeBomb(bx, by) {
  if (map.tileMap[by][bx] === 0) {
    map.tileMap[by][bx] = 180
  }
}

function removeBomb(bx, by) {
  map.tileMap[by][bx] = 0
}

function startgame() {

  window.addEventListener("gamepadconnected", gamepadAPI.connect);
  window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);

  document.addEventListener('keydown', (event) => {
    if (movementKeys.left.indexOf(event.key) !== -1) {
      pushedKeys.left = true
    }
    if (movementKeys.right.indexOf(event.key) !== -1) {
      pushedKeys.right = true
    }
    if (movementKeys.up.indexOf(event.key) !== -1) {
      pushedKeys.up = true
    }
    if (movementKeys.down.indexOf(event.key) !== -1) {
      pushedKeys.down = true
    }
    if (movementKeys.bomb.indexOf(event.key) !== -1) {
      dropBomb()
    }
  }, false);

  document.addEventListener('keyup', (event) => {
    if (movementKeys.left.indexOf(event.key) !== -1) {
      pushedKeys.left = false
    }
    if (movementKeys.right.indexOf(event.key) !== -1) {
      pushedKeys.right = false
    }
    if (movementKeys.up.indexOf(event.key) !== -1) {
      pushedKeys.up = false
    }
    if (movementKeys.down.indexOf(event.key) !== -1) {
      pushedKeys.down = false
    }
  }, false);

  image = new Image();
  image2 = new Image();
  var image1Done = false
  var image2Done = false

  image2.onload = function() {
    const IMAGE_TILE_SIZE = 16
    var tempTiles = []
    for (let y = 0; y < image2.height / IMAGE_TILE_SIZE; y++) {
      for (let x = 0; x < image2.width / IMAGE_TILE_SIZE; x++) {
        tempTiles.push(createImageBitmap(image2, x * 16, y * 16, 16, 16))
      }
    }

    Promise.all(tempTiles).then(function(sprites) {
      floorSPrites = sprites
      image1Done = true
      if (image1Done && image2Done) {
        draw()
        // Draw each sprite onto the canvas
        gameLoop()
      }
    });
  }

  // Wait for the sprite sheet to load
  image.onload = function() {
    const IMAGE_TILE_SIZE = 16
    var tempTiles = []
    for (let y = 0; y < image.height / IMAGE_TILE_SIZE; y++) {
      for (let x = 0; x < image.width / IMAGE_TILE_SIZE; x++) {
        if (y > 2) {
          tempTiles.push(createImageBitmap(image, x * 16, y * 16 + 1, 16, 16, {premultiplyAlpha: 'premultiply'}))
        } else {
          tempTiles.push(createImageBitmap(image, x * 16, y * 16, 16, 16, {premultiplyAlpha: 'premultiply'}))
        }
      }
    }

    Promise.all(tempTiles).then(function(sprites) {
      mapSprites = sprites
      image2Done = true
      if (image1Done && image2Done) {
        draw()
        // Draw each sprite onto the canvas
        gameLoop()
      }
    });
  }

  image.src = 'cave_B.png'
  image2.src = 'cave_A.png'
}

function handleInput() {
  // Reset state
  player.vx = 0
  player.vy = 0

  var pressedKeys = gamepadAPI.update()
  if (pressedKeys.indexOf('A') !== -1) {
    pushedGamepadKeys.left = true
  } else {
    pushedGamepadKeys.left = false
  }
  if (pressedKeys.indexOf('B') !== -1) {
    pushedGamepadKeys.right = true
  } else {
    pushedGamepadKeys.right = false
  }
  if (pressedKeys.indexOf('X') !== -1) {
    pushedGamepadKeys.up = true
  } else {
    pushedGamepadKeys.up = false
  }
  if (pressedKeys.indexOf('Y') !== -1) {
    pushedGamepadKeys.down = true
  } else {
    pushedGamepadKeys.down = false
  }

  if (
    pressedKeys.indexOf('DPad-Up') !== -1 || 
    pressedKeys.indexOf('DPad-Down') !== -1 || 
    pressedKeys.indexOf('DPad-Left') !== -1 || 
    pressedKeys.indexOf('DPad-Right') !== -1) {
      dropBomb()
  }

  // Set new state values
  if (pushedKeys.right || pushedGamepadKeys.right) player.vx = player.speed
  if (pushedKeys.left || pushedGamepadKeys.left) player.vx = -player.speed
  if (pushedKeys.down || pushedGamepadKeys.down) player.vy = player.speed
  if (pushedKeys.up || pushedGamepadKeys.up) player.vy = -player.speed
}

function updateState() {
  var curr_tile_mid_x = player.x / TILE_SIZE
  var curr_tile_mid_y = player.y / TILE_SIZE
  var curr_tile_right_x = (player.x + player.radius) / TILE_SIZE
  var curr_tile_left_x = (player.x - player.radius) / TILE_SIZE
  var curr_tile_top_y = (player.y - player.radius) / TILE_SIZE
  var curr_tile_bot_y = (player.y + player.radius) / TILE_SIZE
  var curr_tiles_x = [curr_tile_left_x, curr_tile_mid_x, curr_tile_right_x]
  var curr_tiles_y = [curr_tile_top_y, curr_tile_mid_y, curr_tile_bot_y]


  // Going right
  var next_tile_right_x = (player.x + player.radius + player.vx) / TILE_SIZE
  if (Math.floor(curr_tile_right_x) < Math.floor(next_tile_right_x)) {
    // There's a new overlap. If new tile overlap is wall, we must block passage
    var overlapping_tile_right_x = Math.floor(next_tile_right_x)
    for (var i = 0; i < 3; i++) {
      var yTile = Math.floor(curr_tiles_y[i])
      if (map.tileMap[yTile][overlapping_tile_right_x]) {
        player.vx = 0
        // An extra pixel for reasons
        player.x = overlapping_tile_right_x * TILE_SIZE - player.radius - 1
      }
    }
  }

  // Going left
  var next_tile_left_x = (player.x - player.radius + player.vx) / TILE_SIZE
  if (Math.floor(curr_tile_left_x) > Math.floor(next_tile_left_x)) {
    // New overlap to the left
    var overlapping_tile_left_x = Math.floor(next_tile_left_x)
    for (var i = 0; i < 3; i++) {
      var yTile = Math.floor(curr_tiles_y[i])
      if (map.tileMap[yTile][overlapping_tile_left_x]) {
        player.vx = 0
        player.x = (overlapping_tile_left_x + 1) * TILE_SIZE + player.radius + 1
      }
    }
  }

  // Going down
  var next_tile_down_y = (player.y + player.radius + player.vy) / TILE_SIZE
  if (Math.floor(next_tile_down_y) > Math.floor(curr_tile_bot_y)) {
    // New overlap downwards
    var overlapping_tile_down_y = Math.floor(next_tile_down_y)
    for (var i = 0; i < 3; i++) {
      var xTile = Math.floor(curr_tiles_x[i])
      if (map.tileMap[overlapping_tile_down_y][xTile]) {
        player.vy = 0
        player.y = overlapping_tile_down_y * TILE_SIZE - player.radius - 1
      }
    }
  }

  // Going up
  var next_tile_up_y = (player.y - player.radius + player.vy) / TILE_SIZE
  if (Math.floor(next_tile_up_y) < Math.floor(curr_tile_top_y)) {
    // New overlap upwards
    var overlapping_tile_up_y = Math.floor(next_tile_up_y)
    for (var i = 0; i < 3; i++) {
      var xTile = Math.floor(curr_tiles_x[i])
      if (map.tileMap[overlapping_tile_up_y][xTile]) {
        player.vy = 0
        player.y = (overlapping_tile_up_y + 1) * TILE_SIZE + player.radius + 1
      }
    }
  }

  // Going diagonally
  if (player.vx && player.vy) {
    // Four diagonals, check all of them
    // Right down
    if (Math.floor(curr_tile_right_x) < Math.floor(next_tile_right_x) && Math.floor(next_tile_down_y) > Math.floor(curr_tile_bot_y)) {
      player.vy = 0
    }
    // Left down
    if (Math.floor(curr_tile_left_x) > Math.floor(next_tile_left_x) && Math.floor(next_tile_down_y) > Math.floor(curr_tile_bot_y)) {
      player.vy = 0
    }
    // Right up 
    if (Math.floor(curr_tile_right_x) < Math.floor(next_tile_right_x) && Math.floor(next_tile_up_y) < Math.floor(curr_tile_top_y)) {
      player.vy = 0
    }
    // Left up
    if (Math.floor(curr_tile_left_x) > Math.floor(next_tile_left_x) && Math.floor(next_tile_up_y) < Math.floor(curr_tile_top_y)) {
      player.vy = 0
    }
  }

  // No need to update if move is 0
  if (player.vx == 0 && player.vy == 0) {
    return
  }

  player.x += player.vx
  player.y += player.vy
  sendMove(player.x, player.y)
}

function bombExplodeTiles(bombX, bombY, bombLength) {
  // bombX & bombY are tile coordinates, length is nr of tiles

  // Always explode its own tile
  explodes = [[bombX, bombY]]

  if (map.tileMap[bombY][bombX]) {
    return explodes
  }

  // Up
  for (int i = 0; i <= bombLength && bombY - i >= 0; i++) {
    if (map.tileMap[bombY - i][bombX]) {
      break
    }
    explodes.push([bombY - i, bombX])
  }

  // Down
  for (int i = 0; i <= bombLength && bombY + i < map.tileMap.length; i++) {
    if (map.tileMap[bombY + 1][bombX]) {
      break
    }
    explodes.push([bombY + i, bombX])
  }

  // Right
  for (int i = 0; i <= bombLength && bombX + i < map.tileMap[0].length; i++) {
    if (map.tileMap[bombY][bombX + 1]) {
      break
    }
    explodes.push([bombY, bombX + 1])
  }

  // Right
  for (int i = 0; i <= bombLength && bombX + i >= 0; i++) {
    if (map.tileMap[bombY][bombX - 1]) {
      break
    }
    explodes.push([bombY, bombX - 1])
  }

  return explodes
} 

function draw() {
  if (!mapSprites) {return}
  var canvas = document.getElementById('canvas');
  
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let x = 0; x < map.tileMap[0].length; x++) {
      for (let y = 0; y < map.tileMap.length; y++) {
        if (map.tileMap[y][x] === 0) {
          if (y === 1) {
            if (x === 1) {
              ctx.drawImage(floorSPrites[0], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else if (x === map.tileMap[0].length - 2) {
              ctx.drawImage(floorSPrites[2], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else {
              ctx.drawImage(floorSPrites[1], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            }
          } else if (y > 1 && y < map.tileMap.length - 2) {
            if (x === 1) {
              ctx.drawImage(floorSPrites[5], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else if (x === map.tileMap[0].length - 2) {
              ctx.drawImage(floorSPrites[7], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else {
              ctx.drawImage(floorSPrites[6], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            }
          } else if (y === map.tileMap.length - 2) {
            if (x === 1) {
              ctx.drawImage(floorSPrites[10], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else if (x === map.tileMap[0].length - 2) {
              ctx.drawImage(floorSPrites[12], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            } else {
              ctx.drawImage(floorSPrites[11], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
            }
          }

          // Plain tiles (if too laggy)
          //ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.drawImage(floorSPrites[6], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
          ctx.drawImage(mapSprites[map.tileMap[y][x]], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
        if (player) {
          player.draw(ctx)
        }
        // Draw the rest of the players
        for (const id in otherPlayers) {
          otherPlayers[id].draw(ctx)
        }
      }
    }
  }
}


function gameLoop() {
  if (player) {
    handleInput()
    updateState()
  }


  window.requestAnimationFrame(gameLoop)
}

socket.onopen = (event) => {
  socket.send(JSON.stringify({Id: playerId}))
}
socket.onmessage = (event) => {
  console.log(event.data)
 // Get my coordinates
  var jsonData = JSON.parse(event.data)
  switch(jsonData.Act) {
    case 'move':
      if (jsonData.Id !== playerId) {
        otherPlayers[jsonData.Id].x = jsonData.X
        otherPlayers[jsonData.Id].y = jsonData.Y
      }
      break;
    case 'bomb':
      var bx = Math.round((jsonData.X - player.radius) / TILE_SIZE)
      var by = Math.round((jsonData.Y - player.radius) / TILE_SIZE)
      placeBomb(bx, by)
      break;
    case 'ex':
      console.log(jsonData)
    default: 
      if (jsonData.Id === playerId) {
        player = {
          x: jsonData.X,
          y: jsonData.Y,
          vx: 0,
          vy: 0,
          speed: 4,
          radius: TILE_SIZE / 2.5,
          color: jsonData.Color,
          draw: function(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
          }
        };
      } else {
        otherPlayers[jsonData.Id] = {
          x: jsonData.X,
          y: jsonData.Y,
          vx: 0,
          vy: 0,
          speed: 4,
          radius: TILE_SIZE / 2.5,
          color: jsonData.Color,
          draw: function(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
          }
        }
      }
  }
  draw()

  // console.log('message', JSON.parse(event.data))
}
socket.onclose = (event) => console.log('close', event)


function sendMove(x, y) {
  socket.send(JSON.stringify({X:x, Y:y, Act: "move", Id: playerId}))
}

function dropBomb() {
  socket.send(JSON.stringify({Act: "bomb", Id: playerId}))
}