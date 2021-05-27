const map = {
  "tileMap": [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  speed: 5,
  radius: 20,
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
  player.x += player.vx
  player.y += player.vy
}


function collisions() {
  var collidedX = []
  var tx = player.x / TILE_SIZE
  var txFloor = Math.floor(tx)
  collidedX.push(txFloor)
  var d = tx - txFloor
  if (d < 0.5) {
    collidedX.push(txFloor - 1)
  }
  if (d > 0.5) {
    collidedX.push(txFloor + 1)
  }

  var collidedY = []
  var ty = player.y / TILE_SIZE
  var tyFloor = Math.floor(ty)
  collidedY.push(tyFloor)
  var d = ty - tyFloor
  if (d < 0.5) {
    collidedY.push(tyFloor - 1)
  }
  if (d > 0.5) {
    collidedY.push(tyFloor + 1)
  }

  return collidedX, collidedY
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
  collisions()
  updateState()
  draw()

  window.requestAnimationFrame(gameLoop)
}