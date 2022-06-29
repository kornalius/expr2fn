import { AST, TYPE } from './parser';


/**
 * Compiler compiles the AST tree to generate a function
 */
export class Compiler {
  private state: { body: (number | string | boolean | null | undefined)[]; };

  constructor() { }

  compile(ast: AST): Function {
    this.state = { body: [] };
    this.recurse(ast);
    return new Function(this.state.body.join(''));
  }

  recurse(ast: AST): number | string | boolean | null | undefined {
    switch (ast.type) {
      case TYPE.Program:
        this.state.body.push('return ', this.recurse(ast.body), ';');
        break;
      case TYPE.Literal:
        if (typeof ast.value === 'string') {
          return `'${ast.value}'`;
        }
        if (ast.value === null) {
          return 'null';
        }
        return ast.value;
    }
  }
}