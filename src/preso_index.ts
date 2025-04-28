// Function to generate transition data
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

let currentSlideIndex = 0;
let slides: HTMLElement[] = [];
let intervalId: number | null = null;

// Function to show a specific slide
function showSlide(index: number) {
  slides.forEach((slide, i) => {
    slide.classList.remove('displayed', 'pan-left', 'pan-right', 'pan-up', 'pan-down');
    if (i === index) {
      slide.classList.add('displayed');
    } else if (i < index) {
      slide.classList.add('pan-left');
    } else {
      slide.classList.add('pan-right');
    }
  });
}

// Function to go to the next slide
function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

// Function to go to the previous slide
function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
  showSlide(currentSlideIndex);
}

// Function to start the slideshow
function playSlideshow() {
  if (!intervalId) {
    intervalId = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  }
}

// Function to pause the slideshow
function pauseSlideshow() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Initialize buttons and slides
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
}

// Call initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializePresentation().then(initializeControls);
});

// Load the JSON file and initialize the presentation
async function initializePresentation() {
  // Add the CSS link dynamically
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'preso_styles.css';
  document.head.appendChild(link);

  // Fetch the JSON file
  const response = await fetch('preso_index.json');
  const data = await response.json();

  // Update the document title
  if (data.config && data.config.title) {
    document.title = data.config.title;
  }

  // Create the stage element
  const stage = document.createElement('div');
  stage.className = 'stage';
  document.body.appendChild(stage);

  // Add the chrome controls
  const chrome = document.createElement('div');
  chrome.className = 'chrome';
  stage.appendChild(chrome);

  ['btnPlay', 'btnPause', 'btnNext', 'btnPrev'].forEach((btnClass) => {
    const button = document.createElement('div');
    button.className = btnClass;
    chrome.appendChild(button);
  });

  // Add the description section
  const description = document.createElement('div');
  description.className = 'description';
  stage.appendChild(description);

  const toggleDescription = document.createElement('div');
  toggleDescription.className = 'btnToggleDescription';
  description.appendChild(toggleDescription);

  // Add slides and augment with transition data
  if (data.slides && Array.isArray(data.slides)) {
    const durationTransition = data.config?.durationTransition || '1s';

    data.slides.forEach((slide: any, index: number) => {
      // Augment slide with transition data
      const transitionData = generateTransitionData(index);
      Object.assign(slide, transitionData);

      if (slide.type === 'img') {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.style.transitionDuration = durationTransition;

        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = slide.title || '';
        slideDiv.appendChild(img);

        stage.appendChild(slideDiv);
      }
    });
  }

  // TODO: Implement slide transitions and button functionality
}
