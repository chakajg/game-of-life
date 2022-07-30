import { Cell, CellGrid } from "./cell.js"

/*TODO:
 - attach cklick handler to layers
 - make all gol canvas a layer
 - move layers to separate file
*/
class Layer {
    readonly id: string
    readonly ctx: CanvasRenderingContext2D
    private layer: (row: number, col: number, overlay: CanvasRenderingContext2D) => void
    private active: boolean

    constructor(
        gameCtx: CanvasRenderingContext2D,
        layer: (row: number, col: number, overlay: CanvasRenderingContext2D) => void,
        priority: number = 1
    ) {
        this.id = this.uuidv4()
        this.layer = layer
        this.active = false

        const overlay = document.createElement("canvas")
        overlay.id = this.id
        overlay.width = gameCtx.canvas.width
        overlay.height = gameCtx.canvas.height
        overlay.style.position = "absolute"
        overlay.style.zIndex = priority + ""
        gameCtx.canvas.parentElement!!.prepend(overlay)

        this.ctx = overlay.getContext("2d")!!
    }

    private uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        });
    }

    render(row: number, col: number) {
        this.layer(row, col, this.ctx)
        this.active = true
    }

    isActive(): boolean {
        return this.active
    }

    activate(): void {
        this.active = true
    }

    deactivate(): void {
        this.active = false
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }
}

class PermanentLayer extends Layer {
    render(row: number, col: number) {
        if (!this.isActive()) {
            super.render(col, row)
        }
    }
}

class ConditionalLayer extends PermanentLayer {
    private displayCondition: () => boolean

    constructor(
        ctx: CanvasRenderingContext2D,
        layer: (row: number, col: number, overlay: CanvasRenderingContext2D) => void,
        displayCondition: () => boolean,
        priority: number = 1
    ) {
        super(ctx, layer, priority)
        this.displayCondition = displayCondition
    }

    render(row: number, col: number) {
        super.render(row, col)
        if (this.displayCondition()) {
            this.ctx.canvas.style.display = "unset"
        } else {
            this.ctx.canvas.style.display = "none"
        }
    }
}

interface Handler {
    handle(row: number, col: number, ctx: CanvasRenderingContext2D): void
}

export class GameOfLife {

    static PADDING = 10
    static CELL_SIZE = 10

    readonly gameCtx: CanvasRenderingContext2D
    readonly overlayCtx: CanvasRenderingContext2D

    private grid: CellGrid
    private layers: {
        permanent: Array<Layer>
        dynamic: Array<Layer>
    }
    private clickHandlers: {
        left: Array<Handler>
        right: Array<Handler>
    }
    private editMode: boolean

    constructor(canvasId: string, overlayId: string) {
        const canvas = document.querySelector<HTMLCanvasElement>(`#${canvasId}`)!!
        const rows = canvas.height / GameOfLife.CELL_SIZE
        const cols = canvas.width / GameOfLife.CELL_SIZE

        const overlay = document.querySelector<HTMLCanvasElement>(`#${overlayId}`)!!
        overlay.width = canvas.width
        overlay.height = canvas.height
        overlay.style.position = "absolute"
        overlay.style.zIndex = "999"

        this.gameCtx = canvas.getContext("2d")!!
        this.overlayCtx = overlay.getContext("2d")!!
        this.overlayCtx.canvas.addEventListener("mousedown", (e: MouseEvent) => this.handleClick(e))
        this.overlayCtx.canvas.addEventListener("mousemove", (e: MouseEvent) => this.handleMouseMove(e))

        this.grid = new CellGrid(rows, cols, GameOfLife.CELL_SIZE, GameOfLife.PADDING)
        this.layers = { permanent: Array(), dynamic: Array() }
        this.clickHandlers = { left: Array(), right: Array() }
        this.editMode = false
    }

