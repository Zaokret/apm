const gridSide = 3;
const gridSize = gridSide * gridSide;
const barTransitionTime = 5; // seconds
const barHeight = 100;
document.documentElement.style.setProperty('--grid-size', gridSide);
document.documentElement.style.setProperty('--bar-height', barHeight + 'px');
document.documentElement.style.setProperty('--bar-transition-time', barTransitionTime + 's');

document.getElementById('game').addEventListener('contextmenu', event => event.preventDefault());

const holding = new Set();
document.addEventListener('keydown', (ev) => {
    ev.ctrlKey && holding.add('ctrl')
    ev.shiftKey && holding.add('shift')
    ev.altKey && holding.add('alt')
});
document.addEventListener('keyup', (ev) => {
    !ev.ctrlKey && holding.delete('ctrl')
    !ev.shiftKey && holding.delete('shift')
    !ev.altKey && holding.delete('alt')
});

let squares = [];

let barLoop = null;
let barCount = barTransitionTime;
const barEl = document.getElementsByClassName('bar')[0];
barEl.addEventListener('click', () => {
    if (barCount < barTransitionTime) {
        barCount++
        barEl.style.height = (barEl.clientHeight + barHeight / barTransitionTime) + 'px';
    }
})

let spawnLoop = null;
document.getElementById('start').addEventListener('click', () => {
    const spawn = () => {
        const emptySquares = squares.filter(sq => !sq.innerText)
        if (emptySquares.length === 0) {
            clearInterval(spawnLoop);
            return alert('Game Over!');
        }
        const squareToFill = emptySquares[getRandomInt(emptySquares.length)];
        const assignment = getRandomAssignment()
        squareToFill.assignment = assignment
        squareToFill.innerText = assignment.display;
    };

    const bar = () => {
        barCount--;
        barEl.style.height = (barEl.clientHeight - barHeight / barTransitionTime) + 'px'
        if (barCount === 0) {
            clearInterval(barLoop);
            return alert('Game Over!');
        }
    }

    barLoop ??= setInterval(bar, 2000)
    spawnLoop ??= setInterval(spawn, 1600)
})



const modifiers = ['shift', 'ctrl', 'alt']
const clicks = ['left', 'right']
const assignmentTypes = ['click', 'clickMod', 'keypress', 'keypressMod', 'slide']
function getRandomAssignment() {
    const mod = modifiers[getRandomInt(modifiers.length)]
    //Array.from({ length: getRandomInt(2, 1) }, () => '🎈').join('')
    const click = clicks[getRandomInt(clicks.length)];
    const assignment = {
        click,
        display: [mod, click === 'left' ? '<' : '>'].join(' + '),
        modifiers: [mod]
    }
    return assignment;
}

async function main() {
    const gridEl = document.getElementById('game');

    squares = Array.from(
        { length: gridSize },
        (_, index) => createSquareEl({ id: index })
    )

    gridEl.append(...squares);
}

function createSquareEl({ id = '' }) {
    const squareEl = document.createElement('div');
    squareEl.className = 'square';
    squareEl.id = 'square' + id;
    squareEl.addEventListener('mousedown', (event) => {
        const click = determineMouseClick(event.which)
        console.log({ squareEl, click })
        if (squareEl.assignment) {
            const withMod = squareEl.assignment.modifiers.every(mod => holding.has(mod))
            const withClick = squareEl.assignment.click && squareEl.assignment.click === click;
            if (withClick && withMod) {
                squareEl.innerText = ''
                delete squareEl.assignment
            };
        }
    })

    return squareEl;
}

function determineMouseClick(code) {
    switch (code) {
        case 1: return 'left';
        case 2: return 'middle';
        case 3: return 'right';
        default: throw Error('Invalid mouse button code.');
    }
}

function getRandomInt(max = 0, min = 0) {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return min + (randomArray[0] % max);
}

function checkKeycode(e) {
    var keycode;
    if (window.event) { keycode = window.event.keyCode; }
    else if (e) { keycode = e.which; }
    alert("keycode: " + keycode);
}

document.addEventListener('DOMContentLoaded', main);
