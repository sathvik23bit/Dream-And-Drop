let score = 0;
let time = 0;
let timer;
let timerInterval;
let ballCreationIntervalId;
let level = 0;
let restartButton;
let ballWidth = 50;
const squareSize = 700;
const ballCreationInterval = 800;
let gamePaused = true;
let obstacleCoordinates = [];
let mouseClickCoordinates = {};
let isGameRunning = false;
let wasPausedByFocus = false;
let GAME_PAUSED = false;
let GAME_STARTED = false;
let PAUSE_LOCK = false;
let IS_DRAGGING = false;

document.addEventListener("wheel", e => {
  if (isGameRunning) e.preventDefault();
}, { passive: false });


function isLaptop() {
  return (
    window.innerWidth <= 1366 ||          // common laptop widths
    navigator.maxTouchPoints > 0           // touchpad-capable devices
  );
}

function forceUnpause() {
  GAME_PAUSED = false;

  const focus = document.getElementById("focus-block");
  if (focus) focus.style.display = "none";

  const overlay = document.getElementById("overlay");
  if (overlay) overlay.style.display = "none";
}



document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseGame();
  } else {
    resumeGame();
  }
});


document.addEventListener("visibilitychange", () => {
  if (document.hidden && isGameRunning) {
    pauseGame();
    showFocusWarning();
  }
});

window.addEventListener("blur", () => {
  if (isGameRunning) {
    pauseGame();
    showFocusWarning();
  }
});

window.addEventListener("focus", () => {
  if (wasPausedByFocus && isGameRunning) {
    hideFocusWarning();
  }
});


function blockMobileAndTablet() {
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  const isSmallScreen = window.innerWidth < 1024;


  if ((isTouchDevice || isSmallScreen) && document.visibilityState === "visible") {
    document.getElementById("device-block").style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}


function showFocusWarning() {
  const fb = document.getElementById("focus-block");
  fb.style.display = "flex";
  fb.style.pointerEvents = "all";
}

function hideFocusWarning() {
  const fb = document.getElementById("focus-block");
  fb.style.display = "none";
  fb.style.pointerEvents = "none";
  resumeGame();
}


window.addEventListener("focus", hideFocusWarning);



blockMobileAndTablet();




document.getElementById('overlay').style.display = 'none';

document.querySelector('#instruction-modal button').addEventListener('click', level1);


document.getElementById('easyBtn').addEventListener('click', function () {
  // Create an audio element
  var audio = new Audio('/Sounds/Common%20Sound/click.wav'); // Replace 'sound.wav' with the path to your sound file

  // Play the audio
  audio.play();
});


document.getElementById('mediumBtn').addEventListener('click', function () {
  // Create an audio element
  var audio = new Audio('/Sounds/Common%20Sound/click.wav'); // Replace 'sound.wav' with the path to your sound file
  // Play the audio
  audio.play();
});


document.getElementById('hardBtn').addEventListener('click', function () {
  // Create an audio element
  var audio = new Audio('/Sounds/Common%20Sound/click.wav'); // Replace 'sound.wav' with the path to your sound file

  // Play the audio
  audio.play();
});

//soud and all
const audioSettingCheckbox = document.getElementById('audio_setting');
const audioIconOn = document.getElementById('audio_icon_on');
const audioIconOff = document.getElementById('audio_icon_off');
let backgroundAudio;

function toggleBackgroundAudio() {
  if (audioSettingCheckbox.checked) {
    playBackgroundSound();
    audioIconOn.style.display = 'block';
    audioIconOff.style.display = 'none';
  } else {
    stopBackgroundSound();
    audioIconOn.style.display = 'none';
    audioIconOff.style.display = 'block';
  }
}
function playBackgroundSound() {
  if (backgroundAudio) {
    stopBackgroundSound(); // Stop any existing audio before starting a new one
  }
  backgroundAudio = new Audio('Sounds/Common%20Sound/background.mp3');
  backgroundAudio.volume = 0.1;
  backgroundAudio.loop = true;
  backgroundAudio.play();
}

function stopBackgroundSound() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
    backgroundAudio = null; // Ensure the old audio instance is cleared
  }
}

audioSettingCheckbox.addEventListener('change', toggleBackgroundAudio);
toggleBackgroundAudio()



function pauseGame() {
  if (!GAME_STARTED) return;
  if (GAME_PAUSED) return;

  GAME_PAUSED = true;
  PAUSE_LOCK = true;

  clearInterval(timer);
  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  const fb = document.getElementById("focus-block");
  if (fb) fb.style.display = "flex";
}

function resumeGame() {
  if (!GAME_PAUSED || !PAUSE_LOCK) return;

  GAME_PAUSED = false;
  PAUSE_LOCK = false;

  const fb = document.getElementById("focus-block");
  if (fb) fb.style.display = "none";

  // Resume ONLY what was already running
  if (currentLevel === 1) {
    level1();
  } else {
    nextLevelFunction(currentLevel);
  }

  gamePaused = false;
}




