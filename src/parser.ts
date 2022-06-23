import type { Token } from './lexer';


export interface AST { };


/**
 * Parser parses the tokens to build an AST tree
 */
export class Parser {
  private tokens: Token[];

  constructor() { }

  parse(tokens: Token[]): AST {
    this.tokens = tokens;
    return {};
  }
}