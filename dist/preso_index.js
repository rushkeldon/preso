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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_vibrant_1 = __importDefault(require("node-vibrant"));
var currentSlideIndex = 0;
var slides = [];
var intervalId = null;
var durationSlide = 5000;
function generateTransitionData(index) {
    var directions = ['left', 'right', 'up', 'down'];
    var introDirection = directions[index % directions.length]; // Cycle through directions
    var outroDirection = directions[(index + 2) % directions.length]; // Opposite direction
    return {
        introPan: introDirection,
        outroPan: outroDirection,
        reversePan: outroDirection, // Reverse when returning to the slide
        zoomLevel: Math.random() * 0.5 + 1 // Random zoom between 1x and 1.5x
    };
}
function showSlide(index) {
    slides.forEach(function (slide, i) {
        slide.classList.remove('displayed', 'pan-left', 'pan-right', 'pan-up', 'pan-down');
        if (i === index) {
            slide.classList.add('displayed');
        }
        else if (i < index) {
            slide.classList.add('pan-left');
        }
        else {
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
        intervalId = Number(setInterval(nextSlide, durationSlide));
    }
}
function pauseSlideshow() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
function initializeControls() {
    var btnPlay = document.querySelector('.btnPlay');
    var btnPause = document.querySelector('.btnPause');
    var btnNext = document.querySelector('.btnNext');
    var btnPrev = document.querySelector('.btnPrev');
    btnPlay.addEventListener('click', playSlideshow);
    btnPause.addEventListener('click', pauseSlideshow);
    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);
    slides = Array.from(document.querySelectorAll('.slide'));
    showSlide(currentSlideIndex);
}
document.addEventListener('DOMContentLoaded', function () {
    initializePresentation().then(initializeControls);
});
function initializePresentation() {
    return __awaiter(this, void 0, void 0, function () {
        var link, response, data, stage, chrome, description, toggleDescription, durationTransition_1;
        var _this = this;
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
                    ((_a = data === null || data === void 0 ? void 0 : data.config) === null || _a === void 0 ? void 0 : _a.title) && (document.title = data.config.title);
                    ((_b = data === null || data === void 0 ? void 0 : data.config) === null || _b === void 0 ? void 0 : _b.durationSlide) && (durationSlide = data.config.durationSlide);
                    stage = document.createElement('div');
                    stage.className = 'stage';
                    document.body.appendChild(stage);
                    chrome = document.createElement('div');
                    chrome.className = 'chrome';
                    stage.appendChild(chrome);
                    ['btnPlay', 'btnPause', 'btnNext', 'btnPrev'].forEach(function (btnClass) {
                        var button = document.createElement('div');
                        button.className = btnClass;
                        chrome.appendChild(button);
                    });
                    description = document.createElement('div');
                    description.className = 'description';
                    stage.appendChild(description);
                    toggleDescription = document.createElement('div');
                    toggleDescription.className = 'btnToggleDescription';
                    description.appendChild(toggleDescription);
                    if (data.slides && Array.isArray(data.slides)) {
                        durationTransition_1 = ((_c = data.config) === null || _c === void 0 ? void 0 : _c.durationTransition) || '1s';
                        data.slides.forEach(function (slide, index) {
                            var transitionData = generateTransitionData(index);
                            Object.assign(slide, transitionData);
                            if (slide.type === 'img') {
                                var slideDiv_1 = document.createElement('div');
                                slideDiv_1.className = 'slide';
                                slideDiv_1.style.transitionDuration = durationTransition_1;
                                var img_1 = document.createElement('img');
                                img_1.src = slide.src;
                                img_1.alt = slide.title || '';
                                img_1.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                                    var palette, err_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, node_vibrant_1.default.from(img_1.src).getPalette()];
                                            case 1:
                                                palette = _a.sent();
                                                if (palette.Vibrant) {
                                                    slideDiv_1.style.backgroundColor = palette.Vibrant.getHex();
                                                }
                                                return [3 /*break*/, 3];
                                            case 2:
                                                err_1 = _a.sent();
                                                console.error("Error extracting colors for image ".concat(img_1.src, ":"), err_1);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); };
                                slideDiv_1.appendChild(img_1);
                                stage.appendChild(slideDiv_1);
                            }
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
