const slides = document.querySelectorAll('.slide');
const tapLeft = document.querySelector('.tap-left');
const tapRight = document.querySelector('.tap-right');
const progressContainer = document.getElementById('progress-container');
const appContainer = document.getElementById('app');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const autonextToggle = document.getElementById('autonext-toggle');

let currentIndex = 0;
let timer;
const duration = 6500;
let isPlaying = false;
let firstTap = false;
let autoNextPaused = false;

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

tapLeft.addEventListener('click', () => {
  handleFirstTap();
  goToSlide(currentIndex - 1);
});

tapRight.addEventListener('click', () => {
  handleFirstTap();
  goToSlide(currentIndex + 1);
});

goToSlide(0);