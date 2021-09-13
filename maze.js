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

function fillBlock(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col*cellWidth, row*cellHeight, cellWidth, cellHeight);
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
const mazeCanvas = document.getElementById("maze");
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


/*****************Maze Generators*****************/
function initMazeParameters() {
    rows = +rowsInput.value;
    cols = +colsInput.value;
    mazeWidth = cols * cellWidth;
    mazeHeight = rows * cellHeight;
    mazeCanvas.width = mazeWidth;
    mazeCanvas.height = mazeHeight;
    mazeCanvas.style.border = `${cellWidth}px solid ${color.wall}`
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
    const randomCellCoords = getCoordinatesFromIndex(randomCellIndex, cols);
    fillBlock(randomCellCoords.row, randomCellCoords.col, color.passage);
    if(animate) await sleep(animateMazeGenerationWaitingTime);
    
    // add frontier cells, ie, neighbours which are walls
    const frontierCells = getNeighboursOfIndex(randomCellIndex, rows, cols);

    while (frontierCells.length > 0) {
        // select random frontier cell
        const randomFrontierCellIndex = randInt(frontierCells.length);
        const frontierCell = frontierCells[randomFrontierCellIndex];
        grid[frontierCell] = true;
        const frontierCellCoords = getCoordinatesFromIndex(frontierCell, cols);
        fillBlock(frontierCellCoords.row, frontierCellCoords.col, color.passage);
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
        const inBetweenCell = getCoordinatesFromIndex((frontierCell + frontierCellNeighbourWhichIsPassage) / 2, cols);
        fillBlock(inBetweenCell.row, inBetweenCell.col, color.passage);
        if(animate) await sleep(animateMazeGenerationWaitingTime);
    }

    let goalIndex = rows * cols - 1;
    if((rows & 1) === 0) goalIndex -= cols;
    if((cols & 1) === 0) goalIndex -= 1;

    const startCoords = getCoordinatesFromIndex(0, cols);
    const goalCoords = getCoordinatesFromIndex(goalIndex, cols);
    fillBlock(startCoords.row, startCoords.col, color.player);
    fillBlock(goalCoords.row, goalCoords.col, color.goal);

    mazeGrid = {
        grid: grid,
        startIndex: 0,
        goalIndex: goalIndex
    }
}

//returns a sequence of grid indices that were travelled
function solveMaze(mazeGrid, rows, cols) {
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
    const travel = solveMaze(mazeGrid, rows, cols);
    console.log(rows,cols,travel.map(x => {
        let coords = getCoordinatesFromIndex(x.index, cols);
        return [coords.row, coords.col];
    }));
    const startCell = getCoordinatesFromIndex(travel[0].index, cols);
    fillBlock(startCell.row, startCell.col, color.player);
    await sleep(msSleep);
    for(let i=1; i < travel.length; i++) {
        const currentCell = getCoordinatesFromIndex(travel[i].index, cols);
        const prevCell = getCoordinatesFromIndex(travel[i-1].index, cols);

        fillBlock(currentCell.row, currentCell.col, color.player);

        if(travel[i-1].backtracking) {
            fillBlock(prevCell.row, prevCell.col, color.backtracking);
        }
        else {
            fillBlock(prevCell.row, prevCell.col, color.travelling);
        }
        await sleep(msSleep);
    }
}

async function onClickBtnConstructMaze() {
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
        const coords = getCoordinatesFromIndex(i, cols);
        if(mazeGrid.grid[i]) {
            fillBlock(coords.row, coords.col, color.passage);
        }
    }
    const startCoords = getCoordinatesFromIndex(mazeGrid.startIndex, cols);
    const goalCoords = getCoordinatesFromIndex(mazeGrid.goalIndex, cols);
    fillBlock(startCoords.row, startCoords.col, color.player);
    fillBlock(goalCoords.row, goalCoords.col, color.goal);

    btnSolveMaze.disabled = false;
}

btnConstructMaze.addEventListener('click', onClickBtnConstructMaze);
btnSolveMaze.addEventListener('click', onClickBtnSolveMaze);
btnResetMaze.addEventListener('click', onClickBtnResetMaze);
animateMazeGenerationInput.addEventListener('click', () => {
    animateMazeGeneration = animateMazeGenerationInput.checked;
});

constructRandomMaze(false);