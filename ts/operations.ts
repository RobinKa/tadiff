import { Expression, Add, Constant, Variable, EvaluationContext } from "./expressions"
import { expressionToNode } from "./parser"

export function* getAllDerivatives(output: Expression, gradOutput: Expression): IterableIterator<{ expression: Expression, derivative: Expression }> {
    yield { expression: output, derivative: gradOutput }

    const dependencies = output.getDependencies()
    const dependencyDerivatives = output.getDependencyDerivatives()

    let dependency = dependencies.next()
    let dependencyDerivative = dependencyDerivatives.next()
    while (!dependency.done && !dependencyDerivative.done) {
        const derivatives = getAllDerivatives(dependency.value, dependencyDerivative.value(gradOutput))

        let der = derivatives.next()
        while (!der.done) {
            yield der.value
            der = derivatives.next()
        }

        dependency = dependencies.next()
        dependencyDerivative = dependencyDerivatives.next()
    }
}

export function getDerivativeForExpression(expression: Expression, derivatives: IterableIterator<{ expression: Expression, derivative: Expression }>) {
    let sum: Expression | null = null

    let derivative = derivatives.next()
    while (!derivative.done) {
        if (derivative.value.expression === expression) {
            sum = sum ? new Add(sum, derivative.value.derivative) : derivative.value.derivative
        }

        derivative = derivatives.next()
    }

    return sum ? sum : new Constant(0)
}

export function getAllVariables(output: Expression) {
    const variables: { [name: string]: Variable } = {}

    traverseBreadthFirst(output, expr => {
        if (expr instanceof Variable) {
            variables[expr.name] = expr
        }
    })

    return variables
}

export function compileExpression(expression: Expression): (context: EvaluationContext) => number {
    const compiled = expressionToNode(expression).compile()
    return context => compiled.evaluate(context.variableValues)
}

export type ExpressionVisitorFunction = (expr: Expression) => void

export function traverseBreadthFirst(expr: Expression, visit: ExpressionVisitorFunction) {
    visit(expr)

    for (const dependency of expr.getDependencies()) {
        traverseBreadthFirst(dependency, visit)
    }
}

export function traverseDepthFirst(expr: Expression, visit: ExpressionVisitorFunction) {
    for (const dependency of expr.getDependencies()) {
        traverseDepthFirst(dependency, visit)
    }

    visit(expr)
}