function createRedBall() {
  const ball = document.createElement('div');
  ball.classList.add('ball', 'red');
  let currentFrame = 1;
  ball.style.backgroundImage = `url('Images/Dream_Drop/ball1.png')`;
  ball.style.backgroundSize = 'contain';
  ball.style.backgroundRepeat = 'no-repeat';
  ball.style.cursor = "pointer";

  const diameter = 40;
  const buffer = 20;
  const leftBoundary = (window.innerWidth - squareSize) / 2;
  const topBoundary = (window.innerHeight - squareSize) / 2;
  let left, top;
  do {
    left = leftBoundary + Math.random() * squareSize;
    top = topBoundary + Math.random() * squareSize;
  } while (checkCollision(left, top, diameter + buffer));

  ball.style.left = left + 'px';
  ball.style.top = top + 'px';



  // Cleanup function to remove interval when the ball is removed
  ball.addEventListener('animationend', function () {
    if (GAME_PAUSED) return;
    clearInterval(animationInterval);
  });

  ball.addEventListener('pointerdown', function (e) {
    if (GAME_PAUSED) return;
    e.stopPropagation();
    ball.remove();
    score++;
    document.getElementById('score-value').innerText = score;
  });


  return ball;
}




function checkCollision(left, top, size) {
  const balls = document.querySelectorAll('.ball');
  balls.forEach(ball => {
    const ballRect = ball.getBoundingClientRect();
    const ballLeft = ballRect.left;
    const ballTop = ballRect.top;
    const ballRight = ballRect.right;
    const ballBottom = ballRect.bottom;

    if (left < ballRight && left + size > ballLeft && top < ballBottom && top + size > ballTop) {
      return true;
    }
  });
  return false;
}


document.addEventListener('click', function (event) {

  let x = event.clientX;
  let y = event.clientY;

  let clickKey = new Date().getTime();  // Use timestamp as the unique key for each click
  mouseClickCoordinates[clickKey] = { x, y };


  console.log(`Click recorded at: (${x}, ${y})`);
  console.log(mouseClickCoordinates);
});



document.addEventListener("DOMContentLoaded", function () {

  document.getElementById('easyBtn').addEventListener('click', function () {
    // Play click sound
    var audio = new Audio('/Sounds/Common%20Sound/click.wav');
    audio.play();

    // Set background and clear game
    document.getElementById('fidrat-home').style.backgroundImage = 'url("Images/Common_Images/gamebg.png")';
    clearGame();

    // Hide menu elements
    document.getElementById('para').style.display = 'none';
    document.getElementById('para1').style.display = 'none';
    document.getElementById('ie').style.display = 'none';
    document.getElementById('vv').style.display = 'none';
    document.getElementById('shanti').style.display = 'none';
    document.getElementById('prem').style.display = 'none';
    document.getElementById('game-title').style.display = 'none';
    document.getElementById('easyBtn').style.display = 'none';
    document.getElementById('mediumBtn').style.display = 'none';
    document.getElementById('hardBtn').style.display = 'none';

    // Skip the instruction modal and start level 1 directly
    document.getElementById('instruction-modal').style.display = 'block';
    document.getElementById('fidrat-home').style.backgroundColor = 'lightgoldenrodyellow';

    document.getElementById('ok').addEventListener('click', function () {
      // Reset game state and start level 1
      score = 0;
      time = 0;
      currentLevel = 1;

      level1();

    });

  });


  document.getElementById('mediumBtn').addEventListener('click', function () {
    // Play click sound
    var audio = new Audio('/Sounds/Common%20Sound/click.wav');
    audio.play();

    // Clear any existing game elements
    clearGame();

    // Hide all menu elements
    document.getElementById('para').style.display = 'none';
    document.getElementById('para1').style.display = 'none';
    document.getElementById('ie').style.display = 'none';
    document.getElementById('vv').style.display = 'none';
    document.getElementById('shanti').style.display = 'none';
    document.getElementById('prem').style.display = 'none';
    document.getElementById('game-title').style.display = 'none';
    document.getElementById('easyBtn').style.display = 'none';
    document.getElementById('mediumBtn').style.display = 'none';
    document.getElementById('hardBtn').style.display = 'none';
    document.getElementById('instruction-modal').style.display = 'none';

    // Set game background
    document.getElementById('fidrat-home').style.backgroundImage = 'url("Images/Common_Images/gamebg.png")';
    document.getElementById('fidrat-home').style.backgroundColor = 'lightgoldenrodyellow';

    // Reset game state
    score = 0;
    time = 0;
    currentLevel = 3; // Medium level starts at level 3

    // Start level 3 directly
    level3();

  });

  document.getElementById('hardBtn').addEventListener('click', function () {
    document.getElementById('fidrat-home').style.backgroundImage = 'url("Images/Common_Images/gamebg.png")';
    clearGame();
    level10();

    document.getElementById('para').style.display = 'none';
    document.getElementById('para1').style.display = 'none';
    document.getElementById('ie').style.display = 'none';
    document.getElementById('vv').style.display = 'none';
    document.getElementById('shanti').style.display = 'none';
    document.getElementById('prem').style.display = 'none';
    document.getElementById('game-title').style.display = 'none';
    document.getElementById('easyBtn').style.display = 'none';
    document.getElementById('mediumBtn').style.display = 'none';
    document.getElementById('hardBtn').style.display = 'none';
    document.getElementById('instruction-modal').style.display = 'none';
    document.getElementById('fidrat-home').style.backgroundColor = 'lightgoldenrodyellow';
  });
});


function clearGame() {
  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
  document.querySelectorAll('.ball').forEach(ball => ball.remove());
}





