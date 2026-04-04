const slides = document.querySelectorAll('.slide');
const tapLeft = document.querySelector('.tap-left');
const tapRight = document.querySelector('.tap-right');
const progressContainer = document.getElementById('progress-container');
const appContainer = document.getElementById('app');

let currentIndex = 0;
let timer;
const duration = 6500; 

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

  // --- NEW: Video Play/Pause Logic ---
  // Pause any playing videos on all slides
  document.querySelectorAll('video').forEach(vid => vid.pause());
  
  // If the new current slide has a video, reset it to the beginning and play it
  const currentVideo = currentSlide.querySelector('video');
  if (currentVideo) {
    currentVideo.currentTime = 0;
    currentVideo.play();
  }
  // -----------------------------------
  
  triggerSlideAnimations(currentSlide);
  resetFills();

  setTimeout(() => {
    fills[currentIndex].style.transition = `width ${duration}ms linear`;
    fills[currentIndex].style.width = '100%';
  }, 50);

  timer = setTimeout(() => {
    goToSlide(currentIndex + 1);
  }, duration);
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

tapLeft.addEventListener('click', () => goToSlide(currentIndex - 1));
tapRight.addEventListener('click', () => goToSlide(currentIndex + 1));

goToSlide(0);

// --- MUSIC PLAYER LOGIC ---
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let isPlaying = false;
let firstTap = false;

// 1. Toggle button functionality
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

// 2. Auto-start music on the very first screen tap
function handleFirstTap() {
  if (!firstTap && !isPlaying) {
    // The play() method returns a promise that can be caught if the browser blocks it
    bgMusic.play().then(() => {
      isPlaying = true;
      musicToggle.innerHTML = '🔊 Playing';
      musicToggle.classList.add('playing');
    }).catch((error) => {
      console.log('Autoplay was prevented by the browser.');
    });
    firstTap = true;
  }
}

// 3. Attach the tap check to your existing tap zones
tapLeft.addEventListener('click', handleFirstTap);
tapRight.addEventListener('click', handleFirstTap);