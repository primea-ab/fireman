const map = {
  "tileMap": [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
}

const TILE_SIZE = 40

var movementKeys = {
  left: ["Left", "ArrowLeft"],
  right: ["Right", "ArrowRight"],
  up: ["Up", "ArrowUp"],
  down: ["Down", "ArrowDown"]
}

var pushedKeys = {
  left: false,
  right: false,
  up: false,
  down: false
}

var player = {
  x: 60,
  y: 60,
  vx: 0,
  vy: 0,
  speed: 5,
  radius: TILE_SIZE / 2,
  color: 'blue',
  draw: function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};

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

  gameLoop()
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
    player.x = Math.floor(tx) * TILE_SIZE + player.radius
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

  player.x += player.vx
  player.y += player.vy
}

function draw() {
  var canvas = document.getElementById('canvas');
  
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let x = 0; x < map.tileMap[0].length; x++) {
      for (let y = 0; y < map.tileMap.length; y++) {
        if (map.tileMap[y][x] === 0) {
          ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else if (map.tileMap[y][x] === 1) {
          ctx.fillStyle = 'black'
          ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        player.draw(ctx)
      }
    }
  }
}


function gameLoop() {
  handleInput()
  updateState()
  draw()

  window.requestAnimationFrame(gameLoop)
}