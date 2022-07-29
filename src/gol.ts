import { Cell, CellGrid } from "./cell.js"
import { Util } from "./util.js"

export class GameOfLife {

    private static PADDING = 100
    private static CELL_SIZE = 10

    private width: number
    private height: number
    private ctx: CanvasRenderingContext2D

    private grid: CellGrid

    constructor(canvasId: string) {
        const canvas = document.querySelector<HTMLCanvasElement>(`#${canvasId}`)!!
        this.width = canvas.width + GameOfLife.PADDING
        this.height = canvas.height + GameOfLife.PADDING
        this.ctx = canvas.getContext("2d")!!

        this.grid = new CellGrid(this.width, this.height, GameOfLife.CELL_SIZE)
    }


    init() {
        this.grid.populate((row, col) => new Cell(col * GameOfLife.CELL_SIZE, row * GameOfLife.CELL_SIZE, GameOfLife.CELL_SIZE))
        this.grid.forEach(cell => cell.alive = Util.random())
    }

    draw() {
        const next = this.grid.copy()
        this.grid.forEach(cell => {
            cell.draw(this.ctx)

            const nextCell = next.getCell(cell.position.x, cell.position.y)
            nextCell.alive = this.willBeAlive(cell)
        })
        this.grid = next
    }

    private willBeAlive(cell: Cell): boolean {
        const x = cell.position.x
        const y = cell.position.y

        const neighbors = this.grid.getNeighbors(x, y)
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
}