import { parseExpression } from "../dist/parser"
import * as e from "../dist/expressions.js"
import { getAllDerivatives, getAllVariables, getDerivativeForExpression } from "../dist/operations.js"

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