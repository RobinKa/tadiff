export type GradFunction = (gradOutput: Expression) => Expression

export type EvaluationContext = {
    variableValues: { [variableName: string]: number }
}

export interface Expression {
    getDependencies: () => IterableIterator<Expression>
    getDependencyDerivatives: () => IterableIterator<GradFunction>
    evaluateToString: () => string
    evaluate: (context: EvaluationContext) => number

    breadthFirst: (visit: (expr: Expression) => void) => void
}

export type UnaryExpression = {
    a: Expression
} & Expression

export type BinaryExpression = {
    a: Expression
    b: Expression
} & Expression

export type ExpressionVisitorFunction = (expr: Expression) => void

function breadthFirstFinal(visit: ExpressionVisitorFunction, expr: Expression) {
    visit(expr)
}

function breadthFirstUnary(visit: ExpressionVisitorFunction, expr: UnaryExpression) {
    visit(expr)
    expr.a.breadthFirst(visit)
}

function breadthFirstBinary(visit: ExpressionVisitorFunction, expr: BinaryExpression) {
    visit(expr)
    expr.a.breadthFirst(visit)
    expr.b.breadthFirst(visit)
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

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstFinal(visit, this)
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

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstFinal(visit, this)
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

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstBinary(visit, this)
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
        yield (dOutput: Expression) => new Multiply(new Constant(-1), dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} - ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) - this.b.evaluate(context)

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstBinary(visit, this)
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

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstBinary(visit, this)
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
        yield (dOutput: Expression) => new Multiply(new Divide(new Constant(1), this.b), dOutput)

        // d(a * b) / db = -a / b^2
        yield (dOutput: Expression) => new Multiply(new Divide(new Multiply(new Constant(-1), this.a), new Multiply(this.b, this.b)), dOutput)
    }

    evaluateToString = () => `(${this.a.evaluateToString()} / ${this.b.evaluateToString()})`
    evaluate = (context: EvaluationContext) => this.a.evaluate(context) / this.b.evaluate(context)

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstBinary(visit, this)
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

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstUnary(visit, this)
}

export class Cos implements Expression {
    constructor(readonly a: Expression) {

    }

    *getDependencies(): IterableIterator<Expression> {
        yield this.a
    }

    *getDependencyDerivatives(): IterableIterator<GradFunction> {
        // d(cos(a)) / da = -sin(a)
        yield (dOutput: Expression) => new Multiply(new Multiply(new Constant(-1), new Sin(this.a)), dOutput)
    }

    evaluateToString = () => `cos(${this.a.evaluateToString()})`
    evaluate = (context: EvaluationContext) => Math.cos(this.a.evaluate(context))

    breadthFirst = (visit: ExpressionVisitorFunction) => breadthFirstUnary(visit, this)
}