    init() {
        // populate the grid
        this.grid.populateCells((row, col) => new Cell(row, col, GameOfLife.CELL_SIZE))
        this.grid.forEach(cell => cell.alive = false)

        // initialize the overlay
        this.overlayCtx.canvas.oncontextmenu = () => false
        this.overlayCtx.canvas.style.display = this.editMode ? "unset" : "none"

        // deactivate additional layers
        this.layers.permanent.forEach(layer => layer.deactivate())
        this.layers.dynamic.forEach(layer => layer.deactivate())
    }

    draw() {
        // prepare next grid state (copy current)
        const next = this.grid.copy()

        this.grid.forEach(cell => {
            // draw cell
            cell.draw(this.gameCtx)

            // update next cell state
            const nextCell = next.getCell(cell.row, cell.col)
            nextCell.alive = this.willBeAlive(cell)

            // update alive time
            if (nextCell.alive) {
                nextCell.aliveTime += 5
            } else {
                nextCell.aliveTime = 0
            }
        })

        // render additinoal permanent layers
        this.layers.permanent.forEach(layer => {
            this.grid.forEach(cell => {
                layer.render(cell.row, cell.col)
            })
        })

        // set next grid state
        this.grid = next
    }

    toggleEdit() {
        this.editMode = !this.editMode
        this.overlayCtx.canvas.style.display = this.editMode ? "unset" : "none"
    }

    addLeftClickHandler(handler: (row: number, col: number, ctx: CanvasRenderingContext2D) => void) {
        this.clickHandlers.left.push({
            handle: handler
        })
    }

    addRightClickHandler(handler: (row: number, col: number, overlay: CanvasRenderingContext2D) => void) {
        this.clickHandlers.right.push({
            handle: handler
        })
    }

    addPermanentLayer(layer: (row: number, col: number, overlay: CanvasRenderingContext2D) => void, displayCondition?: () => boolean) {
        if (displayCondition) {
            this.layers.permanent.push(new ConditionalLayer(this.gameCtx, layer, displayCondition))
        } else {
            this.layers.permanent.push(new PermanentLayer(this.gameCtx, layer))
        }
    }

    addDynamicLayer(layer: (row: number, col: number, overlay: CanvasRenderingContext2D) => void) {
        this.layers.dynamic.push(new Layer(this.gameCtx, layer))
    }

    getGrid(): CellGrid {
        return this.grid
    }

    isEditModeActive() {
        return this.editMode
    }

    private willBeAlive(cell: Cell): boolean {
        const neighbors = this.grid.getNeighbors(cell)
        const numAlive = neighbors.filter(n => n.alive).length

        let willBeAlive

        // cell is alive and will not die
        if (cell.alive && !(numAlive < 2 || numAlive > 3))
            willBeAlive = true
        // cell is dead but will be born
        else if (!cell.alive && numAlive == 3)
            willBeAlive = true
        // cell is alive but will die or is dead and will not be born
        else
            willBeAlive = false

        return willBeAlive
    }

    private handleClick(e: MouseEvent) {
        const bounds = this.overlayCtx.canvas.getBoundingClientRect()
        const row = Math.floor((e.clientY - bounds.top) / this.grid.size)
        const col = Math.floor((e.clientX - bounds.left) / this.grid.size)
        const isLeftClick = e.button == 0
        const isRightClick = e.button == 2
        if (isLeftClick) {
            for (let handler of this.clickHandlers.left) {
                handler.handle(row, col, this.gameCtx)
            }
        } else if (isRightClick) {
            for (let handler of this.clickHandlers.right) {
                handler.handle(row, col, this.overlayCtx)
            }
        }
    }

    private handleMouseMove(e: MouseEvent) {
        const bounds = this.overlayCtx.canvas.getBoundingClientRect()
        const row = Math.floor((e.clientY - bounds.top) / this.grid.size)
        const col = Math.floor((e.clientX - bounds.left) / this.grid.size)
        for (let layer of this.layers.dynamic) {
            layer.render(row, col)
        }
    }
}