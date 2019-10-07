import { parseExpression, expressionToNode } from "../ts/parser"
import * as e from "../ts/expressions"
import { getAllDerivatives, getAllVariables, getDerivativeForExpression, compileExpression } from "../ts/operations"

const parsedExpr = parseExpression("(m1*2*((p3*cos(q3))*(p2*cos(q2)) - l1*p1*((p2*cos(q2)) + (p3*cos(q3)))) + m1*(p2*p2*(cos(q2)*cos(q2)) + p3*p3*(cos(q3)*cos(q3)) + l1*p1*l1*p1) + ((2 - (cos(q2)*cos(q2)) - (cos(q3)*cos(q3)))*m1 + M)*(p2*p2 + p3*p3))/(2*l1*l1*m1*((2 - (cos(q2)*cos(q2)) - (cos(q3)*cos(q3)))*m1 + M)) - g*(l1*m1*cos(q2) + l2*m2*cos(q3))")
console.log(`H: ${expressionToNode(parsedExpr).toString()}`)

const variables = getAllVariables(parsedExpr)

const derivativeQ2 = getDerivativeForExpression(variables["q2"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dq2: ${expressionToNode(derivativeQ2).toString()}`)

const derivativeQ3 = getDerivativeForExpression(variables["q3"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dq3: ${expressionToNode(derivativeQ3).toString()}`)

const derivativeP1 = getDerivativeForExpression(variables["p1"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp1: ${expressionToNode(derivativeP1).toString()}`)

const derivativeP2 = getDerivativeForExpression(variables["p2"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp2: ${expressionToNode(derivativeP2).toString()}`)

const derivativeP3 = getDerivativeForExpression(variables["p3"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp3: ${expressionToNode(derivativeP3).toString()}`)




const parsedExpr2 = parseExpression("sqrt(a^b) * log(b)")
console.log("parsedExpr2: " + expressionToNode(parsedExpr2).toString())

const variables2 = getAllVariables(parsedExpr2)

const context2 = {
    variableValues: {
        "a": 2,
        "b": 3
    }
}

const derivativeA = getDerivativeForExpression(variables2["a"], getAllDerivatives(parsedExpr2, new e.Constant(1)))
console.log("d parsedExpr2 / d a: " + expressionToNode(derivativeA).toString())
console.log("a=2, b=3; d parsedExpr2 / d a: " + derivativeA.evaluate(context2))

const derivativeB = getDerivativeForExpression(variables2["b"], getAllDerivatives(parsedExpr2, new e.Constant(1)))
console.log("d parsedExpr2 / d b: " + expressionToNode(derivativeB).toString())
console.log("a=2, b=3; d parsedExpr2 / d b: " + derivativeB.evaluate(context2))

const compiledDerivativeB = compileExpression(derivativeB)
console.log("Compiled a=2, b=3; d parsedExpr2 / d b: " + compiledDerivativeB(context2))



const context3 = {
    variableValues: {
        "a": 2,
        "b": 3
    }
}

const parsedExpr3 = parseExpression("4 * exp(a * b) / abs(tan(b))")
console.log("parsedExpr3: " + expressionToNode(parsedExpr3).toString())

const variables3 = getAllVariables(parsedExpr3)

const derivativeA3 = getDerivativeForExpression(variables3["a"], getAllDerivatives(parsedExpr3, new e.Constant(1)))
console.log("d parsedExpr3 / d a: " + expressionToNode(derivativeA3).toString())
console.log("a=2, b=3; d parsedExpr3 / d a: " + derivativeA3.evaluate(context3))

const derivativeB3 = getDerivativeForExpression(variables3["b"], getAllDerivatives(parsedExpr3, new e.Constant(1)))
console.log("d parsedExpr3 / d b: " + expressionToNode(derivativeB3).toString())
console.log("a=2, b=3; d parsedExpr3 / d b: " + derivativeB3.evaluate(context3))