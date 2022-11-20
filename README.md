# expr2fn

A JavaScript library allows you to dynamically execute JavaScript expressions with speed and safety.

## Quickstart

1. Install:

   ```
   npm install expr2fn
   ```

2. Add to your project:

   ```
   // File: app.ts
   import expr2fn from 'expr2fn';

   // Create an expression
   const expr = 'a.b[0] + c() - d["e"]';

   // Compile the expression
   const fn = expr2fn(expr);

   // Execute the compiled function within a context
   const ctx = {
     a: {
       b: [1, 2, 3]
     },
     c: () => 4,
     d: {
       e: 5
     }
   };
   const val = fn(ctx); // => 0

   // You can also execute an expression without providing a context
   expr2fn('12')(); // => 12
   ```

## Installation

Follow the steps below to get started with this project's development environment:

1. Install Node (v13.x+).

2. Clone this repository and navidate into it:

   ```
   git clone https://github.com/paveew/expr2fn.git
   cd expr2fn
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Test:

   ```
   npm run test
   ```

You are ready to develop!


## API

### expr2fn()

Compile an expression into an executable function. The valid syntax for expressions is a subset of JavaScript syntax, as follows:

* Literals
  * Number
  * String
  * Boolean
  * Object
  * Array
  * `null` and `undefined`
* Operators:
  * Unary: `+`, `-` and `!`
  * Multiplicative: `*`, `/` and `%`
  * Additive: `+` and `-`
  * Relational: `>`, `<`, `>=` and `<=`
  * Equality: `==`, `!=`, `===` and `!==`
  * Logical: `&&` and `||`
  * Ternary: `?` and `:`
* Function/Method Call

The precedence of above operators is the same as in JavaScript. You can also use parentheses to change the precedence.

## Why use `expr2fn`

The common way to dynamically execute JavaScript expressions is to use `eval` or `Function`. However, `expr2fn` has advantages in the following aspects:

### Efficiency
   
When you use `eval` to evaluate a same expression multiple times, the expression is compiled by the JavaScript interpreter each time. 
   
By using `expr2fn`, the same expression is compiled only once, no matter how many times the returned function is invoked, just like how `Function` works!


### Security

The context in which `eval` and `Function` were invoked can be modified by expressions, especially when they are provided by the user. For example:

* assignment: `eval('a = null')`

* deletion: `eval('delete a')`

With `expr2fn`, not only expressions are restricted like assignment, deletion and function construction are also disallowed.

The currently supported syntax does not include all JavaScript syntax, but it is enough for scenarios like template rendering.

## License

[MIT](./LICENSE)