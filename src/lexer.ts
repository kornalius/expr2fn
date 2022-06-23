export interface Token { }


/**
 * Lexer tokenizes the expression string
 */
export class Lexer {
  private expr: string;

  constructor() { }

  tokenize(expr: string): Token[] {
    this.expr = expr;
    return [];
  }
}