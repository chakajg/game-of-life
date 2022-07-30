export class Util {

    private constructor() { }

    static random(factor: number = 0.5) {
        if (factor <= 0 || factor >= 1) throw Error("Factor must be > 0 and < 1.")
        return Math.random() < factor
    }
}