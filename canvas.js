function draw() {
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'Left':
      case 'ArrowLeft':
        console.log('LEFT');
        break;
      case 'Up':
      case 'ArrowUp':
        console.log('UP');
        break;
      case 'Right':
      case 'ArrowRight':
        console.log('RIGHT');
        break;
      case 'Down':
      case 'ArrowDown':
        console.log('DOWN');
        break;
      
    }
  }, false);

  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 15; y++) {
        ctx.strokeRect(x*40, y*40, 40, 40);
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
  }
}