import type { Token } from './lexer';


export enum TYPE {
  Program = 'Program',
  ArrayExpression = 'ArrayExpression',
  ObjectExpression = 'ObjectExpression',
  Property = 'Property',
  Identifier = 'Identifier',
  Literal = 'Literal'
};
export type AST = Program | Primary;
type Program = { type: TYPE.Program; body: Primary; };
type Primary = ArrayExpression | ObjectExpression | Property | Identifier | Literal;
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
    if (this.is('[')) {
      return this.array();
    } else if (this.is('{')) {
      return this.object();
    } else if (this.peek().identifier) {
      return this.identifier();
    }
    return this.constant();
  }

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