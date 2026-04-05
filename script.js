const slides = document.querySelectorAll('.slide');
const tapLeft = document.querySelector('.tap-left');
const tapRight = document.querySelector('.tap-right');
const progressContainer = document.getElementById('progress-container');
const appContainer = document.getElementById('app');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const autonextToggle = document.getElementById('autonext-toggle');
const timerOverlay = document.getElementById('timer-overlay');
const giftWrapOverlay = document.getElementById('gift-wrap-overlay');

let currentIndex = 0;
let timer;
const duration = 6500;
let isPlaying = false;
let firstTap = false;
let autoNextPaused = false;
let contentUnlocked = false;

// === TIMER CONFIGURATION ===
// Set the unlock date and time here (YYYY, MM, DD, HH, MM, SS)
// Example: new Date(2024, 3, 6, 15, 30, 0) means April 6, 2024 at 3:30 PM
const UNLOCK_TIME = new Date(2026, 3, 6, 0, 00, 0); // Change this to your desired unlock date/time

function updateCountdown() {
  const now = new Date().getTime();
  const unlockMs = UNLOCK_TIME.getTime();
  const distance = unlockMs - now;

  if (distance <= 0 && !contentUnlocked) {
    // Content is unlocked - show gift wrap
    timerOverlay.classList.add('unlocked');
    giftWrapOverlay.style.display = 'flex';
    contentUnlocked = true;
    return;
  }

  // Calculate time units
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Update display
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

  // Update unlock time display
  document.getElementById('unlock-time').textContent = UNLOCK_TIME.toLocaleString();
}

// Initialize timer display
updateCountdown();
setInterval(updateCountdown, 1000);

// Hide gift wrap and controls if still locked
if (!timerOverlay.classList.contains('unlocked')) {
  musicToggle.style.display = 'none';
  autonextToggle.style.display = 'none';
  giftWrapOverlay.style.display = 'none';
} else {
  musicToggle.style.display = 'block';
  autonextToggle.style.display = 'block';
  giftWrapOverlay.style.display = 'flex';
}

// Show controls when unlocked
const observer = new MutationObserver(() => {
  if (timerOverlay.classList.contains('unlocked')) {
    musicToggle.style.display = 'block';
    autonextToggle.style.display = 'block';
  }
});
observer.observe(timerOverlay, { attributes: true, attributeFilter: ['class'] });

slides.forEach(() => {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.innerHTML = '<div class="progress-fill"></div>';
  progressContainer.appendChild(bar);
});
const fills = document.querySelectorAll('.progress-fill');

function resetFills() {
  fills.forEach((fill, index) => {
    fill.style.transition = 'none';
    if (index < currentIndex) fill.style.width = '100%';
    else fill.style.width = '0%';
  });
}

function triggerSlideAnimations(slide) {
  const dataBars = slide.querySelectorAll('.data-bar-fill');
  dataBars.forEach(bar => {
    bar.style.width = '0%'; 
    setTimeout(() => {
      bar.style.width = bar.getAttribute('data-width');
    }, 50); 
  });

  document.querySelectorAll('video').forEach(vid => vid.pause());
  
  const currentVideos = slide.querySelectorAll('video');
  currentVideos.forEach(vid => {
    vid.currentTime = 0;
    vid.play().catch(e => {});
  });

  if(slide.id === 'final-slide') {
    fireConfetti();
  }
}

function goToSlide(index) {
  clearTimeout(timer);
  if (index < 0) index = 0;
  
  if (index >= slides.length) {
    fills[fills.length - 1].style.width = '100%';
    return; 
  }

  currentIndex = index;
  slides.forEach(slide => slide.classList.remove('active'));
  
  const currentSlide = slides[currentIndex];
  currentSlide.classList.add('active');
  
  triggerSlideAnimations(currentSlide);
  resetFills();

  setTimeout(() => {
    fills[currentIndex].style.transition = `width ${duration}ms linear`;
    fills[currentIndex].style.width = '100%';
  }, 50);

  if (!autoNextPaused) {
    timer = setTimeout(() => {
      goToSlide(currentIndex + 1);
    }, duration);
  }
}

let confettiFired = false;
function fireConfetti() {
  if(confettiFired) return;
  confettiFired = true;
  const colors = ['#FF3366', '#00C9FF', '#EDDE5D', '#ffffff'];
  
  for(let i=0; i<60; i++) {
    let conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + '%';
    conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    conf.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
    conf.style.animationDelay = `${Math.random() * 1}s`;
    appContainer.appendChild(conf);
  }
}

musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    bgMusic.pause();
    musicToggle.innerHTML = '🔇 Muted';
  } else {
    bgMusic.play();
    musicToggle.innerHTML = '🔊 Playing';
  }
  isPlaying = !isPlaying;
  musicToggle.classList.toggle('playing');
});

autonextToggle.addEventListener('click', () => {
  autoNextPaused = !autoNextPaused;
  if (autoNextPaused) {
    autonextToggle.innerHTML = 'Autoplay: OFF';
    clearTimeout(timer);
  } else {
    autonextToggle.innerHTML = 'Autoplay: ON';
    timer = setTimeout(() => {
      goToSlide(currentIndex + 1);
    }, duration);
  }
  autonextToggle.classList.toggle('disabled');
});

function handleFirstTap() {
  if (!firstTap && !isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicToggle.innerHTML = '🔊 Playing';
      musicToggle.classList.add('playing');
    }).catch(() => {});
    firstTap = true;
  }
}

// Gift Wrap Click Handler
giftWrapOverlay.addEventListener('click', () => {
  giftWrapOverlay.classList.add('opened');
  
  // Show controls after unwrap animation
  setTimeout(() => {
    musicToggle.style.display = 'block';
    autonextToggle.style.display = 'block';
    
    // Start the slideshow
    handleFirstTap();
    goToSlide(0);
  }, 600);
});

tapLeft.addEventListener('click', () => {
  if (timerOverlay.classList.contains('unlocked')) {
    handleFirstTap();
    goToSlide(currentIndex - 1);
  }
});

tapRight.addEventListener('click', () => {
  if (timerOverlay.classList.contains('unlocked')) {
    handleFirstTap();
    goToSlide(currentIndex + 1);
  }
});

// Start slideshow only if content is unlocked
if (timerOverlay.classList.contains('unlocked')) {
  goToSlide(0);
}