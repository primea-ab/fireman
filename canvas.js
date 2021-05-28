const playerId = 'id'+Math.floor(Math.random() * 1000)
const socket = new WebSocket('ws://localhost:8000/ws')
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
  right: ["Right", "ArrowRight", "d", "D"],
  bomb: ["x", "k"]
}

var mapSprites

var pushedKeys = {
  left: false,
  right: false,
  up: false,
  down: false
}

var player
var otherPlayers = {}
var bombs = []

function placeBomb(bx, by) {
  map.tileMap[by][bx] = 180
}

function removeBomb(bx, by) {
  map.tileMap[by][bx] = 0
}

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
    if (movementKeys.bomb.indexOf(event.key) !== -1) {
      placeBomb(
        Math.round((player.x - player.radius) / TILE_SIZE),
        Math.round((player.y - player.radius) / TILE_SIZE)
      )
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
      draw()
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
  var tx = (player.x + player.vx - player.radius) / TILE_SIZE
  var ty = (player.y - player.radius) / TILE_SIZE

  // Int tiles
  var topLeft = map.tileMap[Math.floor(ty)][Math.floor(tx)]
  var topRight = map.tileMap[Math.floor(ty)][Math.ceil(tx)]
  var bottomLeft = map.tileMap[Math.ceil(ty)][Math.floor(tx)]
  var bottomRight = map.tileMap[Math.ceil(ty)][Math.ceil(tx)]

  if ((topLeft || bottomLeft) && player.vx < 0) {
    player.x = Math.ceil(tx) * TILE_SIZE + player.radius
    player.vx = 0
  }
  if ((topRight || bottomRight) && player.vx > 0) {
    player.x = Math.ceil(tx) * TILE_SIZE - player.radius
    player.vx = 0
  }

  tx = (player.x - player.radius) / TILE_SIZE
  ty = (player.y + player.vy - player.radius) / TILE_SIZE

  // Int tiles
  topLeft = map.tileMap[Math.floor(ty)][Math.floor(tx)]
  topRight = map.tileMap[Math.floor(ty)][Math.ceil(tx)]
  bottomLeft = map.tileMap[Math.ceil(ty)][Math.floor(tx)]
  bottomRight = map.tileMap[Math.ceil(ty)][Math.ceil(tx)]

  if ((topLeft || topRight) && player.vy < 0) {
    player.y = Math.ceil(ty) * TILE_SIZE + player.radius
    player.vy = 0
  }
  if ((bottomLeft || bottomRight) && player.vy > 0) {
    player.y = Math.floor(ty) * TILE_SIZE + player.radius
    player.vy = 0
  }

  // No need to update if move is 0
  if (player.vx == 0 && player.vy == 0) {
    return
  }

  player.x += player.vx
  player.y += player.vy
  sendMove(player.x, player.y)
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
          ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
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

  // Get my coordinates
  var jsonData = JSON.parse(event.data)
  switch(jsonData.Act) {
    case 'Move':
      if (jsonData.Id !== playerId) {
        otherPlayers[jsonData.Id].x = jsonData.X
        otherPlayers[jsonData.Id].y = jsonData.Y
      }
      break;
    default: 
      if (jsonData.Id === playerId) {
        player = {
          x: jsonData.X,
          y: jsonData.Y,
          vx: 0,
          vy: 0,
          speed: 4,
          radius: TILE_SIZE / 2,
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
          radius: TILE_SIZE / 2,
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


      draw()
  }
  

  // console.log('message', JSON.parse(event.data))
}
socket.onclose = (event) => console.log('close', event)


function sendMove(x, y) {
  socket.send(JSON.stringify({X:x, Y:y, Act: "move", Id: playerId}))
}

function dropBomb() {
  socket.send(JSON.stringify({Act: "bomb", Id: playerId}))
}