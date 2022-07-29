import { GameOfLife } from "./dist/gol.js"
import { Util } from "./dist/util.js"

window.gol = (function () {
    // create canvas
    const canvas = document.createElement("canvas")
    canvas.id = "gol"
    canvas.width = 300
    canvas.height = 300
    canvas.style.border = "1px solid black"
    document.body.append(canvas)

    // create Game of Life
    const gol = new GameOfLife(canvas.id)
    gol.init()
    gol.grid.forEach(cell => cell.alive = Util.random())

    // create buttons
    const startButton = document.createElement("button")
    startButton.innerText = "Start"
    startButton.onclick = start

    const stopButton = document.createElement("button")
    stopButton.innerText = "Stop"
    stopButton.onclick = stop

    const stepButton = document.createElement("button")
    stepButton.innerText = "Step"
    stepButton.onclick = () => gol.draw()

    const restartButton = document.createElement("button")
    restartButton.innerText = "Restart"
    restartButton.onclick = restart

    document.body.append(startButton, stopButton, stepButton, restartButton)

    // setup animation loop
    const fps = 25;
    const interval = 1000 / fps;
    let currentMs;
    let lastFrameMs = Date.now();
    let delta;
    let animationId

    function start() {
        animationId = requestAnimationFrame(start);

        // get delta
        currentMs = Date.now();
        delta = currentMs - lastFrameMs;

        if (delta > interval) {
            // reset time of last frame
            lastFrameMs = currentMs - (delta % interval);

            gol.draw()
        }
    }

    function stop() {
        cancelAnimationFrame(animationId)
    }

    function restart() {
        stop()
        gol.init()
        //gol.grid.forEach(cell => cell.alive = Util.random())
        createGliderRightDown(10, 10)
        createGliderLeftDown(100, 10)
        createGliderRightUp(10, 100)
        createGliderLeftUp(100, 100)
        gol.draw()
    }

    function createGliderRightDown(x, y) {
        const step = gol.grid.size
        gol.grid.getCell(x + 0 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 1 * step, y + 2 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 2 * step).alive = true
    }

    function createGliderLeftDown(x, y) {
        const step = gol.grid.size
        gol.grid.getCell(x + 0 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 0 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 0 * step, y + 2 * step).alive = true
        gol.grid.getCell(x + 1 * step, y + 2 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 1 * step).alive = true
    }

    function createGliderRightUp(x, y) {
        const step = gol.grid.size
        gol.grid.getCell(x + 0 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 1 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 2 * step).alive = true
    }

    function createGliderLeftUp(x, y) {
        const step = gol.grid.size
        gol.grid.getCell(x + 0 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 0 * step, y + 1 * step).alive = true
        gol.grid.getCell(x + 0 * step, y + 2 * step).alive = true
        gol.grid.getCell(x + 1 * step, y + 0 * step).alive = true
        gol.grid.getCell(x + 2 * step, y + 1 * step).alive = true
    }

    return gol
})();