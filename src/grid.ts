export class GridArray<T> {

    protected grid: Array<Array<T>>
    protected cols: number
    protected rows: number

    protected populated: boolean

    constructor(rows: number, cols: number) {
        this.grid = []
        this.rows = rows
        this.cols = cols

        for (let row = 0; row < this.rows; row++) {
            this.grid[row] = []
        }

        this.populated = false
    }

    populate(populator: (row: number, col: number) => T) {
        this.populated = true
        this.iterate((row: number, col: number) => {
            const t = populator.call(this, row, col)
            this.set(row, col, t)
        })
    }

    get(row: number, col: number): T {
        if (!this.populated) throw Error("call populate first.")
        if (row < 0 || row > this.rows) throw Error("row must be > 0 and < rows.")
        if (col < 0 || col > this.cols) throw Error("col must be > 0 and < cols.")

        return this.grid[row][col]
    }

    set(row: number, col: number, object: T) {
        if (!this.populated) throw Error("call populate first.")
        if (row < 0 || row > this.rows) throw Error("row must be > 0 and < rows.")
        if (col < 0 || col > this.cols) throw Error("col must be > 0 and < cols.")

        this.grid[row][col] = object
    }

    forEach(action: (t: T) => void) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                action(this.get(row, col))
            }
        }
    }

    iterate(action: (row: number, col: number) => void) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                action(row, col)
            }
        }
    }
}