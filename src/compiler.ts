import { AST, TYPE } from './parser';


/**
 * Compiler compiles the AST tree to generate a function
 */
export class Compiler {
  private state: {
    id: number;
    vars: string[];
    body: string[];
  };

  constructor() { }

  compile(ast: AST): Function {
    this.state = {
      id: 0,
      vars: [],
      body: []
    };
    this.recurse(ast);
    return new Function(
      'ctx',
      (this.state.vars.length ?
        'var ' + this.state.vars.join(',') + ';' :
        ''
      ) + this.state.body.join('')
    );
  }

  recurse(ast: AST): string {
    let variable: string;
    switch (ast.type) {
      case TYPE.Program:
        this.state.body.push('return ', this.recurse(ast.body), ';');
        break;
      case TYPE.MemberExpression:
        variable = this.variableDeclaration();
        const left = this.recurse(ast.object);
        const right = ast.computed ? this.recurse(ast.property) : (ast.property as any).name;
        this.state.body.push(
          this.if_(
            left,
            this.assign(
              variable,
              this.member(
                left,
                right,
                ast.computed
              )
            )
          )
        );
        return variable;
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
      case TYPE.Identifier:
        variable = this.variableDeclaration();
        this.state.body.push(
          this.if_(
            'ctx',
            this.assign(
              variable,
              this.member(
                'ctx',
                ast.name
              )
            )
          )
        );
        return variable;
      case TYPE.Literal:
        if (typeof ast.value === 'string') {
          return `'${ast.value}'`;
        }
        return '' + ast.value;
    }
  }

  variableDeclaration(): string {
    const variable = 'v' + this.state.id++;
    this.state.vars.push(variable);
    return variable;
  }

  if_(test: string, consequent: string): string {
    return 'if(' + test + '){' + consequent + '}';
  }

  assign(left: string, right: string): string {
    return left + '=' + right + ';';
  }

  member(left: string, right: string, computed?: boolean): string {
    if (computed) {
      return '(' + left + ')[' + right + ']';
    }
    return '(' + left + ').' + right;
  }
}