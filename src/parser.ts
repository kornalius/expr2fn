import type { Token } from './lexer';


export enum TYPE {
  Program = 'Program',
  ArrayExpression = 'ArrayExpression',
  Literal = 'Literal'
};
export type AST = Program | Primary;
type Program = { type: TYPE.Program; body: Primary; };
type Primary = ArrayExpression | Literal;
type ArrayExpression = { type: TYPE.ArrayExpression; elements: Primary[]; };
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

  private constant(): Literal {
    return {
      type: TYPE.Literal,
      value: this.consume().value
    };
  }

  private is(ch: string): boolean {
    if (this.tokens.length === 0) {
      return false;
    }
    return this.tokens[0].text === ch;
  }

  private consume(ch?: string): Token {
    if (ch && !this.is(ch)) {
      throw `Unexpected. Expecting '${ch}'`;
    }
    return this.tokens.shift();
  }
}