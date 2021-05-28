const map = {
  "tileMap": [
    [33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33],
    [33,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,71,0,33],
    [33,0,0,0,0,0,0,0,0,133,0,0,0,0,0,0,0,0,33],
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
  right: ["Right", "ArrowRight", "d", "D"]
}

var mapSprites

var pushedKeys = {
  left: false,
  right: false,
  up: false,
  down: false
}

var player
var otherPlayers = []

function startgame() {

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

  // Wait for the sprite sheet to load
  image.onload = function() {
    const IMAGE_TILE_SIZE = 16
    var tempTiles = []
    for (let y = 0; y < image.height / IMAGE_TILE_SIZE; y++) {
      for (let x = 0; x < image.width / IMAGE_TILE_SIZE; x++) {
        tempTiles.push(createImageBitmap(image, x * 16, y * 16, 16, 16)) // Add all tiles flipped?
      }
    }

    Promise.all(tempTiles).then(function(sprites) {
      mapSprites = sprites
      // Draw each sprite onto the canvas
      gameLoop()
    });
  }

  image.src = 'cave_B.png'
}

function handleInput() {
  // Reset state
  player.vx = 0
  player.vy = 0

  // Set new state values
  if (pushedKeys.right) player.vx = player.speed
  if (pushedKeys.left) player.vx = -player.speed
  if (pushedKeys.down) player.vy = player.speed
  if (pushedKeys.up) player.vy = -player.speed
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

  player.x += player.vx
  player.y += player.vy
}

function draw() {
  var canvas = document.getElementById('canvas');
  
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let x = 0; x < map.tileMap[0].length; x++) {
      for (let y = 0; y < map.tileMap.length; y++) {
        if (map.tileMap[y][x] === 0) {
          ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.drawImage(mapSprites[map.tileMap[y][x]], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
        if (player) {
          player.draw(ctx)
        }
        // Draw the rest of the players
        for (let i = 0; i < otherPlayers.length; i++) {
          otherPlayers[i].draw(ctx)
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
  draw()

  window.requestAnimationFrame(gameLoop)
}

const playerId = 'id'+Math.floor(Math.random() * 1000)
const socket = new WebSocket('ws://localhost:8000/ws')
socket.onerror = (err) => console.log('error', err)

socket.onopen = (event) => {
  socket.send(JSON.stringify({Id: playerId}))
}
socket.onmessage = (event) => {

  // Get my coordinates
  var jsonData = JSON.parse(event.data)
  if (jsonData.Id === playerId) {
    player = {
      x: jsonData.X + 20,
      y: jsonData.Y + 20,
      vx: 0,
      vy: 0,
      speed: 4,
      radius: TILE_SIZE / 3,
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
    otherPlayers.push({
      x: jsonData.X + 20,
      y: jsonData.Y + 20,
      vx: 0,
      vy: 0,
      speed: 4,
      radius: TILE_SIZE / 3,
      color: jsonData.Color,
      draw: function(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    })
  }

  console.log('message', JSON.parse(event.data))
}
socket.onclose = (event) => console.log('close', event)