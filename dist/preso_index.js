"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var currentSlideIndex = 0;
var slideDivs = [];
var intervalId;
var durationSlide = 5000;
var presoData;
var trashBin;
var wakeLock = null;
var slideBuffer = 3;
var audioElement;
var audioPlaylist = [];
var currentAudioIndex = 0;
var hasAudioPlayedOnce = false;
function generateTransitionData(index) {
    var directions = ['left', 'right', 'up', 'down'];
    var introDirection = directions[index % directions.length];
    var outroDirection = directions[(index + 2) % directions.length];
    return {
        introPan: introDirection,
        outroPan: outroDirection,
        zoomLevel: Math.random() * 0.5 + 1 // Random zoom between 1x and 1.5x
    };
}
function addAudio() {
    if (presoData.audio && Array.isArray(presoData.audio.playlist) && presoData.audio.playlist.length > 0) {
        audioPlaylist = presoData.audio.playlist;
        audioElement = document.createElement('audio');
        audioElement.src = audioPlaylist[0].src;
        audioElement.preload = 'auto';
        audioElement.style.display = 'none';
        audioElement.volume = 0.1;
        audioElement.muted = false;
        audioElement.addEventListener('ended', function () {
            currentAudioIndex = (currentAudioIndex + 1) % audioPlaylist.length;
            audioElement.src = audioPlaylist[currentAudioIndex].src;
            audioElement.play().catch(function () { });
        });
        document.body.appendChild(audioElement);
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
function displaySlide(index) {
    var _a, _b;
    var descriptionDiv = document.querySelector('.description');
    descriptionDiv.innerHTML = ((_b = (_a = presoData === null || presoData === void 0 ? void 0 : presoData.slides) === null || _a === void 0 ? void 0 : _a[index]) === null || _b === void 0 ? void 0 : _b.description) || '';
    slideDivs.forEach(function (slide, i) {
        var _a, _b, _c;
        slide.classList.remove('displayed', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'zoom-in', 'zoom-out');
        switch (true) {
            case i === index:
                slide.classList.add('displayed', "pan-".concat((_c = (_b = (_a = presoData === null || presoData === void 0 ? void 0 : presoData.slides) === null || _a === void 0 ? void 0 : _a[index]) === null || _b === void 0 ? void 0 : _b.introPan) !== null && _c !== void 0 ? _c : 'left'), "zoom-in");
                break;
            case i < index:
                slide.classList.add('pan-left', 'zoom-out');
                break;
            default:
                slide.classList.add('pan-right', 'zoom-out');
        }
    });
    preCacheAndGarbageCollect(index);
}
function preCacheAndGarbageCollect(index) {
    slideDivs.forEach(function (slideDiv, i) {
        if (i < index - slideBuffer || i > index + slideBuffer) {
            unloadSlideImage(i);
        }
        else if (!slideDiv.querySelector('img')) {
            loadSlideImage(i);
        }
    });
}
function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slideDivs.length;
    displaySlide(currentSlideIndex);
}
function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slideDivs.length) % slideDivs.length;
    displaySlide(currentSlideIndex);
}
function requestWakeLock() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!('wakeLock' in navigator)) return [3 /*break*/, 2];
                    return [4 /*yield*/, navigator.wakeLock.request('screen')];
                case 1:
                    wakeLock = _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.warn('Wake Lock not available:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}
function playSlideshow() {
    requestWakeLock().catch(function () { });
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    btnPause.classList.add('displayed');
    btnPlay.classList.remove('displayed');
    if (!intervalId) {
        intervalId = Number(setInterval(nextSlide, durationSlide));
    }
    if (audioElement && !hasAudioPlayedOnce) {
        hasAudioPlayedOnce = true;
        audioElement.play().catch(function () { });
    }
}
function pauseSlideshow() {
    releaseWakeLock();
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    btnPause.classList.remove('displayed');
    btnPlay.classList.add('displayed');
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = 0;
    }
}
function setVhUnit() {
    console.log('setVhUnit called.');
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
}
function main() {
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    var btnNext = document.querySelector('.btnNext');
    var btnPrev = document.querySelector('.btnPrev');
    btnPrev.addEventListener('click', function () { return prevSlide(); });
    btnPlay.addEventListener('click', playSlideshow);
    btnPause.addEventListener('click', pauseSlideshow);
    btnNext.addEventListener('click', function () { return nextSlide(); });
    // --- Key handling for slideshow controls ---
    document.addEventListener('keydown', function (e) {
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
                }
                else {
                    pauseSlideshow();
                }
                e.preventDefault();
                break;
        }
    });
    displaySlide(currentSlideIndex);
}
function startVhObserving() {
    setVhUnit();
    var observer = new ResizeObserver(function () { return setVhUnit(); });
    if (document.body)
        observer.observe(document.body);
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var scrollable, link, response, data, stage, chrome, btn, description, btnToggleDescription, durationTransition_1;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    scrollable = document.createElement('div');
                    scrollable.className = 'scrollable';
                    document.body.appendChild(scrollable);
                    startVhObserving();
                    document.body.addEventListener('scroll', function (e) {
                        console.log('body scrolling');
                    });
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'preso_styles.css';
                    document.head.appendChild(link);
                    return [4 /*yield*/, fetch('preso_index.json')];
                case 1:
                    response = _h.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _h.sent();
                    presoData = data;
                    ((_a = data === null || data === void 0 ? void 0 : data.config) === null || _a === void 0 ? void 0 : _a.title) && (document.title = data.config.title);
                    ((_b = data === null || data === void 0 ? void 0 : data.config) === null || _b === void 0 ? void 0 : _b.durationSlide) && (durationSlide = data.config.durationSlide);
                    addAudio();
                    stage = document.createElement('div');
                    stage.className = 'stage';
                    document.body.appendChild(stage);
                    chrome = document.createElement('div');
                    chrome.className = 'chrome';
                    document.body.appendChild(chrome);
                    ['btnPrev', 'btnPlay', 'btnPause', 'btnNext'].forEach(function (btnClass) {
                        btn = document.createElement('div');
                        btn.className = "".concat(btnClass).concat(btnClass === 'btnPlay' ? ' displayed' : '');
                        btn.tabIndex = 0;
                        switch (btnClass) {
                            case 'btnPlay':
                                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713Z"/></svg>';
                                break;
                            case 'btnPause':
                                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7Zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6Z"/></svg>';
                                break;
                            case 'btnPrev':
                            case 'btnNext':
                                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7s1.6 0 1.6 0Z"/></svg>';
                                break;
                        }
                        chrome.appendChild(btn);
                    });
                    ['btnMute', 'btnUnmute'].forEach(function (btnClass) {
                        btn = document.createElement('div');
                        btn.className = "".concat(btnClass).concat(btnClass === 'btnUnmute' ? ' displayed' : '');
                        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m7.201 1.124-.154.015.16 1.899c.087 1.044.185 2.208.215 2.585.079.902.362 4.292.404 4.829.036.417.036.42-.022.41-.418-.09-.49-.098-.799-.086-1.37.053-2.995 1-3.614 2.104-.171.307-.224.484-.224.762 0 .38.137.727.364.924.26.225.616.332 1.106.332 1.617-.002 3.623-1.309 3.979-2.593.053-.185.05-.377-.014-1.149a504.94 504.94 0 0 1-.21-2.698c-.233-2.977-.26-3.34-.297-3.792a3.058 3.058 0 0 1-.017-.384c.03-.025.336.072.572.182.574.272 1.835 1.087 2.168 1.404.297.28.493.637.606 1.102.072.297.064.914-.017 1.261-.166.7-.443 1.214-1.029 1.894-.131.155-.249.297-.257.314-.006.018.022.065.064.105l.079.073.215-.1c.216-.1.53-.33.732-.537.756-.78 1.137-1.981 1.003-3.173-.073-.652-.267-1.216-.583-1.693-.219-.333-.821-.975-2.096-2.231C8.417 1.78 8.205 1.55 7.98 1.217l-.076-.115-.274.005c-.152.002-.345.01-.429.017Z"/></svg>';
                        btn.tabIndex = 0;
                        document.body.appendChild(btn);
                        btn.addEventListener('click', function () {
                            var _a, _b, _c, _d;
                            if (audioElement) {
                                if (audioElement.muted) {
                                    audioElement.muted = false;
                                    (_a = document.querySelector('.btnMute')) === null || _a === void 0 ? void 0 : _a.classList.remove('displayed');
                                    (_b = document.querySelector('.btnUnmute')) === null || _b === void 0 ? void 0 : _b.classList.add('displayed');
                                }
                                else {
                                    audioElement.muted = true;
                                    (_c = document.querySelector('.btnMute')) === null || _c === void 0 ? void 0 : _c.classList.add('displayed');
                                    (_d = document.querySelector('.btnUnmute')) === null || _d === void 0 ? void 0 : _d.classList.remove('displayed');
                                }
                            }
                        });
                    });
                    if (audioElement && audioElement.muted) {
                        (_c = document.querySelector('.btnMute')) === null || _c === void 0 ? void 0 : _c.classList.add('displayed');
                        (_d = document.querySelector('.btnUnmute')) === null || _d === void 0 ? void 0 : _d.classList.remove('displayed');
                    }
                    else {
                        (_e = document.querySelector('.btnMute')) === null || _e === void 0 ? void 0 : _e.classList.remove('displayed');
                        (_f = document.querySelector('.btnUnmute')) === null || _f === void 0 ? void 0 : _f.classList.add('displayed');
                    }
                    description = document.createElement('div');
                    description.className = 'description displayed';
                    stage.appendChild(description);
                    btnToggleDescription = document.createElement('div');
                    btnToggleDescription.className = 'btnToggleDescription';
                    stage.appendChild(btnToggleDescription);
                    btnToggleDescription.addEventListener('click', function () {
                        var descriptionDiv = document.querySelector('.description');
                        descriptionDiv.classList.toggle('displayed');
                    });
                    if (data.slides && Array.isArray(data.slides)) {
                        durationTransition_1 = ((_g = data.config) === null || _g === void 0 ? void 0 : _g.durationTransition) || '1s';
                        data.slides.forEach(function (slide, index) {
                            var transitionData = generateTransitionData(index);
                            Object.assign(slide, transitionData);
                            var slideDiv = document.createElement('div');
                            slideDiv.setAttribute('data-index', index.toString());
                            slideDiv.className = 'slide';
                            slideDiv.style.transitionDuration = durationTransition_1;
                            stage.appendChild(slideDiv);
                            slideDivs.push(slideDiv);
                            // load the first 4
                            if (slide.type === 'img' && index < 4)
                                loadSlideImage(index);
                        });
                    }
                    trashBin = document.createElement('div');
                    return [2 /*return*/];
            }
        });
    });
}
function loadSlideImage(index) {
    var _a;
    if (isNaN(index))
        return;
    var slideDiv = slideDivs[index];
    if (!slideDiv)
        return;
    var img = slideDiv.querySelector('img');
    if (!img) {
        var slide = presoData.slides[index];
        img = document.createElement('img');
        img.src = slide.src;
        img.alt = (_a = slide === null || slide === void 0 ? void 0 : slide.title) !== null && _a !== void 0 ? _a : '';
        img.onerror = function () {
            console.warn("Error loading image ".concat(img === null || img === void 0 ? void 0 : img.src, " - deleting slide with index ").concat(index));
            presoData.slides.splice(index, 1);
            if (slideDiv.parentNode) {
                slideDiv.parentNode.removeChild(slideDiv);
            }
            slideDivs.splice(index, 1);
            if (currentSlideIndex >= slideDivs.length) {
                currentSlideIndex = Math.max(0, slideDivs.length - 1);
            }
            if (slideDivs.length > 0) {
                displaySlide(currentSlideIndex);
            }
        };
        slideDiv.appendChild(img);
    }
}
function unloadSlideImage(index) {
    if (isNaN(index))
        return;
    var slideDiv = slideDivs[index];
    if (!slideDiv)
        return;
    var img = slideDiv === null || slideDiv === void 0 ? void 0 : slideDiv.querySelector('img');
    if (img) {
        trashBin.appendChild(img);
        trashBin.innerHTML = '';
    }
}
document.addEventListener('DOMContentLoaded', function () {
    init().then(main);
});
