"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const Client_1 = require("./Client");
/*** Global Constants ***/
const PUZZLE_SIZE = 10;
let STATES = new Array(PUZZLE_SIZE ** 2).fill(Puzzle_1.SpaceStatus.Empty);
const CANVAS = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
const PUZZLE_NAME = document.getElementById('puzzleName') ?? assert_1.default.fail('missing drawing canvas');
const MESSAGE = document.getElementById('message-section') ?? assert_1.default.fail('missing message canvas');
const RULES = document.getElementById('rules') ?? assert_1.default.fail('missing message canvas');
const RULES_BUTTON = document.getElementById('button-new-puzzle') ?? assert_1.default.fail('missing button canvas');
const CHECK_CANVAS_BUTTON = document.getElementById('button-check-puzzle') ?? assert_1.default.fail('missing button canvas');
const COLORS = ['#47DE9A', '#50BBFA', '#FAD258', '#FFFFFF', '#FF8652', '#E0DF80', '#A780E0', '#F69BFA', '#E5E5E5', '#5BF5DB'];
const CONTEXT = CANVAS.getContext('2d');
let CLIENT = undefined;
(0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
const WIDTH = CONTEXT.canvas.clientHeight;
const HEIGHT = CONTEXT.canvas.clientHeight;
PUZZLE_NAME.addEventListener('change', async () => { await _updatePuzzleName(); newPuzzle(); });
RULES.addEventListener("click", () => { RULES.style.display = "none"; });
// when the user clicks on the drawing canvas...
CANVAS.addEventListener('click', (event) => { makeMove(event.offsetX, event.offsetY); });
// when the user clicks on the request new puzzle button...
RULES_BUTTON.addEventListener('click', () => {
    RULES.style.display = "flex";
    RULES.style.left = "auto";
    RULES.style.bottom = "auto";
    RULES.style.height = "300px";
    RULES.style.width = "700px";
    RULES.style.background = "#fff";
    RULES.style.color = "#222021";
    setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
});
// checking puzzle button
CHECK_CANVAS_BUTTON.addEventListener('click', () => {
    (0, assert_1.default)(CLIENT, 'no puzzle selected');
    if (CLIENT.isSolved()) {
        MESSAGE.innerHTML = "You won!";
    }
    else
        MESSAGE.innerHTML = '<p class="margin-0">Your puzzle is not fully solved yet ...</p><p class="margin-0">Chug Away!</p>';
    MESSAGE.style.display = "flex";
    MESSAGE.style.left = "auto";
    MESSAGE.style.bottom = "auto";
    MESSAGE.style.height = "100px";
    MESSAGE.style.width = "400px";
    setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
});
/**
 * Makes a move by drawing nothing a dot or a star based on the current state of the clicked cell
 *
 * @param x position of the cell in the canvas
 * @param y position of the cell in the canvas
 */
function makeMove(x, y) {
    let text;
    let newStatus;
    const cell = _cell(x, y);
    const [i, j] = [(cell % PUZZLE_SIZE) * (WIDTH / PUZZLE_SIZE), Math.floor(cell / PUZZLE_SIZE) * (HEIGHT / PUZZLE_SIZE)];
    const [w, h] = [WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE];
    (0, assert_1.default)(CLIENT);
    (0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
    switch (STATES[cell]) {
        case Puzzle_1.SpaceStatus.Empty: {
            newStatus = Puzzle_1.SpaceStatus.Dot;
            text = '⚫';
            break;
        }
        case Puzzle_1.SpaceStatus.Dot: {
            newStatus = Puzzle_1.SpaceStatus.Star;
            text = '🌟';
            break;
        }
        case Puzzle_1.SpaceStatus.Star:
            newStatus = Puzzle_1.SpaceStatus.Empty;
            break;
        default: break;
    }
    const region = CLIENT.getRegion(cell);
    const color = COLORS[region];
    if (newStatus !== undefined) {
        const message = CLIENT.makeMove(cell, newStatus);
        if (message !== undefined) {
            MESSAGE.innerHTML = message;
            MESSAGE.style.display = "flex";
            MESSAGE.style.left = "10px";
            MESSAGE.style.bottom = "10px";
            MESSAGE.style.height = "60px";
            MESSAGE.style.width = "300px";
            setTimeout(function () { MESSAGE.style.display = "none"; }, 5000);
            return;
        }
        STATES[cell] = newStatus;
    }
    CONTEXT.clearRect(i, j, w, h);
    if (color !== undefined)
        CONTEXT.fillStyle = color;
    CONTEXT.fillRect(i, j, w, h);
    CONTEXT.font = CONTEXT.font.replace(/\d+px/, "30px");
    if (text !== undefined)
        CONTEXT.fillText(text, i + WIDTH / PUZZLE_SIZE / 5, j + HEIGHT / PUZZLE_SIZE / 1.5, w);
    // IDK if this should be here, gotta keep it in mind. 
    CONTEXT.strokeStyle = "#081A33";
    CONTEXT.lineWidth = 0.3;
    CONTEXT.strokeRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
}
/**
 * Construct a new Puzzle
 */
function newPuzzle() {
    STATES = new Array(PUZZLE_SIZE ** 2).fill(Puzzle_1.SpaceStatus.Empty);
    (0, assert_1.default)(CONTEXT, 'unable to get canvas drawing context');
    for (let i = 0; i < WIDTH; i += WIDTH / PUZZLE_SIZE) {
        for (let j = 0; j < HEIGHT; j += HEIGHT / PUZZLE_SIZE) {
            const cell = _cell(i, j);
            (0, assert_1.default)(CLIENT, "client is bad");
            const region = CLIENT.getRegion(cell);
            const color = COLORS[region];
            (0, assert_1.default)(color, "color is bad");
            CONTEXT.fillStyle = color;
            CONTEXT.fillRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
            CONTEXT.strokeStyle = "#081A33";
            CONTEXT.lineWidth = 0.3;
            CONTEXT.strokeRect(i, j, WIDTH / PUZZLE_SIZE, HEIGHT / PUZZLE_SIZE);
        }
    }
}
/*** Helper Functions ***/
/**
 * Retrieve the 1D cell puzzle index of a cell from the 2D canvas coordinates of the cell
 *
 * @param x position of the cell in the canvas
 * @param y position of the cell in the canvas
 * @returns 1D cell index of the cell in the puzzle
 */
function _cell(x, y) { return Math.floor(x / (WIDTH / PUZZLE_SIZE)) + PUZZLE_SIZE * Math.floor(y / (HEIGHT / PUZZLE_SIZE)); }
/**
 * Updates the puzzle name
 *
 * @param puzzleName the name of the selected puzzle
 */
async function _updatePuzzleName(puzzleName = undefined) {
    if (puzzleName === undefined)
        puzzleName = PUZZLE_NAME.options[PUZZLE_NAME.options.selectedIndex]?.value;
    const response = await fetch(`http://localhost:8789/get/${puzzleName}.starb`);
    const puzzleString = await response.text();
    CLIENT = (0, Client_1.clientFromPuzzle)(puzzleString);
}
/**
 * Set up the page.
 */
async function main() {
    await _updatePuzzleName(PUZZLE_NAME.options[0]?.value);
    newPuzzle();
    RULES_BUTTON.click();
}
void main();
//# sourceMappingURL=StarbClient.js.map