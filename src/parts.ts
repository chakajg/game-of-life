import { Cell, CellGrid } from "./cell.js";

enum Orientation {
    N, E, S, W, NE, SE, SW, NW
}

interface Location {
    row: number
    col: number
}

interface Part {
    create(row: number, col: number, grid: CellGrid): Array<Cell>
}

class Glider implements Part {
    private structure: Array<Location>

    constructor(orientation: Orientation) {
        switch (orientation) {
            case Orientation.NE:
                this.structure = [
                    { row: 0, col: 1 },
                    { row: 1, col: 0 },
                    { row: 2, col: 0 },
                    { row: 2, col: 1 },
                    { row: 2, col: 2 }
                ]
                break
            case Orientation.SE:
                this.structure = [
                    { row: 0, col: 1 },
                    { row: 1, col: 2 },
                    { row: 2, col: 0 },
                    { row: 2, col: 1 },
                    { row: 2, col: 2 }
                ]
                break
            case Orientation.SW:
                this.structure = [
                    { row: 0, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: 2 },
                    { row: 1, col: 2 },
                    { row: 2, col: 1 }
                ]
                break
            case Orientation.NW:
                this.structure = [
                    { row: 0, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: 2 },
                    { row: 1, col: 0 },
                    { row: 2, col: 1 }
                ]
                break
            default:
                throw Error(`Unsupported orientation value: '${orientation}'`)
        }
    }

    create(row: number, col: number, grid: CellGrid): Array<Cell> {
        let cells = []
        cells.push(grid.getCell(row + this.structure[0].row, col + this.structure[0].col))
        cells.push(grid.getCell(row + this.structure[1].row, col + this.structure[1].col))
        cells.push(grid.getCell(row + this.structure[2].row, col + this.structure[2].col))
        cells.push(grid.getCell(row + this.structure[3].row, col + this.structure[3].col))
        cells.push(grid.getCell(row + this.structure[4].row, col + this.structure[4].col))
        return cells
    }
}

class Singleton implements Parts {
    create(row: number, col: number, grid: CellGrid): Array<Cell> {
        return [grid.getCell(row, col)]
    }
}

export class Parts {
    private static LIST: Array<Part> = [
        new Glider(Orientation.NE),
        new Glider(Orientation.SE),
        new Glider(Orientation.SW),
        new Glider(Orientation.NW),
        new Singleton()
    ]

    static get(index: number): Part {
        return Parts.LIST[index % Parts.LIST.length]
    }
}