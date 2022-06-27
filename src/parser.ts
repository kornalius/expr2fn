import type { Token } from './lexer';


export enum TYPE {
  Program = 'Program',
  Literal = 'Literal'
};
export type AST = Program | Literal;
type Program = { type: TYPE.Program; body: Literal; };
type Literal = { type: TYPE.Literal; value: number | string; };


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
      body: this.constant()
    }
  }

  private constant(): Literal {
    return {
      type: TYPE.Literal,
      value: this.tokens[0].value
    }
  }
}