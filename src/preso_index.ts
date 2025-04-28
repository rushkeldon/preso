/*
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
*/

type Slide = {
  description : string;
  src : string;
  title : string;
  type : 'img'; // might extend later
  introPan : string;
  outroPan : string;
  zoomLevel : number;
}

type SlideTransitionData = {
  introPan : string;
  outroPan : string;
  zoomLevel : number;
}

type PresoData = {
  config : {
    title : string;
    description : string;
    author : string;
    durationView : string;
    durationTransition : string;
  };
  slides : Slide[];
}

let currentSlideIndex = 0;
let slideDivs : HTMLDivElement[] = [];
let intervalId : number;
let durationSlide = 5000;
let presoData : PresoData;
let trashBin : HTMLDivElement;

const slideBuffer = 3;

function generateTransitionData( index : number ) : SlideTransitionData {
  const directions = [ 'left', 'right', 'up', 'down' ];
  const introDirection = directions[ index % directions.length ];
  const outroDirection = directions[ (index + 2) % directions.length ];

  return {
    introPan : introDirection,
    outroPan : outroDirection,
    zoomLevel : Math.random() * 0.5 + 1 // Random zoom between 1x and 1.5x
  };
}

function displaySlide( index : number ) {
  const descriptionDiv = document.querySelector( '.description' ) as HTMLDivElement;
  descriptionDiv.innerHTML = presoData?.slides?.[ index ]?.description || '';
  slideDivs.forEach( ( slide, i ) => {
    slide.classList.remove(
      'displayed',
      'pan-left',
      'pan-right',
      'pan-up',
      'pan-down',
      'zoom-in',
      'zoom-out'
    );

    switch( true ) {
      case i === index :
        slide.classList.add( 'displayed', `pan-${presoData?.slides?.[ index ]?.introPan ?? 'left'}`, `zoom-in` );
        break;
      case i < index :
        slide.classList.add( 'pan-left', 'zoom-out' );
        break;
      default :
        slide.classList.add( 'pan-right', 'zoom-out' );
    }
  } );

  preCacheAndGarbageCollect( index );
}

function preCacheAndGarbageCollect( index : number ) {
  slideDivs.forEach( ( slideDiv, i ) => {
    if( i < index - slideBuffer || i > index + slideBuffer ) {
      unloadSlideImage( i );
    } else if( !slideDiv.querySelector( 'img' ) ) {
      loadSlideImage( i );
    }
  } );
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slideDivs.length;
  displaySlide( currentSlideIndex );
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + slideDivs.length) % slideDivs.length;
  displaySlide( currentSlideIndex );
}

function playSlideshow() {
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLElement;
  btnPause.classList.add( 'displayed' );
  btnPlay.classList.remove( 'displayed' );
  if( !intervalId ) {
    intervalId = Number( setInterval( nextSlide, durationSlide ) );
  }
}

function pauseSlideshow() {
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLElement;
  btnPause.classList.remove( 'displayed' );
  btnPlay.classList.add( 'displayed' );
  if( intervalId ) {
    clearInterval( intervalId );
    intervalId = 0;
  }
}

function initializeControls() {
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLElement;
  const btnNext = document.querySelector( '.btnNext' ) as HTMLElement;
  const btnPrev = document.querySelector( '.btnPrev' ) as HTMLElement;

  btnPrev.addEventListener( 'click', () => prevSlide() );
  btnPlay.addEventListener( 'click', playSlideshow );
  btnPause.addEventListener( 'click', pauseSlideshow );
  btnNext.addEventListener( 'click', () => nextSlide() );

  displaySlide( currentSlideIndex );

  playSlideshow();
}

async function initializePresentation() {
  const link = document.createElement( 'link' );
  link.rel = 'stylesheet';
  link.href = 'preso_styles.css';
  document.head.appendChild( link );

  const response = await fetch( 'preso_index.json' );
  const data = await response.json();
  presoData = data;

  data?.config?.title && (document.title = data.config.title);
  data?.config?.durationSlide && (durationSlide = data.config.durationSlide);

  const stage = document.createElement( 'div' );
  stage.className = 'stage';
  document.body.appendChild( stage );

  const chrome = document.createElement( 'div' );
  chrome.className = 'chrome';
  stage.appendChild( chrome );

  [ 'btnPrev', 'btnPlay', 'btnPause', 'btnNext' ].forEach( ( btnClass ) => {
    const button = document.createElement( 'div' );
    button.className = btnClass;
    chrome.appendChild( button );
  } );

  const description = document.createElement( 'div' );
  description.className = 'description displayed';
  stage.appendChild( description );

  const btnToggleDescription = document.createElement( 'div' );
  btnToggleDescription.className = 'btnToggleDescription';
  stage.appendChild( btnToggleDescription );
  btnToggleDescription.addEventListener( 'click', () => {
    const descriptionDiv = document.querySelector( '.description' ) as HTMLDivElement;
    descriptionDiv.classList.toggle( 'displayed' );
  } );

  if( data.slides && Array.isArray( data.slides ) ) {
    const durationTransition = data.config?.durationTransition || '1s';

    data.slides.forEach( ( slide : any, index : number ) => {
      const transitionData = generateTransitionData( index );
      Object.assign( slide, transitionData );

      const slideDiv = document.createElement( 'div' );
      slideDiv.setAttribute( 'data-index', index.toString() );
      slideDiv.className = 'slide';
      slideDiv.style.transitionDuration = durationTransition;
      stage.appendChild( slideDiv );
      slideDivs.push( slideDiv );

      // load the first 4
      if( slide.type === 'img' && index < 4 ) loadSlideImage( index );
    } );
  }

  trashBin = document.createElement( 'div' );
}

function loadSlideImage( index : number ) {
  if( isNaN( index ) ) return;
  const slideDiv = slideDivs[ index ];
  if( !slideDiv ) return;
  let img = slideDiv.querySelector( 'img' );

  if( !img ) {
    const slide = presoData.slides[ index ];
    img = document.createElement( 'img' );
    img.src = slide.src;
    img.alt = slide?.title ?? '';

    /* // consider bringing back the vibrant implementation later...
    img.onload = async () => {
      try {
        const palette = await ( window.Vibrant as Vibrant ).from(img.src).getPalette();
        if (palette.Muted) {
          slideDiv.style.backgroundColor = palette.Muted.getHex();
        }
      } catch (err) {
        console.error(`Error extracting colors for image ${img.src}:`, err);
      }
    };
    */
    slideDiv.appendChild( img );
  }
}

function unloadSlideImage( index : number ) {
  if( isNaN( index ) ) return;
  const slideDiv = slideDivs[ index ];
  if( !slideDiv ) return;
  let img = slideDiv?.querySelector( 'img' );

  if( img ) {
    trashBin.appendChild( img );
    trashBin.innerHTML = '';
  }
}

document.addEventListener( 'DOMContentLoaded', () => {
  /*
  const vibrantScript = document.createElement('script');
  vibrantScript.onload = () => initializePresentation().then(initializeControls);
  vibrantScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/node-vibrant/3.1.6/vibrant.min.js';
  vibrantScript.async = true;

  vibrantScript.onerror = () => {
    console.error('Failed to load the Vibrant library.');
  };

  document.head.appendChild(vibrantScript);
   */
  initializePresentation().then( initializeControls );
} );
