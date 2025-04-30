type Slide = {
  description : string;
  src : string;
  title : string;
  type : 'img'; // might extend later
  introPan : string;
  outroPan : string;
  zoomLevel : number;
}

type Audio = {
  src : string;
  title? : string;
  attribution? : string;
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
  audio : { playlist : Audio[] };
  slides : Slide[];
}

let currentSlideIndex = 0;
let slideDivs : HTMLDivElement[] = [];
let intervalId : number;
let durationSlide = 5000;
let presoData : PresoData;
let trashBin : HTMLDivElement;
let wakeLock: any = null;

const slideBuffer = 3;

let audioElement : HTMLAudioElement;
let audioPlaylist : { src : string; title? : string; attribution? : string }[] = [];
let currentAudioIndex = 0;
let hasAudioPlayedOnce = false;

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

function addAudio() {
  if( presoData.audio && Array.isArray( presoData.audio.playlist ) && presoData.audio.playlist.length > 0 ) {
    audioPlaylist = presoData.audio.playlist;
    audioElement = document.createElement( 'audio' );
    audioElement.src = audioPlaylist[ 0 ].src;
    audioElement.preload = 'auto';
    audioElement.style.display = 'none';
    audioElement.volume = 0.1;
    audioElement.muted = false;

    audioElement.addEventListener( 'ended', () => {
      currentAudioIndex = (currentAudioIndex + 1) % audioPlaylist.length;
      audioElement.src = audioPlaylist[ currentAudioIndex ].src;
      audioElement.play().catch( () => {} );
    } );

    document.body.appendChild( audioElement );
  }
}

function getFonts() {
  [
    {
      rel : 'preconnect',
      href : "https://fonts.googleapis.com"
    },
    {
      rel : 'preconnect',
      href : 'https://fonts.gstatic.com',
      crossorigin : ''
    },
    {
      rel : 'stylesheet',
      href : 'https://fonts.googleapis.com/css2?family=Noto+Music&display=swap'
    },
    {
      rel : 'stylesheet',
      href : 'https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap'
    }
  ].forEach( linkInfo => {
    const link = document.createElement( 'link' );
    Object.entries( linkInfo ).forEach( ( [ key, value ] ) => value ? link[ key ] = value : link.setAttribute( key, '' ) );
    document.head.appendChild( link );
  } );
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

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await (navigator as any).wakeLock.request('screen');
    }
  } catch (err) {
    console.warn('Wake Lock not available:', err);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

function playSlideshow() {
  requestWakeLock().catch( () => {} );
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLElement;
  btnPause.classList.add( 'displayed' );
  btnPlay.classList.remove( 'displayed' );
  if( !intervalId ) {
    intervalId = Number( setInterval( nextSlide, durationSlide ) );
  }

  if ( audioElement && !hasAudioPlayedOnce ) {
    hasAudioPlayedOnce = true;
    audioElement.play().catch( () => {} );
  }
}

function pauseSlideshow() {
  releaseWakeLock();
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLElement;
  btnPause.classList.remove( 'displayed' );
  btnPlay.classList.add( 'displayed' );
  if( intervalId ) {
    clearInterval( intervalId );
    intervalId = 0;
  }
}

function setVhUnit() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function main() {
  const btnPlay = document.querySelector( '.btnPlay' ) as HTMLDivElement;
  const btnPause = document.querySelector( '.btnPause' ) as HTMLDivElement;
  const btnNext = document.querySelector( '.btnNext' ) as HTMLDivElement;
  const btnPrev = document.querySelector( '.btnPrev' ) as HTMLDivElement;

  btnPrev.addEventListener( 'click', () => prevSlide() );
  btnPlay.addEventListener( 'click', playSlideshow );
  btnPause.addEventListener( 'click', pauseSlideshow );
  btnNext.addEventListener( 'click', () => nextSlide() );

  // --- Key handling for slideshow controls ---
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        prevSlide();
        e.preventDefault();
        break;
      case 'ArrowRight':
        nextSlide();
        e.preventDefault();
        break;
      case ' ':
      case 'Enter':
        if (!intervalId) {
          playSlideshow();
        } else {
          pauseSlideshow();
        }
        e.preventDefault();
        break;
    }
  });

  displaySlide( currentSlideIndex );
}

function setVhObserving() { // iOS 100vh bug workaround
  setVhUnit();
  const observer = new ResizeObserver( () => setVhUnit() );
  if ( document.body ) observer.observe( document.body );
}

async function init() {
  setVhObserving();
  getFonts();
  const link = document.createElement( 'link' );
  link.rel = 'stylesheet';
  link.href = 'preso_styles.css';
  document.head.appendChild( link );

  const response = await fetch( 'preso_index.json' );
  const data = await response.json();
  presoData = data;

  data?.config?.title && (document.title = data.config.title);
  data?.config?.durationSlide && (durationSlide = data.config.durationSlide);

  addAudio();

  const stage = document.createElement( 'div' );
  stage.className = 'stage';
  document.body.appendChild( stage );

  const chrome = document.createElement( 'div' );
  chrome.className = 'chrome';
  stage.appendChild( chrome );

  let btn : HTMLDivElement;

  [ 'btnPrev', 'btnPlay', 'btnPause', 'btnNext' ].forEach( ( btnClass ) => {
    btn = document.createElement( 'div' );
    btn.className = `${btnClass}${btnClass === 'btnPlay' ? ' displayed' : ''}`;
    btn.tabIndex = 0;
    chrome.appendChild( btn );
  } );

  [ 'btnMute', 'btnUnmute' ].forEach( ( btnClass ) => {
    btn = document.createElement( 'div' );
    btn.className = `${btnClass}${ btnClass === 'btnUnmute' ? ' displayed' : '' }`;
    btn.tabIndex = 0;
    stage.appendChild( btn );
    btn.addEventListener( 'click', () => {
      if( audioElement ) {
        if( audioElement.muted ) {
          audioElement.muted = false;
          document.querySelector( '.btnMute' )?.classList.remove( 'displayed' );
          document.querySelector( '.btnUnmute' )?.classList.add( 'displayed' );
        } else {
          audioElement.muted = true;
          document.querySelector( '.btnMute' )?.classList.add( 'displayed' );
          document.querySelector( '.btnUnmute' )?.classList.remove( 'displayed' );
        }
      }
    } );
  } );

  // Set initial button state
  document.addEventListener( 'DOMContentLoaded', () => {
    if( audioElement && audioElement.muted ) {
      document.querySelector( '.btnMute' )?.classList.add( 'displayed' );
      document.querySelector( '.btnUnmute' )?.classList.remove( 'displayed' );
    } else {
      document.querySelector( '.btnMute' )?.classList.remove( 'displayed' );
      document.querySelector( '.btnUnmute' )?.classList.add( 'displayed' );
    }
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

    img.onerror = () => {
      console.warn( `Error loading image ${img?.src} - deleting slide with index ${index}` );
      presoData.slides.splice( index, 1 );
      if( slideDiv.parentNode ) {
        slideDiv.parentNode.removeChild( slideDiv );
      }
      slideDivs.splice( index, 1 );

      if( currentSlideIndex >= slideDivs.length ) {
        currentSlideIndex = Math.max( 0, slideDivs.length - 1 );
      }

      if( slideDivs.length > 0 ) {
        displaySlide( currentSlideIndex );
      }
    };
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
  init().then( main );
} );

