//Enable for live debug
let debug = false;

//Draws everthing to the screen
const drawCars = () => {

  if(gameState === GAME_STATE.LOBBY){

    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if(isHost){
      fillText("Start when ready", WIDTH/2, HEIGHT/2, "20pt Jura", "white");
    }else{
      fillText("Waiting for host to start the game", WIDTH/2, HEIGHT/2, "20pt Jura", "white");
    }
    ctx.restore();

  }else if(gameState === GAME_STATE.END){
    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    fillText("Game Over", WIDTH/2, HEIGHT/2, "20pt Jura", "white");

    ctx.restore();
  } else{
    const deltaTime = calculateDeltaTime();

    moveCars(deltaTime);

    checkCollisions(deltaTime);

    //Draw background
    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    //Draw the sun
    ctx.translate(sun.x, sun.y);
    if (debug) {
      //Draw the area of gravitational effect if in debug
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(0, 0, sun.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
    //Draw the acual sun
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(0, 0, sun.core, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    if (debug) {
      //If in debug, draw arrows to show direction of gravitational field
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI/2);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(-20, -60);
        ctx.lineTo(20, -60);
        ctx.lineTo(17, -63);
        ctx.moveTo(20, -60);
        ctx.lineTo(17, -57);
        ctx.stroke();
        ctx.closePath();
      }
    }

    ctx.restore(); 

    const keys = Object.keys(cars);

    //console.log(cars[keys[0]]);

    let aliveCount = 0;

    for (let i = 0; i < keys.length; i++) {
      const car = cars[keys[i]];


      //console.log(car.state);


      //If the car is dead don't draw it and add to dead c
      if (car.state !== CAR_STATE.DEAD){

        aliveCount++;

        //const image = avatars[0];

        ctx.save();

        if(car.direction == directions.DOWNRIGHT){ //downright
          ctx.drawImage(
            avatars[car.spriteColor],
            car.spriteWidth * directions.DOWNRIGHT,
            0,
            car.spriteWidth,
            car.spriteHeight,            
            car.x, car.y, car.size*2, car.size*2);
        }else if(car.direction == directions.DOWNLEFT){ //downleft
          ctx.drawImage(
            avatars[car.spriteColor],
            car.spriteWidth * directions.DOWNLEFT,
            0,
            car.spriteWidth,
            car.spriteHeight,            
            car.x, car.y, car.size*2, car.size*2);
        }else if(car.direction == directions.UPRIGHT){ //upright
          ctx.drawImage(
            avatars[car.spriteColor],
            car.spriteWidth * directions.UPRIGHT,
            0,
            car.spriteWidth,
            car.spriteHeight,            
            car.x, car.y, car.size*2, car.size*2);
        }else{ //car.direction = directions.UPLEFT upleft
          ctx.drawImage(
            avatars[car.spriteColor],//nope
            car.spriteWidth * directions.UPLEFT,
            0,
            car.spriteWidth,
            car.spriteHeight,            
            car.x, car.y, car.size*2, car.size*2);
        }

        ctx.restore();
        if (debug) {
          //Show the origin of each rectangle for developer aid
          ctx.save();
          ctx.translate(car.x, car.y);
          ctx.beginPath();
          ctx.fillStyle = "white";
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();

          //Show velocity
          ctx.beginPath();
          ctx.globalAlpha = 0.7;
          ctx.strokeStyle = "blue";
          ctx.translate(car.size, car.size)
          ctx.moveTo(0, 0);
          ctx.lineTo(car.velocity.x * 10, car.velocity.y * 10);
          ctx.closePath();
          ctx.stroke();

          //show accleration
          ctx.beginPath();
          ctx.strokeStyle = "Red";
          ctx.moveTo(0, 0);
          ctx.lineTo(car.acceleration.x * 10, car.acceleration.y * 10);
          ctx.closePath();                    
          ctx.stroke();
          ctx.restore();
        }
      }


    }

    if(isHost && aliveCount <= 1 && keys.length > 1){
      console.log(keys.length);
      console.log("1 or less players alive")
      socket.emit('endGame');
    }

    drawHUD();
  }


  animationFrame = requestAnimationFrame(drawCars);
};

const drawHUD = () => {

  ctx.save();
  //Text for debug information
  if (debug) {
    fillText("Debug Info:Press N to toggle Debug", 10, 30, "20pt 'Exo 2'", "white");

    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
  }
  //Car health stacked from the bottom dynamically so the last player will always next to the bottom of the canvas
  const keys = Object.keys(cars);
  for (let i = keys.length - 1; i >= 0 ; i--) {
    if (cars[keys[i]].state === CAR_STATE.DEAD) continue;
    fillText("Player " + (i+1) + " Population: " + cars[keys[i]].health.toFixed(1) + " million", 10, HEIGHT - ((keys.length - i) *30 ), "20pt 'Exo 2'", cars[keys[i]].fillStyle);
  }

  ctx.restore();
};

//Taken from Boomshine to display text easily
const fillText = (string, x, y, css, color) => {

  ctx.save();
  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  ctx.font = css;
  ctx.fillStyle = color;
  ctx.fillText(string, x, y);
  ctx.restore();
};

const drawIntroScreen = () =>{
  setTimeout(()=>{   
    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    fillText("Start or Join a Battle to Begin Playing.", WIDTH/2, HEIGHT/2 - 50, "20pt Jura", "white");
    fillText("Use WASD to crash into other players and ", WIDTH/2, HEIGHT/2, "20pt Jura", "white");
    fillText("annihilate their planet's populations.", WIDTH/2, HEIGHT/2 + 50, "20pt Jura", "white");
    ctx.restore();
  }, 300);
}

const drawWaitingScreen = () =>{
  setTimeout(()=>{   
    ctx.save();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fillText("Waiting", WIDTH/2, HEIGHT/2, "20pt Jura", "white");
    ctx.restore();
  }, 300);
}