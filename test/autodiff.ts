import { parseExpression } from "../ts/parser"
import * as e from "../ts/expressions"
import { getAllDerivatives, getAllVariables, getDerivativeForExpression } from "../ts/operations"

const parsedExpr = parseExpression("(m1*2*((p3*cos(q3))*(p2*cos(q2)) - l1*p1*((p2*cos(q2)) + (p3*cos(q3)))) + m1*(p2*p2*(cos(q2)*cos(q2)) + p3*p3*(cos(q3)*cos(q3)) + l1*p1*l1*p1) + ((2 - (cos(q2)*cos(q2)) - (cos(q3)*cos(q3)))*m1 + M)*(p2*p2 + p3*p3))/(2*l1*l1*m1*((2 - (cos(q2)*cos(q2)) - (cos(q3)*cos(q3)))*m1 + M)) - g*(l1*m1*cos(q2) + l2*m2*cos(q3))")
console.log(`H: ${parsedExpr.evaluateToString()}`)

const variables = getAllVariables(parsedExpr)

const derivativeQ2 = getDerivativeForExpression(variables["q2"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dq2: ${derivativeQ2.evaluateToString()}`)

const derivativeQ3 = getDerivativeForExpression(variables["q3"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dq3: ${derivativeQ3.evaluateToString()}`)

const derivativeP1 = getDerivativeForExpression(variables["p1"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp1: ${derivativeP1.evaluateToString()}`)

const derivativeP2 = getDerivativeForExpression(variables["p2"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp2: ${derivativeP2.evaluateToString()}`)

const derivativeP3 = getDerivativeForExpression(variables["p3"], getAllDerivatives(parsedExpr, new e.Constant(1)))
console.log(`dH/dp3: ${derivativeP3.evaluateToString()}`)




const parsedExpr2 = parseExpression("sqrt(a^b) * log(b)")
console.log("parsedExpr2: " + parsedExpr2.evaluateToString())

const variables2 = getAllVariables(parsedExpr2)

const context2 = {
    variableValues: {
        "a": 2,
        "b": 3
    }
}

const derivativeA = getDerivativeForExpression(variables2["a"], getAllDerivatives(parsedExpr2, new e.Constant(1)))
console.log("d parsedExpr2 / d a: " + derivativeA.evaluateToString())
console.log("a=2, b=3; d parsedExpr2 / d a: " + derivativeA.evaluate(context2))

const derivativeB = getDerivativeForExpression(variables2["b"], getAllDerivatives(parsedExpr2, new e.Constant(1)))
console.log("d parsedExpr2 / d b: " + derivativeB.evaluateToString())
console.log("a=2, b=3; d parsedExpr2 / d b: " + derivativeB.evaluate(context2))