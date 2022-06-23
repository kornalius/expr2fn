export interface Token {
  text: string;
  value: number;
};


/**
 * Lexer tokenizes the expression string
 */
export class Lexer {
  private tokens: Token[];
  private expr: string;

  // current character index in the expr
  private index: number;

  // current character
  get ch(): string {
    return this.expr[this.index];
  }

  constructor() { }

  tokenize(expr: string): Token[] {
    this.expr = expr;
    this.tokens = [];
    this.index = 0;
    while (this.index < this.expr.length) {
      if (this.isNumber(this.ch)) {
        this.readNumber();
      } else {
        throw `Unexpected next character: ${this.ch}`;
      }
    }
    return this.tokens;
  }

  private isNumber(ch: string): boolean {
    return '0' <= ch && ch <= '9';
  }

  private readNumber(): void {
    let number = '';
    while (this.index < this.expr.length) {
      if (!this.isNumber(this.ch)) {
        break;
      }
      number += this.ch;
      this.index++;
    }
    this.tokens.push({
      text: number,
      value: Number(number)
    });
  }
}