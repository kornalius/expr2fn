import { AST, TYPE } from './parser';


/**
 * Compiler compiles the AST tree to generate a function
 */
export class Compiler {
  private state: { body: (number | string)[]; };

  constructor() { }

  compile(ast: AST): Function {
    this.state = { body: [] };
    this.recurse(ast);
    return new Function(this.state.body.join(''));
  }

  recurse(ast: AST): number | string {
    switch (ast.type) {
      case TYPE.Program:
        this.state.body.push('return ', this.recurse(ast.body), ';');
        break;
      case TYPE.Literal:
        return typeof ast.value === 'string' ? `'${ast.value}'` : ast.value;
    }
  }
}