function level1() {
  isGameRunning = true;
  startTracking();
  currentLevel = 1;
  document.getElementById('para').style.display = 'none';
  document.getElementById('para1').style.display = 'none';
  document.getElementById('ie').style.display = 'none';
  document.getElementById('vv').style.display = 'none';
  document.getElementById('shanti').style.display = 'none';
  document.getElementById('prem').style.display = 'none';
  document.getElementById('game-title').style.display = 'none';
  document.getElementById('easyBtn').style.display = 'none';
  document.getElementById('mediumBtn').style.display = 'none';
  document.getElementById('hardBtn').style.display = 'none';
  document.getElementById('instruction-modal').style.display = 'none';
  document.getElementById('fidrat-home').style.backgroundColor = 'lightgoldenrodyellow';

  clearInterval(timer);
  clearInterval(ballCreationIntervalId);
  document.getElementById('score').style.display = 'block';
  document.getElementById('time').style.display = 'block';
  document.getElementById('time-value').innerText = time;
  document.getElementById('score-value').innerText = score;

  // Add event listener for clicking the balls


  timer = setInterval(() => {
    if (GAME_PAUSED) return;
    time++;
    document.getElementById('time-value').innerText = time;
    if (time >= 10) {
      clearInterval(timer);
      if (score >= 3) {
        levelCompleted = true;
        showGameOverAlert(true, 1);
        document.querySelectorAll('.ball').forEach(ball => ball.remove());
        level2();
      } else {
        showGameOverAlert(false, 1);
      }
    }
  }, 1000);

  ballCreationIntervalId = setInterval(() => {
    if (GAME_PAUSED) return;
    const ball = createRedBall();
    document.body.appendChild(ball);
    animateBall(ball);
  }, ballCreationInterval);


}



function showRestartButton() {
  if (!restartButton) {
    restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.innerText = 'Restart';
    restartButton.style.position = 'absolute';
    restartButton.style.top = '50%';
    restartButton.style.left = '50%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.fontSize = '24px';
    document.body.appendChild(restartButton);
    restartButton.addEventListener('click', restartGame);
  }
  restartButton.style.display = 'block';
}



function restartGame() {
  clearInterval(timer);
  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  score = 0;
  time = 0;

  document.getElementById('score-value').innerText = score;
  document.getElementById('time-value').innerText = time;

  document.querySelectorAll('.ball').forEach(ball => ball.remove());
  document.removeEventListener('click', clickBall);
  document.getElementById('basket').style.display = 'none';
  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
  document.getElementById('instruction-modal2').style.display = 'none';

  // Resume from currentLevel
  switch (currentLevel) {
    case 1:
      level1();
      break;
    case 2:
      forceUnpause();
      level2(true);

      break;
    case 3:
      level3();
      break;
    case 4:
      level4();
      break;
    case 5:
      level5();
      break;
    case 6:
      level6();
      break;
    case 7:
      level7();
      break;
    case 8:
      level8();
      break;
    case 9:
      level9();
      break;

    case 10:
      level10();
      break;

    case 11:
      level11();
      break;

    case 12:
      level12();
      break;

    case 13:
      level13();
      break;

    case 14:
      level14();
      break;

    case 15:
      level15();
      break;
    default:
      level1(); // fallback
  }
}




function animateBall(ball) {
  let position = window.innerHeight;
  const speed = 2;
  const gameAreaHeight = window.innerHeight;


  function updatePosition() {
    if (GAME_PAUSED) return;
    position -= speed;
    if (position > -40) {
      ball.style.top = position + 'px';
      requestAnimationFrame(updatePosition);
    } else {
      ball.remove();
    }
  }

  updatePosition();
}


function startGame() {
  document.getElementById('instruction-modal').style.display = 'block';
}


function clickBall(event) {
  if (currentLevel === 1) {
    const ball = event.target.closest('.ball');
    if (ball && ball.classList.contains('red')) {
      ball.style.cursor = "pointer";
      ball.remove();
      score++;
      document.getElementById('score-value').innerText = score;
    }
  }
}

