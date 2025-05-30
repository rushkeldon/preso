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

/*
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
*/

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
  console.log( 'setVhUnit called.' );
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

function startVhObserving() { // iOS 100vh bug workaround
  setVhUnit();
  const observer = new ResizeObserver( () => setVhUnit() );
  if ( document.body ) observer.observe( document.body );
}

async function init() {
  const scrollable = document.createElement( 'div' );
  scrollable.className = 'scrollable';
  document.body.appendChild( scrollable );

  startVhObserving();

  document.body.addEventListener( 'scroll', ( e ) => {
    console.log( 'body scrolling' );
  } );

  // getFonts();
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
  document.body.appendChild( chrome );

  let btn : HTMLDivElement;

  [ 'btnPrev', 'btnPlay', 'btnPause', 'btnNext' ].forEach( ( btnClass ) => {
    btn = document.createElement( 'div' );
    btn.className = `${btnClass}${btnClass === 'btnPlay' ? ' displayed' : ''}`;
    btn.tabIndex = 0;
    switch( btnClass ) {
      case 'btnPlay' :
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713Z"/></svg>';
        break;
      case 'btnPause' :
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7Zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6Z"/></svg>';
        break;
      case 'btnPrev' :
      case 'btnNext' :
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7s1.6 0 1.6 0Z"/></svg>';
        break;
    }

    chrome.appendChild( btn );
  } );

  [ 'btnMute', 'btnUnmute' ].forEach( ( btnClass ) => {
    btn = document.createElement( 'div' );
    btn.className = `${btnClass}${ btnClass === 'btnUnmute' ? ' displayed' : '' }`;

    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m7.201 1.124-.154.015.16 1.899c.087 1.044.185 2.208.215 2.585.079.902.362 4.292.404 4.829.036.417.036.42-.022.41-.418-.09-.49-.098-.799-.086-1.37.053-2.995 1-3.614 2.104-.171.307-.224.484-.224.762 0 .38.137.727.364.924.26.225.616.332 1.106.332 1.617-.002 3.623-1.309 3.979-2.593.053-.185.05-.377-.014-1.149a504.94 504.94 0 0 1-.21-2.698c-.233-2.977-.26-3.34-.297-3.792a3.058 3.058 0 0 1-.017-.384c.03-.025.336.072.572.182.574.272 1.835 1.087 2.168 1.404.297.28.493.637.606 1.102.072.297.064.914-.017 1.261-.166.7-.443 1.214-1.029 1.894-.131.155-.249.297-.257.314-.006.018.022.065.064.105l.079.073.215-.1c.216-.1.53-.33.732-.537.756-.78 1.137-1.981 1.003-3.173-.073-.652-.267-1.216-.583-1.693-.219-.333-.821-.975-2.096-2.231C8.417 1.78 8.205 1.55 7.98 1.217l-.076-.115-.274.005c-.152.002-.345.01-.429.017Z"/></svg>';

    btn.tabIndex = 0;
    document.body.appendChild( btn );
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

  if( audioElement && audioElement.muted ) {
    document.querySelector( '.btnMute' )?.classList.add( 'displayed' );
    document.querySelector( '.btnUnmute' )?.classList.remove( 'displayed' );
  } else {
    document.querySelector( '.btnMute' )?.classList.remove( 'displayed' );
    document.querySelector( '.btnUnmute' )?.classList.add( 'displayed' );
  }

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

