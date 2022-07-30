import { GameOfLife } from "./dist/gol.js"
import { Util } from "./dist/util.js"
import { Parts } from "./dist/parts.js"

window.gol = (function () {
    // DEMO DATA
    const WIDTH = 600
    const HEIGHT = 600
    const SPAWN_FACTOR = 0.2
    let FPS = 25
    let RUNNING = false

    // CONTAINER
    const body = document.createElement("div")
    body.classList.add("m-1")
    body.style.width = `${WIDTH}px`
    body.style.height = `${HEIGHT}px`
    body.style.outline = "1px solid black"
    body.style.display = "inline-block"
    body.style.boxSizing = "border-box"
    document.body.append(body)

    // OVERLAY
    const overlay = document.createElement("canvas")
    overlay.id = "overlay"
    body.append(overlay)

    // CANVAS
    const canvas = document.createElement("canvas")
    canvas.id = "gol"
    canvas.width = WIDTH
    canvas.height = HEIGHT
    body.append(canvas)

    // GAME OF LIFE
    const gol = new GameOfLife(canvas.id, overlay.id)
    // click handlers
    gol.addLeftClickHandler(createPart)
    gol.addRightClickHandler(cycleParts)
    // overlays
    gol.addDynamicLayer(createPreview)
    //gol.addPermanentLayer(createGrid, () => gol.editMode)
    // init
    gol.init()
    //gol.getGrid().forEach(cell => cell.alive = Util.random(SPAWN_FACTOR))

    // CONTROLS
    const container = document.createElement("div")
    const editContainer = document.createElement("div")

    const startButton = document.createElement("button")
    startButton.innerText = "Start"
    startButton.classList.add("btn", "btn-primary", "m-1")
    startButton.onclick = start

    const stopButton = document.createElement("button")
    stopButton.innerText = "Stop"
    stopButton.classList.add("btn", "btn-primary", "m-1")
    stopButton.onclick = stop

    const stepButton = document.createElement("button")
    stepButton.innerText = "Step"
    stepButton.classList.add("btn", "btn-primary", "m-1")
    stepButton.onclick = () => gol.draw()

    const restartButton = document.createElement("button")
    restartButton.innerText = "Restart"
    restartButton.classList.add("btn", "btn-primary", "m-1")
    restartButton.onclick = restart

    const editButton = document.createElement("button")
    editButton.innerText = "Edit"
    editButton.classList.add("btn", "btn-outline-secondary", "m-1")
    editButton.onclick = () => {
        gol.toggleEdit()
        if (gol.isEditModeActive()) {
            stop()
            editButton.classList.add("btn-success")
            editButton.classList.remove("btn-outline-secondary")
            clearButton.style.display = "unset"
        } else {
            start()
            editButton.classList.add("btn-outline-secondary")
            editButton.classList.remove("btn-success")
            clearButton.style.display = "none"
        }
    }

    const clearButton = document.createElement("button")
    clearButton.style.display = gol.isEditModeActive() ? "unset" : "none"
    clearButton.innerText = "Clear"
    clearButton.classList.add("btn", "btn-secondary", "m-1")
    clearButton.onclick = () => {
        stop()
        gol.init()
        gol.draw()
    }

    editContainer.append(editButton, clearButton)
    container.append(startButton, stopButton, stepButton, restartButton)
    document.body.append(container, editContainer)

    // ANIMATION
    let currentMs;
    let lastFrameMs = Date.now();
    let delta;
    let animationId

    function start() {
        if (!RUNNING) {
            RUNNING = true
            draw()
        }
    }

    function draw() {
        animationId = requestAnimationFrame(draw);

        // get delta
        currentMs = Date.now();
        delta = currentMs - lastFrameMs;

        if (delta > (1000 / FPS)) {
            // reset time of last frame
            lastFrameMs = currentMs - (delta % (1000 / FPS));

            gol.draw()
        }
    }

    function stop() {
        cancelAnimationFrame(animationId)
        RUNNING = false
    }

    function restart() {
        stop()
        gol.init()
        gol.getGrid().forEach(cell => cell.alive = Util.random(SPAWN_FACTOR))
        gol.draw()
    }

    // PARTS
    let parts = 0

    function cycleParts(row, col, overlay) {
        parts++
        createPreview(row, col, overlay)
    }

    function createPart(row, col, ctx) {
        getPart(row, col).forEach(cell => {
            cell.alive = true
            cell.draw(ctx)
        })
    }

    function createPreview(row, col, overlay) {
        overlay.clearRect(0, 0, WIDTH, HEIGHT)
        overlay.fillStyle = "rgba(0, 0, 0, 0.5)"
        getPart(row, col).forEach(cell => {
            overlay.fillRect(cell.position.x, cell.position.y, cell.size, cell.size)
        })
    }

    function getPart(row, col) {
        return Parts.get(parts).create(row, col, gol.getGrid())
    }

    function createGrid(row, col, overlay) {
        overlay.strokeStyle = "rgba(50, 50, 50)"
        // row
        overlay.beginPath();
        overlay.moveTo(0, row * GameOfLife.CELL_SIZE);
        overlay.lineTo(WIDTH, row * GameOfLife.CELL_SIZE);
        overlay.stroke();
        // col
        overlay.beginPath();
        overlay.moveTo(col * GameOfLife.CELL_SIZE, 0);
        overlay.lineTo(col * GameOfLife.CELL_SIZE, HEIGHT);
        overlay.stroke();
    }

    return gol
})();