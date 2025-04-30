"use strict";
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
var slideBuffer = 3;
var audioElement = null;
var audioPlaylist = [];
var audioConfig = {};
var currentAudioIndex = 0;
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
function playSlideshow() {
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    btnPause.classList.add('displayed');
    btnPlay.classList.remove('displayed');
    if (!intervalId) {
        intervalId = Number(setInterval(nextSlide, durationSlide));
    }
    if (audioElement && audioElement.paused) {
        audioElement.play().catch(function () { });
    }
}
function pauseSlideshow() {
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    btnPause.classList.remove('displayed');
    btnPlay.classList.add('displayed');
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = 0;
    }
    if (audioElement && !audioElement.paused) {
        audioElement.pause();
    }
}
function initializeControls() {
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    var btnNext = document.querySelector('.btnNext');
    var btnPrev = document.querySelector('.btnPrev');
    btnPrev.addEventListener('click', function () { return prevSlide(); });
    btnPlay.addEventListener('click', playSlideshow);
    btnPause.addEventListener('click', pauseSlideshow);
    btnNext.addEventListener('click', function () { return nextSlide(); });
    displaySlide(currentSlideIndex);
    playSlideshow();
}
function initializePresentation() {
    return __awaiter(this, void 0, void 0, function () {
        var link, response, data, stage, chrome, description, btnToggleDescription, durationTransition_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'preso_styles.css';
                    document.head.appendChild(link);
                    return [4 /*yield*/, fetch('preso_index.json')];
                case 1:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _d.sent();
                    presoData = data;
                    ((_a = data === null || data === void 0 ? void 0 : data.config) === null || _a === void 0 ? void 0 : _a.title) && (document.title = data.config.title);
                    ((_b = data === null || data === void 0 ? void 0 : data.config) === null || _b === void 0 ? void 0 : _b.durationSlide) && (durationSlide = data.config.durationSlide);
                    // --- Audio setup ---
                    if (data.audio && Array.isArray(data.audio.playlist) && data.audio.playlist.length > 0) {
                        audioPlaylist = data.audio.playlist;
                        audioConfig = data.audio.config || {};
                        audioElement = document.createElement('audio');
                        audioElement.src = audioPlaylist[0].src;
                        audioElement.loop = !!audioConfig.loop;
                        audioElement.preload = 'auto';
                        audioElement.style.display = 'none';
                        audioElement.volume = 0.1; // Set background music volume to 20%
                        document.body.appendChild(audioElement);
                    }
                    stage = document.createElement('div');
                    stage.className = 'stage';
                    document.body.appendChild(stage);
                    chrome = document.createElement('div');
                    chrome.className = 'chrome';
                    stage.appendChild(chrome);
                    ['btnPrev', 'btnPlay', 'btnPause', 'btnNext'].forEach(function (btnClass) {
                        var button = document.createElement('div');
                        button.className = btnClass;
                        chrome.appendChild(button);
                    });
                    ['btnMute', 'btnUnmute'].forEach(function (btnClass) {
                        var btn = document.createElement('div');
                        btn.className = btnClass;
                        stage.appendChild(btn);
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
                    // Set initial button state
                    document.addEventListener('DOMContentLoaded', function () {
                        var _a, _b, _c, _d;
                        if (audioElement && audioElement.muted) {
                            (_a = document.querySelector('.btnMute')) === null || _a === void 0 ? void 0 : _a.classList.add('displayed');
                            (_b = document.querySelector('.btnUnmute')) === null || _b === void 0 ? void 0 : _b.classList.remove('displayed');
                        }
                        else {
                            (_c = document.querySelector('.btnMute')) === null || _c === void 0 ? void 0 : _c.classList.remove('displayed');
                            (_d = document.querySelector('.btnUnmute')) === null || _d === void 0 ? void 0 : _d.classList.add('displayed');
                        }
                    });
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
                        durationTransition_1 = ((_c = data.config) === null || _c === void 0 ? void 0 : _c.durationTransition) || '1s';
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
            console.log("Error loading image ".concat(img === null || img === void 0 ? void 0 : img.src, " - deleting slide with index ").concat(index));
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
        /*
              // consider bringing back the vibrant implementation later...
              img.onload = async () => {
                if( !img ) return;
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
    initializePresentation().then(initializeControls);
});
