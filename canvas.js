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
  maxV: 5,
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

  draw()
}



function draw() {
  var canvas = document.getElementById('canvas');
  
  if (pushedKeys.right && !pushedKeys.left) {
    player.x += player.maxV
  }
  if (pushedKeys.left && !pushedKeys.right) {
    player.x -= player.maxV
  }
  if (pushedKeys.up && !pushedKeys.down) {
    player.y -= player.maxV
  }
  if (pushedKeys.down && !pushedKeys.up) {
    player.y += player.maxV
  }
  
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        ctx.strokeRect(x*40, y*40, 40, 40);
        player.draw(ctx)
      }
    }
  }
  window.requestAnimationFrame(draw)
}