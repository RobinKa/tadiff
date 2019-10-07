# Tora's Automatic Differentiation
Reverse-mode automatic differentiation for javascript and typescript. Supports symbolic and numeric modes. Only scalars are supported right now.

# Installation
`npm install tadiff`

Can also be built by cloning this repository and running `npm run build`. Tests can be run with `npm run test`.

# Usage
Import the module in typescript `import * as tad from "tadiff"` or in javascript `const tad = require("tadiff");`

## 1. Build an expression
Building a math expression can be done by constructing the tree with the expression classes manually. This can get verbose very quickly so
alternatively a string parser is available.

With expression objects:
```ts
import * as tad from "tadiff"

const varA = new tad.Variable("a")
const varB = new tad.Variable("b")
const expr = new tad.Divide(new tad.Multiply(new tad.Constant(4), new tad.Exp(new tad.Multiply(varA, varB))), new tad.Abs(new tad.Tan(varB)))
```

With string parser:
```ts
import * as tad from "tadiff"

const expr = tad.parseExpression("4 * exp(a * b) / abs(tan(b))")

// Get the variables of the expression.
// Stored as variables["a"] and variables["b"].
const vars = tad.getAllVariables(expr)
```

The expression can now be used for numeric evaluation using numbers. Values for all variables have to be passed. The expression can also be printed symbolically.

```ts
console.log(expr.evaluateToString())

const evalContext = {
    variableValues: {
        "a": 2,
        "b": 3
    }
}

console.log(expr.evaluate(evalContext))
```

## 2. Differentiate an expression
To differentiate an expression we first get all derivatives of an expression using `getAllDerivatives`. An output derivative has to be passed, this is typically just `1`.
This will produce all derivatives for all variables within the expression, although each variable has multiple derivatives which have to be summed up using `getDerivativeForExpression`.
Note that this will give back an expression for the derivative. There is nothing special about this expression and it can be used just like any other expression, for example
it can be used to build higher order derivatives.

```ts
const derivativeA = tad.getDerivativeForExpression(variables["a"], tad.getAllDerivatives(expr, new tad.Constant(1)))
const derivativeB = tad.getDerivativeForExpression(variables["b"], tad.getAllDerivatives(expr, new tad.Constant(1)))
```

## 3. Interop with mathjs
This library uses mathjs for some of its operations such as parsing and simplification.
To convert from tadiff expressions to mathjs expressions use `nodeToExpression`. Here we will also have to pass a `tad.Variable` for
each of the variable symbols occuring in the node tree.
To convert from mathjs expressions to tadiff expressions use `expressionToNode`.

A good use-case of converting to mathjs nodes is to simplify the tadiff expressions as no simplification is done in tadiff. `expressionToNode`
automatically calls the simplify function.

# Expressions
Listed below are the available expressions as both the tad classes and the string that can be used for string parsing.

| Operation | Class | String parsing |
| --------- | :---: | :---------------: |
| Constant number | Constant | a number (eg. `5`, `3.45`) |
| Variable | Variable | letters (eg. `v`, `px3`) |
| Addition | Add | `+` |
| Subtraction | Subtract | `-` |
| Multiplication | Multiply | `*` |
| Division | Divide | `/` |
| Power | Power | `^` |
| Sine | Sin | `sin` |
| Cosine | Cos | `cos` |
| Tan | Tan | `tan` |
| Natural logarithm | Log | `log` |
| Negation | Negate | `-` |
| Natural exponential | Exp | `exp` |
| Sign | Sign | `sign` |
| Absolute value | Abs | `abs` |
| Square root | Power(..., 0.5) | `sqrt` |

# Adding new operations
Creating new operations requires implementing the `tad.Expression` interface. Most importantly the used inputs are passed through the constructor and need
to be returned from `getDependencies`.
`evaluate` will need to return the numeric result. `evaluateToString` returns a symbolic string. `getDependencyDerivatives` needs to return
the derivatives for the dependencies in the same order as `getDependencies`. For more information look at the `expressions.ts` source code as
most expressions are only around 20 lines long.
If you do implement a new operation I would be happy to accept a pull request for it.