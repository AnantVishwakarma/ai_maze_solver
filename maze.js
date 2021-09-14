// Reference: https://stackoverflow.com/questions/29739751/implementing-a-randomly-generated-maze-using-prims-algorithm

/*
1. A Grid consists of a 2 dimensional array of cells.
2. A Cell has 2 states: Blocked or Passage.
3. Start with a Grid full of Cells in state Blocked.
4. Pick a random Cell, set it to state Passage and Compute its frontier cells. A frontier cell of a Cell is a cell with distance 2 in state Blocked and within the grid.
5. While the list of frontier cells is not empty:
    1. Pick a random frontier cell from the list of frontier cells.
    2. Let neighbors(frontierCell) = All cells in distance 2 in state Passage. Pick a random neighbor and connect the frontier cell with the neighbor by setting the cell in-between to state Passage. Compute the frontier cells of the chosen frontier cell and add them to the frontier list. Remove the chosen frontier cell from the list of frontier cells.
*/

"use strict";

/*****************Utility Functions*****************/
function randInt(max) {
    return Math.floor(Math.random() * max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getIndexFromCoordinates(row, col, cols) {
    return row * cols + col;
}

function getCoordinatesFromIndex(index, cols) {
    return {
        row: Math.floor(index/cols),
        col: index % cols
    }
}

function fillBlock(index, color) {
    ctx.fillStyle = color;
    const {row, col} = getCoordinatesFromIndex(index, cols);
    ctx.fillRect(col*cellWidth, row*cellHeight, cellWidth, cellHeight);
}

function getNeighboursOfIndex(index, rows, cols, distance = 2) {
    const neighbours = [];

    const topIndex = index - cols * distance;
    const rightIndex = index + distance;
    const bottomIndex = index + cols * distance;
    const leftIndex = index - distance;

    if(topIndex >= 0 && topIndex < rows*cols) neighbours.push(topIndex);
    if(Math.floor(rightIndex/cols) === Math.floor(index/cols)) neighbours.push(rightIndex);
    if(bottomIndex >= 0 && bottomIndex < rows*cols) neighbours.push(bottomIndex);
    if(Math.floor(leftIndex/cols) === Math.floor(index/cols)) neighbours.push(leftIndex);

    return neighbours;
}


/*****************Initialization*****************/
const mazeCanvas = document.getElementById("maze-canvas");
const ctx = mazeCanvas.getContext("2d");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const btnConstructMaze = document.getElementById("btn-construct-maze");
const btnSolveMaze = document.getElementById("btn-solve-maze");
const btnResetMaze = document.getElementById("btn-reset-maze");
const animateMazeGenerationInput = document.getElementById("animate-maze-generation");

const cellWidth = 10;
const cellHeight = 10;
const padding = 10;
const animateMazeGenerationWaitingTime = 10;

let rows = +rowsInput.value;
let cols = +colsInput.value;
let mazeWidth = cols * cellWidth;
let mazeHeight = rows * cellHeight;
let mazeGrid = null;
let animateMazeGeneration = animateMazeGenerationInput.checked;
let solved = false;

const color = {
    player: '#0000FF',
    goal: '#00FF00',
    travelling: '#00FFFF',
    backtracking: '#FF0000',
    wall: '#211',
    passage: '#FFFFFF'
};

mazeCanvas.style.borderLeft = `${cellWidth}px solid ${color.wall}`;
mazeCanvas.style.borderTop = `${cellWidth}px solid ${color.wall}`;


/*****************Maze Generators*****************/
function initMazeParameters() {
    rows = +rowsInput.value;
    cols = +colsInput.value;
    mazeWidth = cols * cellWidth;
    mazeHeight = rows * cellHeight;
    mazeCanvas.width = mazeWidth;
    mazeCanvas.height = mazeHeight;

    if((rows & 1) === 1) mazeCanvas.style.borderBottom = `${cellWidth}px solid ${color.wall}`;
    else mazeCanvas.style.borderBottom = 'none';

    if((cols & 1) === 1) mazeCanvas.style.borderRight = `${cellWidth}px solid ${color.wall}`;
    else mazeCanvas.style.borderRight = 'none';
    
    animateMazeGeneration = animateMazeGenerationInput.checked;
}

function generateMaze(rows, cols) {
    // start with grid full of walls
    const grid = new Array(rows * cols).fill(false); // false value represents wall

    const randomCellIndex = 0;
    grid[randomCellIndex] = true;
    
    // add frontier cells, ie, neighbours which are walls
    const frontierCells = getNeighboursOfIndex(randomCellIndex, rows, cols);

    while (frontierCells.length > 0) {
        // select random frontier cell
        const randomFrontierCellIndex = randInt(frontierCells.length);
        const frontierCell = frontierCells[randomFrontierCellIndex];
        grid[frontierCell] = true;
        frontierCells.splice(randomFrontierCellIndex, 1);

        // get all neighbours of frontier cells
        const neighboursOfFrontierCell = getNeighboursOfIndex(frontierCell, rows, cols);

        // if neighbour not in frontierCell and is Wall, add in frontierCell
        neighboursOfFrontierCell.forEach(neighbour => {
            if(!grid[neighbour] && !frontierCells.includes(neighbour)) {
                frontierCells.push(neighbour);
            }
        });

        const neighboursOfFrontierCellWhichArePassage = neighboursOfFrontierCell.filter(index => grid[index]);

        const frontierCellNeighbourWhichIsPassage = neighboursOfFrontierCellWhichArePassage[randInt(neighboursOfFrontierCellWhichArePassage.length)];

        // Create a passage between neighbour (which is passage) and frontier cell
        grid[(frontierCell + frontierCellNeighbourWhichIsPassage) / 2] = true;
    }

    return grid;
}

async function constructRandomMaze(animate) {
    initMazeParameters();
    ctx.fillStyle = color.wall;
    ctx.fillRect(0, 0, mazeWidth, mazeHeight);
    // start with grid full of walls
    const grid = new Array(rows * cols).fill(false); // false value represents wall

    const randomCellIndex = 0;
    grid[randomCellIndex] = true;
    fillBlock(randomCellIndex, color.passage);
    if(animate) await sleep(animateMazeGenerationWaitingTime);
    
    // add frontier cells, ie, neighbours which are walls
    const frontierCells = getNeighboursOfIndex(randomCellIndex, rows, cols);

    while (frontierCells.length > 0) {
        // select random frontier cell
        const randomFrontierCellIndex = randInt(frontierCells.length);
        const frontierCell = frontierCells[randomFrontierCellIndex];
        grid[frontierCell] = true;
        fillBlock(frontierCell, color.passage);
        if(animate) await sleep(animateMazeGenerationWaitingTime);
        frontierCells.splice(randomFrontierCellIndex, 1);

        // get all neighbours of frontier cells
        const neighboursOfFrontierCell = getNeighboursOfIndex(frontierCell, rows, cols);

        // if neighbour not in frontierCell and is Wall, add in frontierCell
        neighboursOfFrontierCell.forEach(neighbour => {
            if(!grid[neighbour] && !frontierCells.includes(neighbour)) {
                frontierCells.push(neighbour);
            }
        });

        const neighboursOfFrontierCellWhichArePassage = neighboursOfFrontierCell.filter(index => grid[index]);

        const frontierCellNeighbourWhichIsPassage = neighboursOfFrontierCellWhichArePassage[randInt(neighboursOfFrontierCellWhichArePassage.length)];

        // Create a passage between neighbour (which is passage) and frontier cell
        grid[(frontierCell + frontierCellNeighbourWhichIsPassage) / 2] = true;
        fillBlock((frontierCell + frontierCellNeighbourWhichIsPassage) / 2, color.passage);
        if(animate) await sleep(animateMazeGenerationWaitingTime);
    }

    let goalIndex = rows * cols - 1;
    if((rows & 1) === 0) goalIndex -= cols;
    if((cols & 1) === 0) goalIndex -= 1;

    fillBlock(0, color.player);
    fillBlock(goalIndex, color.goal);

    mazeGrid = {
        grid: grid,
        startIndex: 0,
        goalIndex: goalIndex
    }
}

//returns a sequence of grid indices that were travelled
function solveMazeDFS(mazeGrid, rows, cols) {
    const travel = [];
    const stack = [];
    const visited = new Array(mazeGrid.grid.length).fill(false);
    const startPos = 0;
    stack.push(startPos);
    visited[startPos] = true;
    travel.push({
        index: startPos,
        backtracking: false
    });

    while(stack.length > 0) {
        if(travel[travel.length - 1].index === mazeGrid.goalIndex) {
            break;
        }
        //get neighbours that are not wall and unvisited
        const neighbours = getNeighboursOfIndex(stack[stack.length - 1], rows, cols, 1).filter(cell => mazeGrid.grid[cell] && !visited[cell]);
        let nextLocationIndex = null;
        if(neighbours.length === 0) {
            //dead end
            travel[travel.length - 1].backtracking = true;
            stack.pop();
            nextLocationIndex = stack[stack.length - 1];
        }
        else {
            //select random neighbour
            const randomNeighbour = neighbours[randInt(neighbours.length)];
            stack.push(randomNeighbour);
            visited[randomNeighbour] = true;
            nextLocationIndex = randomNeighbour;
        }
        travel.push({
            index: nextLocationIndex,
            backtracking: false
        });
    }

    return travel;
}

async function animateSolvingMaze(msSleep=10) {
    const travel = await solveMazeDFS(mazeGrid, rows, cols);
    fillBlock(travel[0].index, color.player);
    await sleep(msSleep);
    for(let i=1; i < travel.length; i++) {
        fillBlock(travel[i].index, color.player); // fill current cell
        fillBlock(travel[i-1].index, travel[i-1].backtracking? color.backtracking : color.travelling); // fill previous cell
        await sleep(msSleep);
    }
}

async function onClickBtnConstructMaze() {
    if(+rowsInput.value < +rowsInput.min || +rowsInput.value > +rowsInput.max) {
        alert(`Rows must be within ${rowsInput.min} to ${rowsInput.max}`);
        return;
    }
    if(+colsInput.value < +colsInput.min || +colsInput.value > +colsInput.max) {
        alert(`Columns must be within ${colsInput.min} to ${colsInput.max}`);
        return;
    }
    [rowsInput, colsInput, btnConstructMaze, btnSolveMaze, btnResetMaze, animateMazeGenerationInput].forEach(dom => dom.disabled = true);
    await constructRandomMaze(animateMazeGeneration);
    [rowsInput, colsInput, btnConstructMaze, btnSolveMaze, btnResetMaze, animateMazeGenerationInput].forEach(dom => dom.disabled = false);
}

async function onClickBtnSolveMaze() {
    [rowsInput, colsInput, btnConstructMaze, btnSolveMaze, btnResetMaze, animateMazeGenerationInput].forEach(dom => dom.disabled = true);
    await animateSolvingMaze();
    [rowsInput, colsInput, btnConstructMaze, btnResetMaze, animateMazeGenerationInput].forEach(dom => dom.disabled = false);
}

async function onClickBtnResetMaze() {
    // redraw maze
    ctx.fillStyle = color.wall;
    ctx.fillRect(0, 0, mazeWidth, mazeHeight);
    for(let i=0; i < mazeGrid.grid.length; i++) {
        if(mazeGrid.grid[i]) {
            fillBlock(i, color.passage);
        }
    }

    fillBlock(mazeGrid.startIndex, color.player);
    fillBlock(mazeGrid.goalIndex, color.goal);

    btnSolveMaze.disabled = false;
}

btnConstructMaze.addEventListener('click', onClickBtnConstructMaze);
btnSolveMaze.addEventListener('click', onClickBtnSolveMaze);
btnResetMaze.addEventListener('click', onClickBtnResetMaze);
animateMazeGenerationInput.addEventListener('click', () => {
    animateMazeGeneration = animateMazeGenerationInput.checked;
});

constructRandomMaze(false);
