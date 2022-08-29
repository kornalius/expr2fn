import { AST, TYPE } from './parser';


/**
 * Compiler compiles the AST tree to generate a function
 */
export class Compiler {
  private state: { body: string[]; };

  constructor() { }

  compile(ast: AST): Function {
    this.state = { body: [] };
    this.recurse(ast);
    return new Function(this.state.body.join(''));
  }

  recurse(ast: AST): string {
    switch (ast.type) {
      case TYPE.Program:
        this.state.body.push('return ', this.recurse(ast.body), ';');
        break;
      case TYPE.ArrayExpression:
        const elements = [];
        for (let i = 0; i < ast.elements.length; i++) {
          if (ast.elements[i]) {
            elements[i] = this.recurse(ast.elements[i]);
          }
        }
        return '[' + elements.join(',') + ']';
      case TYPE.ObjectExpression:
        const properties = ast.properties.map(property => {
          const key = property.key.type === TYPE.Identifier ? property.key.name : this.recurse(property.key);
          const value = this.recurse(property.value);
          return key + ':' + value;
        });
        return '{' + properties.join(',') + '}';
      case TYPE.Literal:
        if (typeof ast.value === 'string') {
          return `'${ast.value}'`;
        }
        return '' + ast.value;
    }
  }
}