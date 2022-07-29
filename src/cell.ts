import { GridArray } from "./grid.js"

interface Position {
    x: number
    y: number
}

export class Cell {

    readonly position: Position
    readonly size: number
    alive: boolean

    constructor(x: number, y: number, size: number) {
        this.position = { x, y }
        this.size = size
        this.alive = false
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.alive ? "green" : "white"
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size)
    }

    copy(): Cell {
        const copy = new Cell(this.position.x, this.position.y, this.size)
        copy.alive = this.alive
        return copy
    }
}

export class CellGrid extends GridArray<Cell> {

    private width: number
    private height: number
    private size: number

    constructor(width: number, height: number, size: number) {
        const rows = height / size
        const cols = width / size
        super(rows, cols)

        this.width = width
        this.height = height
        this.size = size
    }

    getCell(x: number, y: number): Cell {
        const row = y / this.size
        const col = x / this.size
        return this.grid[row][col]
    }

    setCell(x: number, y: number, object: Cell) {
        const row = y / this.size
        const col = x / this.size
        this.grid[row][col] = object
    }

    getNeighbors(x: number, y: number): Array<Cell> {
        const neighbors: Array<Cell> = []

        for (let xo = -this.size; xo <= this.size; xo += this.size) {
            for (let yo = -this.size; yo <= this.size; yo += this.size) {
                const nx = x + xo
                const ny = y + yo

                const isTargetCell = nx == x && ny == y
                const isOutOfBounds = nx < 0 || ny < 0 || nx >= this.width || ny >= this.height
                if (!isTargetCell && !isOutOfBounds)
                    neighbors.push(this.getCell(nx, ny))
            }
        }

        return neighbors
    }

    copy(): CellGrid {
        const next = new CellGrid(this.width, this.height, this.size)
        next.populate((row, col) => this.get(row, col).copy())
        return next
    }
}