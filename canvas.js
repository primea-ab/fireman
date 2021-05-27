var current_position = {'x': 0, 'y': 0} 
function setup() {

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'Left':
      case 'ArrowLeft':
      console.log('LEFT');
      current_position['x'] -= 1
      break;
      case 'Up':
      case 'ArrowUp':
      console.log('UP');
      current_position['y'] -= 1
      break;
      case 'Right':
      case 'ArrowRight':
      console.log('RIGHT');
      current_position['x'] += 1
      break;
      case 'Down':
      case 'ArrowDown':
      console.log('DOWN');
      current_position['y'] += 1
      break;

    }
    draw()
  }, false);

  console.log(current_position)
}


function draw() {
  console.log(current_position)
  var canvas = document.getElementById('canvas');
  
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        ctx.strokeRect(x*40, y*40, 40, 40);
        if (current_position['x'] === x && current_position['y'] === y) {
          ctx.beginPath()
          ctx.arc(x*40, y*40, 20, 0, Math.PI * 2, true)
          ctx.stroke()
        }
      }
    }
  }
}



/*ctx.fillStyle = 'rgb(200, 0, 0)';
ctx.fillRect(10, 10, 50, 50);

ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
ctx.fillRect(30, 30, 50, 50);

ctx.beginPath();
ctx.moveTo(75, 50);
ctx.lineTo(100, 75);
ctx.lineTo(100, 25);
ctx.fill();

ctx.beginPath();
ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
ctx.moveTo(110, 75);
ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
ctx.moveTo(65, 65);
ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
ctx.moveTo(95, 65);
ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
ctx.stroke();*/