function level2() {
  forceUnpause();
  isGameRunning = true;
  currentLevel = 2;
  score = 0;
  time = 0;

  // 1. Force hide the overlay and previous modal
  // We use getElementById to be safe, rather than relying on the variable 'overlay'
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('gameOver');
  const basketVideo = document.getElementById('Basketvideo');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const basketEl = document.getElementById('basket');

  if (overlay) overlay.style.display = 'none';
  if (modal) modal.style.display = 'none';
  if (basketVideo) basketVideo.style.display = 'none';
  if (scoreEl) scoreEl.style.display = 'none';
  if (timeEl) timeEl.style.display = 'none';
  if (basketEl) basketEl.style.display = 'none';

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.ball').forEach(b => b.remove());

  // 2. IMMEDIATELY show the Level 2 instructions (Do not wait for 'next' click)
  const instrModal2 = document.getElementById('instruction-modal2');
  if (instrModal2) {
    instrModal2.style.display = 'block';
  }

  // 3. Set up the "Start Level 2" button
  const startBtn = document.getElementById('start-level2-button');
  if (startBtn) {
    startBtn.onclick = () => {
      instrModal2.style.display = 'none';

      // Show game UI
      scoreEl.style.display = 'block';
      timeEl.style.display = 'block';
      basketEl.style.display = 'block';

      document.getElementById('score-value').innerText = score;
      document.getElementById('time-value').innerText = time;

      clearInterval(timerInterval);

      // Start the timer
      timerInterval = setInterval(() => {
        if (GAME_PAUSED) return;

        time++;
        document.getElementById('time-value').innerText = time;

        if (time >= 10) {
          clearInterval(timerInterval);
          if (score >= 1) {
            showGameOverAlert(true, 2);
          } else {
            showGameOverAlert(false, 2);
          }
        }
      }, 1000);

      generateBalllevel2();
    };
  }

  // ... Keep your generateBalllevel2 and other helper functions below ...
  
  function generateBalllevel2() {
    const ball = document.createElement("div");
    ball.className = "ball red";
    ball.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    ball.style.top = `50px`;
    document.body.appendChild(ball);
    enableBallDrag(ball);
  }

  function enableBallDrag(ball) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    ball.addEventListener("pointerdown", e => {
      if (GAME_PAUSED) return;
      dragging = true;
      IS_DRAGGING = true;
      ball.setPointerCapture(e.pointerId);
      const rect = ball.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    ball.addEventListener("pointermove", e => {
      if (!dragging || GAME_PAUSED) return;
      requestAnimationFrame(() => {
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(0, Math.min(window.innerWidth - ball.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - ball.offsetHeight, y));
        ball.style.left = x + "px";
        ball.style.top = y + "px";
      });
    });

    ball.addEventListener("pointerup", e => {
      dragging = false;
      IS_DRAGGING = false;
      ball.releasePointerCapture(e.pointerId);
      checkDrop(ball);
    });

    ball.addEventListener("pointercancel", () => {
      dragging = false;
      IS_DRAGGING = false;
    });
  }

  function checkDrop(ball) {
    const basket = document.getElementById("basket");
    const b = basket.getBoundingClientRect();
    const r = ball.getBoundingClientRect();
    const t = 10;

    if (
      r.left >= b.left - t &&
      r.right <= b.right + t &&
      r.top >= b.top - t &&
      r.bottom <= b.bottom + t
    ) {
      ball.remove();
      score++;
      document.getElementById("score-value").innerText = score;
      if (score < 5) {
        generateBalllevel2();
      }
    }
  }
}



// Function to generate obstacles
function generateObstacles(obstacles) {
  obstacles.forEach(obstacle => {
    const div = document.createElement('div');
    div.classList.add('obstacle');
    div.style.top = `${obstacle.top}vh`;
    div.style.left = `${obstacle.left}vw`;
    div.style.width = `${obstacle.width}vw`;
    div.style.height = `${obstacle.height}vh`;
    maze.appendChild(div);

    obstacleCoordinates.push({
      left: obstacle.left * window.innerWidth / 100, // Convert to pixel value
      top: obstacle.top * window.innerHeight / 100,  // Convert to pixel value
      width: obstacle.width * window.innerWidth / 100, // Convert to pixel value
      height: obstacle.height * window.innerHeight / 100 // Convert to pixel value
    });
  });
}
function checkCollisionWithObstacle(x, y) {
  for (let i = 0; i < obstacleCoordinates.length; i++) {
    const obstacle = obstacleCoordinates[i];

    if (
      x >= obstacle.left &&
      x <= obstacle.left + obstacle.width &&
      y >= obstacle.top &&
      y <= obstacle.top + obstacle.height
    ) {
      return true;
    }
  }
  return false;
}

document.addEventListener('click', function (event) {
  let x = event.clientX;
  let y = event.clientY;

  if (checkCollisionWithObstacle(x, y)) {
    let clickKey = new Date().getTime(); // Using timestamp for a unique key
    mouseClickCoordinates[clickKey] = { x, y };

    console.log(`Click recorded at: (${x}, ${y}) due to collision with an obstacle`);
    console.log(mouseClickCoordinates); // Print out the updated dictionary with collisions
  }
});

// Function to generate a draggable ball
function generateBall(left, bottom, currentLevel) {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.left = left;
  ball.style.bottom = bottom;

  document.body.appendChild(ball);


  let currentFrame = 1;

  // Set the initial frame
  ball.style.backgroundImage = `url('Images/Dream_Drop/ball1.png')`;
  ball.style.backgroundSize = "contain";
  ball.style.backgroundRepeat = "no-repeat";


  // Increment frame counter to cycle through the images
  function nextFrame() {
    currentFrame = (currentFrame % 9) + 1; // Cycling through frames from 1 to 9
    ball.style.backgroundImage = `url('Images/Dream_Drop/ball1.png')`;
  }


  const animationInterval = setInterval(nextFrame, 100);

  ball.addEventListener('mousedown', startDrag);

  let isDragging = false;
  let offsetX, offsetY;

  function startDrag(event) {


    const ballRect = ball.getBoundingClientRect();
    offsetX = (event.clientX - ballRect.left) / window.innerWidth * 100;
    offsetY = (event.clientY - ballRect.top) / window.innerHeight * 100;
    isDragging = true;

    ball.style.zIndex = "1000";
    document.addEventListener("mousemove", drag);

    document.addEventListener("mouseup", endDrag);

    // Prevent default behavior to avoid text selection
    event.preventDefault();


  }

  function drag(e) {
    if (isDragging) {

      const ballRect = ball.getBoundingClientRect();
      // Calculate the new position of the ball 
      let newX = (e.clientX - offsetX) / window.innerWidth * 100;
      let newY = (window.innerHeight - e.clientY - offsetY) / window.innerHeight * 100;

      // Ensure that the ball stays within the bounds of the viewport
      newX = Math.max(0, Math.min(100 - ballRect.width / window.innerWidth * 100, newX)); // Ensure it doesn't go beyond viewport width
      newY = Math.max(0, Math.min(100 - ballRect.height / window.innerHeight * 100, newY)); // Ensure it doesn't go beyond viewport height

      // Update the position of the ball
      ball.style.left = `${newX}vw`;
      ball.style.bottom = `${newY}vh`;

    }
    if (!e.buttons) {
      endDrag();
    }
    Collision();
  }

  function Collision() {
    const ballRect = ball.getBoundingClientRect();
    const obstacles = document.querySelectorAll('.obstacle');
    const buffer = Math.min(ballRect.width, ballRect.height) * 0.1088;

    obstacles.forEach(obstacle => {
      const obstacleRect = obstacle.getBoundingClientRect();
      if (
        ballRect.right - buffer > obstacleRect.left &&
        ballRect.left + buffer < obstacleRect.right &&
        ballRect.bottom - buffer > obstacleRect.top &&
        ballRect.top + buffer < obstacleRect.bottom
      ) {
        endDrag();
        showGameOverAlert(false, currentLevel);
      }
    });
  }

  function endDrag() {
    isDragging = false;
    ball.style.zIndex = "0";
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", endDrag);
    checkDrop(ball);

  }
}

// Function to check if the dragged ball is dropped into the basket
function checkDrop(ball, basketId, currentLevel) {
  const basket = document.getElementById('basket');
  const basketRect = basket.getBoundingClientRect();

  const balls = document.querySelectorAll('.ball');

  balls.forEach(ball => {
    const ballRect = ball.getBoundingClientRect();
    const basketCenterX = (basketRect.left + basketRect.right) / 2;
    const basketCenterY = (basketRect.top + basketRect.bottom) / 2;

    // Check if the ball's position is within the basket
    if (
      ballRect.left >= basketRect.left &&
      ballRect.right <= basketRect.right &&
      ballRect.top >= basketRect.top &&
      ballRect.bottom <= basketRect.bottom &&
      ballRect.left <= basketCenterX &&
      ballRect.right >= basketCenterX &&
      ballRect.top <= basketCenterY &&
      ballRect.bottom >= basketCenterY
    ) {
      // Ball is dropped into the basket
      ball.remove();
      showGameOverAlert(true, currentLevel);

      document.querySelectorAll('.ball').forEach(ball => ball.remove());


    }
  });
}


function showGameOverAlert(levelCompleted, currentLevel) {
  isGameRunning = false;
  wasPausedByFocus = false;

  pauseGame();
  document.querySelectorAll('obstacle').display = 'none';
  const modal = document.getElementById('gameOver');
  const restartBtn = document.getElementById('restartBtn');
  const quitBtn = document.getElementById('quitBtn');
  const Next = document.getElementById('next');
  clearGame();
  const message = document.getElementById('gameOverMessage');

  if (levelCompleted) {
    stopTrackingAndExport(`level ${currentLevel}`);
    message.innerText = "You have cleared the level " + currentLevel;
    // Hide the restart and quit buttons, display next button
    document.getElementById('Basketvideo').style.display = 'block';
    const basketVid = document.getElementById('Basketvideo');
    basketVid.currentTime = 0;   // restart from beginning
    basketVid.play().catch(err => console.log("Autoplay blocked:", err));
    document.getElementById('tryvideo').style.display = 'none';
    restartBtn.style.display = 'none';
    quitBtn.style.display = 'block';
    Next.style.display = 'block';
    Next.onclick = function () {
      resumeGame();
      document.getElementById('Basketvideo').style.display = 'none';
      document.getElementById('tryvideo').style.display = 'none';
      document.getElementById('gameOver').style.display = "none" 
      modal.style.display = 'none';
      overlay.style.display = 'none';
      nextLevelFunction(currentLevel + 1)
    }
    quitBtn.onclick = function () {
      document.getElementById('Basketvideo').style.display = 'none';
      document.getElementById('tryvideo').style.display = 'none';
      modal.style.display = 'none';
      overlay.style.display = 'none';
      location.reload();
    }

  }


  else {
    stopTrackingAndExport(`level${currentLevel}`);
    message.innerText = "Game Over! Do you want to restart?";
    document.getElementById('Basketvideo').style.display = 'none';
    document.getElementById('tryvideo').style.display = 'block';
    const tryVid = document.getElementById('tryvideo');
    tryVid.currentTime = 0;   // restart from beginning
    tryVid.play().catch(err => console.log("Autoplay blocked:", err));
    // Show the restart and quit buttons, hide next button
    restartBtn.style.display = 'block';
    quitBtn.style.display = 'block';
    Next.style.display = 'none';
    restartBtn.onclick = function () {
      overlay.style.display = 'none';
      document.getElementById('Basketvideo').style.display = 'none';
      document.getElementById('tryvideo').style.display = 'none';
      resumeGame();
      modal.style.display = 'none';
      restartGame();
    }
    quitBtn.onclick = function () {
      overlay.style.display = 'none';
      document.getElementById('Basketvideo').style.display = 'none';
      document.getElementById('tryvideo').style.display = 'none';
      modal.style.display = 'none';
      location.reload();
    }
  }

  overlay.style.display = 'none';
  modal.style.display = 'block';

}


// Define nextLevelFunction
function nextLevelFunction(currentLevel) {


  clearInterval(timer);
  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  console.log("Moving to level " + currentLevel + "...");
  // Check if all levels are completed
  if (currentLevel <= 15) {
    // Call the next level function based on the current level
    switch (currentLevel) {

      case 2:
        level2();
        break;
      case 3:
        level3();
        break;
      case 4:
        level4();
        break;
      case 5:
        level5();
        break;
      case 6:
        level6();
        break;
      case 7:
        level7();
        break;
      case 8:
        level8();
        break;
      case 9:
        level9();
        break;

      case 10:
        level10();
        break;

      case 11:
        level11();
        break;

      case 12:
        level12();
        break;

      case 13:
        level13();
        break;

      case 14:
        level14();
        break;

      case 15:
        level15();
        break;

      default:
        alert("Congratulations! You have completed all levels.");
        // Optionally, perform other actions when all levels are completed
        break;
    }
  } else {
    alert("Congratulations! You have completed all levels.");
    // If the user completed the last level
    setTimeout(function () {
      window.location.href = './index.html';  // Redirect to the home page
    }, 500);  // Delay for .5 seconds before redirecting


    // Optionally, perform other actions when all levels are completed
  }
}


const ball = document.querySelectorAll('.ball'); // Get the ball element
let currentLevel = 0;

function level3() {
  startTracking();
  isGameRunning = true;


  currentLevel = 3;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '6vh';
  document.getElementById('basket').style.left = '52vw';
  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());

  const obstacles = [
    { top: 5, left: 0, width: 35, height: 25 },
    { top: 5, left: 70, width: 35, height: 25 },
    { top: 30, left: 0, width: 20, height: 60 },
    { top: 30, left: 80, width: 20, height: 60 },
    { top: 50, left: 42, width: 20, height: 6 }
  ];


  generateObstacles(obstacles);
  generateBall(`${(50 - ballWidth / (2 * window.innerWidth))}vw`, '5vh', currentLevel);


  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level4` are defined elsewhere
  });




}


function level4() {
  isGameRunning = true;

  startTracking();
  currentLevel = 4;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';

  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '8vh';
  document.getElementById('basket').style.left = '80vw';

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.obstacle').forEach(o => o.remove());

  const obstacles = [
    { top: 0, left: 0, width: 100, height: 5 },
    { top: 20, left: 10, width: 60, height: 5 },
    { top: 45, left: 30, width: 40, height: 5 },
    { top: 70, left: 50, width: 45, height: 5 },
    { top: 95, left: 0, width: 100, height: 5 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 }
  ];

  generateObstacles(obstacles);
  generateBall('7vw', '8vh', currentLevel);

  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel);
  });
}


//########################

function level5() {
  isGameRunning = true;

  startTracking();
  currentLevel = 5;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';

  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '20vh';
  document.getElementById('basket').style.left = '5vw';

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.obstacle').forEach(o => o.remove());

  const obstacles = [
    { top: 10, left: 30, width: 40, height: 5 },
    { top: 30, left: 60, width: 40, height: 5 },
    { top: 55, left: 0, width: 40, height: 5 },
    { top: 80, left: 20, width: 60, height: 5 },
    { top: 0, left: 0, width: 100, height: 5 },
    { top: 95, left: 0, width: 100, height: 5 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 }
  ];

  generateObstacles(obstacles);
  generateBall('90vw', '5vh', currentLevel);

  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel);
  });
}

function level6() {
  isGameRunning = true;

  startTracking();

  currentLevel = 6;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';

  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '5vh';
  document.getElementById('basket').style.left = '43vw';

  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());


  const obstacles = [
    { top: 0, left: 50, width: 21, height: 26 },
    { top: 21, left: 20, width: 35, height: 5 },
    { top: 24, left: 20, width: 3, height: 50 },
    { top: 74, left: 20, width: 15, height: 5 },
    { top: 45, left: 50, width: 25, height: 5 },
    { top: 50, left: 60, width: 3, height: 50 },
    { top: 45, left: 75, width: 3, height: 30 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 95, left: 0, width: 100, height: 5 },
    { top: 0, left: 97, width: 3, height: 100 },
  ];



  generateObstacles(obstacles);
  generateBall('70vw', '35vh', currentLevel);


  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });

}



function level7() {
  isGameRunning = true;

  startTracking();
  currentLevel = 7;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '48vh';
  document.getElementById('basket').style.left = '85vw';


  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());



  const obstacles = [
    { top: 0, left: 0, width: 100, height: 5 },
    { top: 27, left: 60, width: 3, height: 18 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 25, left: 0, width: 50, height: 5 },
    { top: 27, left: 60, width: 28, height: 5 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 44, left: 50, width: 27, height: 6 },
    { top: 44, left: 75, width: 5, height: 32 },
    { top: 45, left: 50, width: 5, height: 40 },
    { top: 70, left: 15, width: 35, height: 15 },
    { top: 66, left: 80, width: 20, height: 10 },
    { top: 5, left: 50, width: 6, height: 10 },
  ];




  generateObstacles(obstacles);
  generateBall('90vw', '3vh', currentLevel);

  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });



}






function level8() {
  isGameRunning = true;

  startTracking();

  currentLevel = 8;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '5vh';
  document.getElementById('basket').style.left = '4vw';

  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());






  const obstacles = [
    { top: 40, left: 20, width: 2, height: 22 },
    { top: 70, left: 80, width: 12, height: 4 },
    { top: 19, left: 20, width: 15, height: 4 },
    { top: 19, left: 20, width: 2, height: 25 },
    { top: 40, left: 0, width: 20, height: 4 },
    { top: 13, left: 58, width: 2, height: 70 },
    { top: 30, left: 59, width: 20, height: 3 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 80, left: 20, width: 40, height: 4 },
    { top: 70, left: 80, width: 2, height: 30 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 0, left: 0, width: 100, height: 3 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 96, left: 0, width: 100, height: 300 },
    { top: 0, left: 98, width: 2, height: 100 },
    { top: 0, left: 0, width: 0, height: 0 },
  ];

  generateObstacles(obstacles);
  generateBall('85vw', '5vh', currentLevel);

  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });




}






function level9() {
  isGameRunning = true;

  startTracking();
  currentLevel = 9;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';

  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '8vh';
  document.getElementById('basket').style.left = '10vw';

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.obstacle').forEach(o => o.remove());

  // Redesigned obstacles - maze-like but passable
  const obstacles = [
    { top: 0, left: 0, width: 100, height: 3 },
    { top: 95, left: 0, width: 100, height: 3 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },

    { top: 20, left: 20, width: 60, height: 3 },
    { top: 40, left: 0, width: 40, height: 3 },
    { top: 60, left: 60, width: 40, height: 3 },
    { top: 75, left: 30, width: 40, height: 3 },

    { top: 20, left: 20, width: 3, height: 55 },
  ];

  generateObstacles(obstacles);

  // Ball spawns at bottom center
  generateBall('50vw', '5vh', currentLevel);

  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel);
  });
}







function level10() {
  isGameRunning = true;

  startTracking();
  currentLevel = 10;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '7vh';
  document.getElementById('basket').style.left = '7vw';

  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);
  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());




  const obstacles = [
    { top: 0, left: 20, width: 12, height: 50 },
    { top: 70, left: 0, width: 72, height: 10 },
    { top: 20, left: 60, width: 12, height: 50 },
    { top: 50, left: 85, width: 15, height: 5 },
    { top: 70, left: 72, width: 10, height: 5 },
    { top: 30, left: 45, width: 40, height: 5 },
    { top: 65, left: 23, width: 6, height: 5 },
    { top: 0, left: 0, width: 100, height: 5 },
    { top: 95, left: 0, width: 100, height: 5 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 0, left: 0, width: 0, height: 0 },

  ];

  generateObstacles(obstacles);
  generateBall('8vw', '6vh', currentLevel);

  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });





}


function level11() {
  isGameRunning = true;

  startTracking();

  currentLevel = 11;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '6vh';
  document.getElementById('basket').style.left = '5vw';

  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);


  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());



  const obstacles = [
    { top: 0, left: 10, width: 90, height: 5 },
    { top: 28, left: 0, width: 60, height: 5 },
    { top: 44, left: 40, width: 60, height: 5 },
    { top: 60, left: 25, width: 50, height: 5 },
    { top: 75, left: 17, width: 2, height: 25 },
    { top: 75, left: 7, width: 2, height: 25 },
    { top: 80, left: 60, width: 50, height: 5 },
    { top: 95, left: 0, width: 50, height: 5 },
    { top: 18, left: 60, width: 2, height: 15 },

  ];

  generateObstacles(obstacles);
  generateBall('95vw', '4vh', currentLevel);

  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });




}


function level12() {
  isGameRunning = true;

  startTracking();

  currentLevel = 12;
  document.getElementById('score').style.display = 'none';
  document.getElementById('time').style.display = 'none';


  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '6vh';
  document.getElementById('basket').style.left = '7vw';
  const basket = document.getElementById('basket');

  clearInterval(timerInterval);
  clearInterval(ballCreationIntervalId);

  document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());







  const obstacles = [
    { top: 70, left: 0, width: 75, height: 11 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 0, left: 0, width: 0, height: 0 },
    { top: 0, left: 0, width: 100, height: 5 },
    { top: 95, left: 0, width: 100, height: 5 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 0, left: 0, width: 0, height: 0 },
  ];

  const obstacles2 = [
    { top: 10, left: 35, width: 3, height: 5, right: 45 }, // Moving towards right
    { top: 20, left: 45, width: 3, height: 5, right: 25 }, // Moving towards left
    { top: 30, left: 55, width: 3, height: 5, right: 65 }, // Moving towards right
    { top: 40, left: 65, width: 3, height: 5, right: 35 }, // Moving towards left
    { top: 50, left: 80, width: 3, height: 5, right: 15 }, // Moving towards right
    { top: 60, left: 85, width: 3, height: 5, right: 75 } // Moving towards left
  ]

  generateObstacles(obstacles);


  function createMovingObstacles() {
    obstacles2.forEach((obstacle, index) => {
      const div = document.createElement('div');
      div.classList.add('obstacle');
      div.style.top = `${obstacle.top}vh`;
      div.style.left = `${obstacle.left}vw`;
      div.style.width = `${obstacle.width}vw`;
      div.style.height = `${obstacle.height}vh`;
      maze.appendChild(div);


      const animationDuration = 1; // Duration of the animation in seconds

      // Calculate the relative distance from the starting point to the end point
      const relativeDistance = obstacle.left - obstacle.right;

      // Apply animation to move the obstacle
      div.style.animation = `moveObstacle${index} ${animationDuration}s linear infinite alternate`;

      // Define keyframes for the obstacle animation
      const keyframes = `
          @keyframes moveObstacle${index} {
              0% { left: ${obstacle.right}vw; }
              100% { left: ${obstacle.left}vw; } // Change 50 to adjust the horizontal distance
          }
      `;

      // Add the keyframes to the style element
      const style = document.createElement('style');
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    });
  }

  createMovingObstacles();
  generateBall('6vw', '6vh', currentLevel);

  // Event listener for checking drop
  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });




}


function level13() {
  isGameRunning = true;

  startTracking();
  currentLevel = 13;
  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '8vh';
  document.getElementById('basket').style.left = '85vw';


  // Static maze walls
  const obstacles = [
    { top: 0, left: 0, width: 100, height: 3 },
    { top: 95, left: 0, width: 100, height: 3 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 25, left: 15, width: 70, height: 3 },
    { top: 55, left: 15, width: 70, height: 3 },
    { top: 75, left: 35, width: 40, height: 3 }
  ];
  generateObstacles(obstacles);

  // Two fast horizontal moving bars
  addMovingObstacle('move13a', 40, 10, 30, 3, 10, 60, 'horizontal', 2);
  addMovingObstacle('move13b', 65, 50, 30, 3, 20, 70, 'horizontal', 2.2);

  generateBall('5vw', '6vh', currentLevel);

  document.addEventListener('mouseup', function () {
    checkDrop(ball, 'basket', currentLevel); // Assuming `ball` and `level5` are defined elsewhere
  });
}

function level14() {
  isGameRunning = true;

  startTracking();
  currentLevel = 14;
  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '10vh';
  document.getElementById('basket').style.left = '10vw';


  // Static zigzag
  const obstacles = [
    { top: 0, left: 0, width: 100, height: 3 },
    { top: 95, left: 0, width: 100, height: 3 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 30, left: 20, width: 60, height: 3 },
    { top: 60, left: 20, width: 60, height: 3 }
  ];
  generateObstacles(obstacles);

  // Two vertical moving pillars
  addMovingObstacle('move14a', 30, 40, 3, 20, 30, 70, 'vertical', 2.5);
  addMovingObstacle('move14b', 60, 55, 3, 25, 25, 75, 'vertical', 2.8);

  generateBall('90vw', '5vh', currentLevel);
}

function level15() {
  isGameRunning = true;

  startTracking();
  currentLevel = 15;
  document.getElementById('basket').style.display = 'block';
  document.getElementById('basket').style.top = '8vh';
  document.getElementById('basket').style.left = '45vw';


  // Frame + narrow path
  const obstacles = [
    { top: 0, left: 0, width: 100, height: 3 },
    { top: 95, left: 0, width: 100, height: 3 },
    { top: 0, left: 0, width: 3, height: 100 },
    { top: 0, left: 97, width: 3, height: 100 },
    { top: 40, left: 20, width: 60, height: 3 }
  ];
  generateObstacles(obstacles);

  // Four alternating moving walls
  addMovingObstacle('move15a', 20, 20, 30, 3, 10, 60, 'horizontal', 1.8);
  addMovingObstacle('move15b', 30, 60, 30, 3, 20, 70, 'horizontal', 2.2);
  addMovingObstacle('move15c', 55, 30, 3, 20, 30, 70, 'vertical', 2);
  addMovingObstacle('move15d', 70, 50, 3, 20, 20, 75, 'vertical', 2.5);

  generateBall('10vw', '6vh', currentLevel);
}

function addMovingObstacle(name, top, left, width, height, min, max, direction, speed) {
  const div = document.createElement('div');
  div.classList.add('obstacle');
  div.style.top = `${top}vh`;
  div.style.left = `${left}vw`;
  div.style.width = `${width}vw`;
  div.style.height = `${height}vh`;
  maze.appendChild(div);

  let anim;
  if (direction === 'horizontal') {
    anim = `
      @keyframes ${name} {
        0% { left: ${min}vw; }
        100% { left: ${max}vw; }
      }`;
    div.style.animation = `${name} ${speed}s linear infinite alternate`;
  } else {
    anim = `
      @keyframes ${name} {
        0% { top: ${min}vh; }
        100% { top: ${max}vh; }
      }`;
    div.style.animation = `${name} ${speed}s linear infinite alternate`;
  }

  const style = document.createElement('style');
  style.innerHTML = anim;
  document.head.appendChild(style);
}





// MOUSE TRACKING AND EXPORT SETUP
let mouseMovements = [];
let taskStartTime, taskEndTime;

document.addEventListener('mousemove', function (e) {
  const timestamp = Date.now();
  mouseMovements.push({ x: e.clientX, y: e.clientY, time: timestamp });
});

// Start tracking when a task begins
function startTracking() {
  taskStartTime = Date.now();
  mouseMovements = []; // reset
}
function stopTrackingAndExport(taskName = 'task') {
  taskEndTime = Date.now();
  const duration = (taskEndTime - taskStartTime) / 1000;

  let content = `Mouse Tracking for ${taskName}\n`;
  content += `Start Time: ${new Date(taskStartTime).toLocaleString()}\n`;
  content += `End Time: ${new Date(taskEndTime).toLocaleString()}\n`;
  content += `Duration: ${duration} seconds\n\n`;
  content += `X,Y,Timestamp\n`;

  mouseMovements.forEach(move => {
    content += `${move.x},${move.y},${new Date(move.time).toISOString()}\n`;
  });

  const formData = new FormData();
  formData.append('filename', `${taskName}_mouse_log.txt`);
  formData.append('content', content);

  fetch('save_mouse_data.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.text())
    .then(result => console.log('Mouse data saved:', result))
    .catch(error => console.error('Save failed:', error));
}

