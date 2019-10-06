import * as mathjs from "mathjs"
import * as expr from "./expressions"

function nodeToExpression(node: mathjs.MathNode, variables: { [name: string]: expr.Variable }): expr.Expression {
    const nodeUnsafe: any = node

    if (node.isOperatorNode && node.args) {
        const exprA = nodeToExpression(node.args[0], variables)
        if (nodeUnsafe.isBinary()) {
            const exprB = nodeToExpression(node.args[1], variables)

            switch (node.op) {
                case "+":
                    return new expr.Add(exprA, exprB)
                case "-":
                    return new expr.Subtract(exprA, exprB)
                case "*":
                    return new expr.Multiply(exprA, exprB)
                case "/":
                    return new expr.Divide(exprA, exprB)
                case "^":
                    return new expr.Power(exprA, exprB)
                default:
                    throw new Error("Unknown binary operator " + node.op)
            }
        } else {
            switch (node.op) {
                case "-":
                    return new expr.Multiply(new expr.Constant(-1), exprA)
                default:
                    throw new Error("Unknown unary operator " + node.op)
            }
        }
    } else if (node.isSymbolNode && node.name) {
        if (!(node.name in variables)) {
            variables[node.name] = new expr.Variable(node.name)
        }
        return variables[node.name]
    } else if (node.isConstantNode && node.value) {
        return new expr.Constant(node.value)
    } else if (node.isFunctionNode && node.args) {
        const fn = nodeUnsafe.fn // Bug in type def. fn is symbol, not string
        const exprA = nodeToExpression(node.args[0], variables)
        switch (fn.name) {
            case "sin":
                return new expr.Sin(exprA)
            case "cos":
                return new expr.Cos(exprA)
            case "log":
                return new expr.Log(exprA)
            case "sqrt":
                return new expr.Power(exprA, new expr.Constant(0.5))
            default:
                throw new Error("Unknown function " + fn.name)
        }
    } else if (node.isParenthesisNode && nodeUnsafe.content) {
        return nodeToExpression(nodeUnsafe.content, variables)
    }

    throw new Error("Unknown node: " + node.toString() + " " + node.type)
}

export function parseExpression(expressionString: string) {
    const rootNode = mathjs.simplify(mathjs.parse(expressionString))
    return nodeToExpression(rootNode, {})
}