import { GridArray } from "./grid.js"

interface Position {
    x: number
    y: number
}

export class Cell {

    readonly row: number
    readonly col: number
    readonly position: Position
    readonly size: number
    alive: boolean
    aliveTime: number

    constructor(row: number, col: number, size: number, aliveTime: number = 0) {
        this.row = row
        this.col = col
        this.position = { x: col * size, y: row * size }
        this.size = size
        this.alive = false
        this.aliveTime = aliveTime
    }

    draw(ctx: CanvasRenderingContext2D) {
        const color = `rgb(0, ${this.aliveTime}, ${this.aliveTime})`
        ctx.fillStyle = this.alive ? color : "white"
        ctx.fillRect(this.position.x, this.position.y, this.size, this.size)
    }

    copy(): Cell {
        const copy = new Cell(this.row, this.col, this.size, this.aliveTime)
        copy.alive = this.alive
        return copy
    }

    toString(): string {
        return `${this.alive ? "alive" : "dead"}`
    }
}

export class CellGrid extends GridArray<Cell> {

    readonly size: number
    private padding: number

    private min: number
    private maxCol: number
    private maxRow: number

    constructor(rows: number, cols: number, size: number, padding: number = 0) {
        super(rows + padding * 2, cols + padding * 2)

        this.size = size
        this.padding = padding

        this.min = 0 - padding
        this.maxCol = cols + padding - 1
        this.maxRow = rows + padding - 1
    }

    populateCells(populator: (row: number, col: number) => Cell) {
        this.populate((row, col) => {
            return populator(row - this.padding, col - this.padding)
        })
    }

    getCells(): Array<Array<Cell>> {
        return this.grid
    }

    getCell(row: number, col: number): Cell {
        return this.get(row + this.padding, col + this.padding)
    }

    setCell(row: number, col: number, cell: Cell) {
        this.set(row + this.padding, col + this.padding, cell)
    }

    getNeighbors(cell: Cell): Array<Cell> {
        const neighbors: Array<Cell> = []

        for (let ro = -1; ro <= 1; ro++) {
            for (let co = -1; co <= 1; co++) {
                const nr = cell.row + ro
                const nc = cell.col + co

                const isTargetCell = nr == cell.row && nc == cell.col
                const isOutOfBounds = nr < this.min || nc < this.min || nr > this.maxRow || nc > this.maxCol
                if (!isTargetCell && !isOutOfBounds)
                    neighbors.push(this.getCell(nr, nc))
            }
        }

        return neighbors
    }

    copy(): CellGrid {
        const next = new CellGrid(this.rows - this.padding * 2, this.cols - this.padding * 2, this.size, this.padding)
        next.populate((row, col) => this.get(row, col).copy())
        return next
    }
}