type Vibrant = {
  from(src: string): {
    getPalette(): Promise<{
      Vibrant?: { getHex(): string };
      Muted?: { getHex(): string };
      DarkVibrant?: { getHex(): string };
      LightVibrant?: { getHex(): string };
      DarkMuted?: { getHex(): string };
      LightMuted?: { getHex(): string };
      [key: string]: any;
    }>;
  };
};

declare interface Window {
  Vibrant: Vibrant;
}

let currentSlideIndex = 0;
let slides: HTMLElement[] = [];
let intervalId: number | null = null;
let durationSlide = 5000;

function generateTransitionData(index: number) {
  const directions = ['left', 'right', 'up', 'down'];
  const introDirection = directions[index % directions.length]; // Cycle through directions
  const outroDirection = directions[(index + 2) % directions.length]; // Opposite direction

  return {
    introPan: introDirection,
    outroPan: outroDirection,
    reversePan: outroDirection, // Reverse when returning to the slide
    zoomLevel: Math.random() * 0.5 + 1 // Random zoom between 1x and 1.5x
  };
}

function showSlide(index: number) {
  slides.forEach((slide, i) => {
    slide.classList.remove(
      'displayed',
      'pan-left',
      'pan-right',
      'pan-up',
      'pan-down',
      'zoom-in',
      'zoom-out'
    );

    if (i === index) {
      const transitionData = generateTransitionData(index);
      slide.classList.add('displayed', `pan-${transitionData.introPan}`, `zoom-in`);
    } else if (i < index) {
      slide.classList.add('pan-left');
    } else {
      slide.classList.add('pan-right');
    }
  });
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
  showSlide(currentSlideIndex);
}

function playSlideshow() {
  if (!intervalId) {
    // TODO : this needs to be dynamic as read from the JSON file
    intervalId = Number( setInterval( nextSlide, durationSlide ) );
  }
}

function pauseSlideshow() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function initializeControls() {
  const btnPlay = document.querySelector('.btnPlay') as HTMLElement;
  const btnPause = document.querySelector('.btnPause') as HTMLElement;
  const btnNext = document.querySelector('.btnNext') as HTMLElement;
  const btnPrev = document.querySelector('.btnPrev') as HTMLElement;

  btnPlay.addEventListener('click', playSlideshow);
  btnPause.addEventListener('click', pauseSlideshow);
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  slides = Array.from(document.querySelectorAll('.slide')) as HTMLElement[];
  showSlide(currentSlideIndex);

  playSlideshow();
}

async function initializePresentation() {
  console.log( 'preso initializePresentation...' );
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'preso_styles.css';
  document.head.appendChild(link);

  const response = await fetch('preso_index.json');
  const data = await response.json();

  data?.config?.title && ( document.title = data.config.title );
  data?.config?.durationSlide && ( durationSlide = data.config.durationSlide );

  const stage = document.createElement('div');
  stage.className = 'stage';
  document.body.appendChild(stage);

  const chrome = document.createElement('div');
  chrome.className = 'chrome';
  stage.appendChild(chrome);

  ['btnPlay', 'btnPause', 'btnNext', 'btnPrev'].forEach((btnClass) => {
    const button = document.createElement('div');
    button.className = btnClass;
    chrome.appendChild(button);
  });

  const description = document.createElement('div');
  description.className = 'description';
  stage.appendChild(description);

  const toggleDescription = document.createElement('div');
  toggleDescription.className = 'btnToggleDescription';
  description.appendChild(toggleDescription);

  if (data.slides && Array.isArray(data.slides)) {
    const durationTransition = data.config?.durationTransition || '1s';

    data.slides.forEach((slide: any, index: number) => {
      const transitionData = generateTransitionData(index);
      Object.assign(slide, transitionData);

      if (slide.type === 'img') {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.style.transitionDuration = durationTransition;

        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = slide.title || '';

        img.onload = async () => {
          try {
            const palette = await ( window.Vibrant as Vibrant ).from(img.src).getPalette();
            if (palette.DarkMuted) {
              slideDiv.style.backgroundColor = palette.DarkMuted.getHex();
            }
          } catch (err) {
            console.error(`Error extracting colors for image ${img.src}:`, err);
          }
        };

        slideDiv.appendChild(img);
        stage.appendChild(slideDiv);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const vibrantScript = document.createElement('script');
  vibrantScript.onload = () => initializePresentation().then(initializeControls);
  vibrantScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/node-vibrant/3.1.6/vibrant.min.js';
  vibrantScript.async = true;

  vibrantScript.onerror = () => {
    console.error('Failed to load the Vibrant library.');
  };

  document.head.appendChild(vibrantScript);
});
