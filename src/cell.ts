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

    toString(): string {
        return `${this.alive ? "alive" : "dead"}`
    }
}

export class CellGrid extends GridArray<Cell> {

    private width: number
    private height: number
    private size: number
    private padding: number

    private min: number
    private maxX: number
    private maxY: number

    constructor(width: number, height: number, size: number, padding: number = 0) {
        const rows = (height + padding * 2) / size
        const cols = (width + padding * 2) / size
        super(rows, cols)

        this.width = width
        this.height = height
        this.size = size
        this.padding = padding

        this.min = 0 - padding
        this.maxX = width + padding
        this.maxY = height + padding
    }

    populateCells(populator: (x: number, y: number) => Cell) {
        this.populate((row, col) => {
            const x = col * this.size - this.padding
            const y = row * this.size - this.padding
            return populator(x, y)
        })
    }

    getCells(): Array<Array<Cell>> {
        return this.grid
    }

    getCell(x: number, y: number): Cell {
        const row = (y + this.padding) / this.size
        const col = (x + this.padding) / this.size
        return this.get(row, col)
    }

    setCell(x: number, y: number, cell: Cell) {
        const row = (y + this.padding) / this.size
        const col = (x + this.padding) / this.size
        this.set(row, col, cell)
    }

    getNeighbors(x: number, y: number): Array<Cell> {
        const neighbors: Array<Cell> = []

        for (let xo = -this.size; xo <= this.size; xo += this.size) {
            for (let yo = -this.size; yo <= this.size; yo += this.size) {
                const nx = x + xo
                const ny = y + yo

                const isTargetCell = nx == x && ny == y
                const isOutOfBounds = nx < this.min || ny < this.min || nx >= this.maxX || ny >= this.maxY
                if (!isTargetCell && !isOutOfBounds)
                    neighbors.push(this.getCell(nx, ny))
            }
        }

        return neighbors
    }

    copy(): CellGrid {
        const next = new CellGrid(this.width, this.height, this.size, this.padding)
        next.populate((row, col) => this.get(row, col).copy())
        return next
    }
}