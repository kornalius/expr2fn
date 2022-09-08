import type { Token } from './lexer';


export enum TYPE {
  Program = 'Program',
  CallExpression = 'CallExpression',
  MemberExpression = 'MemberExpression',
  ArrayExpression = 'ArrayExpression',
  ObjectExpression = 'ObjectExpression',
  Property = 'Property',
  Identifier = 'Identifier',
  Literal = 'Literal'
};
export type AST = Program | Primary;
type Program = { type: TYPE.Program; body: Primary; };
type Primary = CallExpression | MemberExpression | ArrayExpression | ObjectExpression | Property | Identifier | Literal;
type CallExpression = { type: TYPE.CallExpression; callee: Primary; arguments: Primary[]; };
type MemberExpression = { type: TYPE.MemberExpression; object: Primary; property: Primary; computed: boolean; };
type ArrayExpression = { type: TYPE.ArrayExpression; elements: Primary[]; };
type ObjectExpression = { type: TYPE.ObjectExpression; properties: Property[]; }
type Property = { type: TYPE.Property; key: Identifier | Literal; value: Primary; };
type Identifier = { type: TYPE.Identifier; name: string; }
type Literal = { type: TYPE.Literal; value: number | string | boolean | null | undefined; };


/**
 * Parser parses the tokens to build an AST tree
 */
export class Parser {
  private tokens: Token[];

  constructor() { }

  parse(tokens: Token[]): AST {
    this.tokens = tokens;
    return this.program();
  }

  private program(): AST {
    return {
      type: TYPE.Program,
      body: this.primary()
    };
  }

  private primary(): Primary {
    let primary: Primary;
    if (this.is('[')) {
      primary = this.array();
    } else if (this.is('{')) {
      primary = this.object();
    } else if (this.peek().identifier) {
      primary = this.identifier();
    } else {
      primary = this.constant();
    }
    while (this.is('.') || this.is('[') || this.is('(')) {
      if (this.is('(')) {
        primary = this.call(primary);
      } else {
        const computed = this.is('[');
        primary = this.member(primary, computed);
      }
    }
    return primary;
  }

  private call(callee: Primary): CallExpression {
    const args: Primary[] = [];
    this.consume('(');
    while (!this.is(')')) {
      args.push(this.primary());
      if (this.is(',')) {
        this.consume(',');
      } else {
        break;
      }
    }
    this.consume(')');
    return {
      type: TYPE.CallExpression,
      callee,
      arguments: args
    };
  }

  private member(object: Primary, computed: boolean): MemberExpression {
    let property: Primary;
    if (computed) {
      this.consume('[');
      property = this.primary();
      this.consume(']');
    } else {
      this.consume('.');
      property = this.identifier();
    }
    return {
      type: TYPE.MemberExpression,
      object,
      property,
      computed
    };
  };

  private array(): ArrayExpression {
    const elements: Primary[] = [];
    this.consume('[');
    while (!this.is(']')) {
      if (this.is(',')) {
        this.consume(',');
        if (this.is(']')) {
          break;
        }
        elements.push(null);
        continue;
      }
      elements.push(this.primary());
      if (this.is(',')) {
        this.consume(',');
      } else {
        break;
      }
    }
    this.consume(']');
    return {
      type: TYPE.ArrayExpression,
      elements
    };
  }

  private object(): ObjectExpression {
    const properties: Property[] = [];
    this.consume('{');
    while (!this.is('}')) {
      const key = this.peek().identifier ? this.identifier() : this.constant();
      this.consume(':');
      const value = this.primary();
      properties.push({
        type: TYPE.Property,
        key,
        value
      });
      if (this.is(',')) {
        this.consume(',')
      } else {
        break;
      }
    }
    this.consume('}');
    return {
      type: TYPE.ObjectExpression,
      properties
    };
  }

  private identifier(): Identifier {
    return {
      type: TYPE.Identifier,
      name: this.consume().text
    };
  }

  private constant(): Literal {
    return {
      type: TYPE.Literal,
      value: this.consume().value
    };
  }

  private peek(): Token {
    if (this.tokens.length > 0) {
      return this.tokens[0];
    }
  }

  private is(ch: string): boolean {
    const token = this.peek();
    return token && token.text === ch;
  }

  private consume(ch?: string): Token {
    if (ch && !this.is(ch)) {
      throw `Unexpected. Expecting '${ch}'`;
    }
    return this.tokens.shift();
  }
}