export type GradFunction = (gradOutput: Expression) => Expression

export type EvaluationContext = {
    variableValues: { [variableName: string]: number }
}

export interface Expression {
    getDependencies: () => IterableIterator<Expression>
    getDependencyDerivatives: () => IterableIterator<GradFunction>
    evaluateToString: () => string
    evaluate: (context: EvaluationContext) => number
}

export class Constant implements Expression {
    constructor(readonly value: number) {

    }

    *getDependencies(): IterableIterator<Expression> {
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        yield gradOutput => new Constant(0)
    }

    evaluateToString = () => this.value.toString()
    evaluate = (context: EvaluationContext) => this.value
}

export class Variable implements Expression {
    constructor(readonly name: string) {

    }

    *getDependencies(): IterableIterator<Expression> {
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
    }

    evaluateToString = () => this.name.toString()
    evaluate = (context: EvaluationContext) => {
        const value = context.variableValues[this.name]
        if (value === undefined) {
            throw new Error(`No value specified for variable ${this.name}`)
        }
        return value
    }
}

export class Add implements Expression {
    constructor(readonly a: Expression, readonly b: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
        yield this.b
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(a + b) / da = 1
        yield (dOutput: Expression) => dOutput

        // d(a + b) / db = 1
        yield (dOutput: Expression) => dOutput
    }

    evaluateToString = () => `(${this.a.evaluateToString()} + ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) + this.b.evaluate(context)
}

export class Subtract implements Expression {
    constructor(readonly a: Expression, readonly b: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
        yield this.b
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(a - b) / da = 1
        yield (dOutput: Expression) => dOutput

        // d(a - b) / db = -1
        yield (dOutput: Expression) => new Negate(dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} - ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) - this.b.evaluate(context)
}

export class Multiply implements Expression {
    constructor(readonly a: Expression, readonly b: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
        yield this.b
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(a * b) / da = b
        yield (dOutput: Expression) => new Multiply(this.b, dOutput)

        // d(a * b) / db = a
        yield (dOutput: Expression) => new Multiply(this.a, dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} * ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) * this.b.evaluate(context)
}

export class Divide implements Expression {
    constructor(readonly a: Expression, readonly b: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
        yield this.b
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(a / b) / da = 1 / b
        yield (dOutput: Expression) => new Divide(dOutput, this.b)

        // d(a * b) / db = -a / b^2
        yield (dOutput: Expression) => new Multiply(new Divide(new Negate(this.a), new Power(this.b, new Constant(2))), dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} / ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) / this.b.evaluate(context)
}

export class Sin implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(sin(a)) / da = cos(a)
        yield (dOutput: Expression) => new Multiply(new Cos(this.a), dOutput)
    }

    evaluateToString = () => `sin(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.sin(this.a.evaluate(context))
}

export class Cos implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(cos(a)) / da = -sin(a)
        yield (dOutput: Expression) => new Multiply(new Negate(new Sin(this.a)), dOutput)
    }

    evaluateToString = () => `cos(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.cos(this.a.evaluate(context))
}

export class Tan implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(tan(a)) / da = sec(a)^2 = 1 / (cos(a)^2)
        yield (dOutput: Expression) => new Divide(dOutput, new Power(new Cos(this.a), new Constant(2)))
    }

    evaluateToString = () => `tan(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.tan(this.a.evaluate(context))
}

export class Log implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(ln(a)) / da = 1 / a
        yield (dOutput: Expression) => new Divide(dOutput, this.a)
    }

    evaluateToString = () => `log(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.log(this.a.evaluate(context))
}

export class Power implements Expression {
    constructor(readonly a: Expression, readonly b: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
        yield this.b
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(a^b) / da = b * a^(b - 1)
        yield (dOutput: Expression) => new Multiply(new Multiply(this.b, new Power(this.a, new Subtract(this.b, new Constant(1)))), dOutput)

        // d(a^b) / db = a^b * log(a)
        yield (dOutput: Expression) => new Multiply(new Multiply(new Power(this.a, this.b), new Log(this.a)), dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} ^ ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.pow(this.a.evaluate(context), this.b.evaluate(context))
}

export class Negate implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(-a) / da = -1
        yield (dOutput: Expression) => new Negate(dOutput)
    }

    evaluateToString = () => `(-${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => -this.a.evaluate(context)
}

export class Exp implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(e^a) / da = e^a
        yield (dOutput: Expression) => new Multiply(this, dOutput)
    }

    evaluateToString = () => `exp(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.exp(this.a.evaluate(context))
}

export class Sign implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(sign(a)) / da = 0
        // Technically the derivative at 0 is not defined, but we ignore this
        // and make it 0 everywhere.
        yield (dOutput: Expression) => new Constant(0)
    }

    evaluateToString = () => `sign(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.sign(this.a.evaluate(context))
}

export class Abs implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(|a|) / da = sign(a)
        yield (dOutput: Expression) => new Multiply(new Sign(this.a), dOutput)
    }

    evaluateToString = () => `abs(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.abs(this.a.evaluate(context))
}