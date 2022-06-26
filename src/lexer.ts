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

  // next character
  get nextCh(): string {
    return this.expr[this.index + 1];
  }

  constructor() { }

  tokenize(expr: string): Token[] {
    this.expr = expr;
    this.tokens = [];
    this.index = 0;
    while (this.index < this.expr.length) {
      if (this.isNumber(this.ch) || (this.ch === '.' && this.isNumber(this.nextCh))) {
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
    let expMode = false;
    while (this.index < this.expr.length) {
      if (expMode) {
        const prevCh = number[number.length - 1];
        if (
          prevCh.toLowerCase() === 'e' &&
          (this.ch === '+' || this.ch === '-') &&
          this.nextCh && this.isNumber(this.nextCh)
        ) {
          number += this.ch;
        } else if (this.isNumber(this.ch)) {
          number += this.ch;
        } else {
          throw 'Invalid exponent';
        }
      } else {
        if (this.ch === '.' || this.isNumber(this.ch)) {
          number += this.ch;
        } else if (this.ch.toLowerCase() === 'e') {
          number += this.ch;
          expMode = true;
        } else {
          break;
        }
      }
      this.index++;
    }
    this.tokens.push({
      text: number,
      value: Number(number)
    });
  }
}