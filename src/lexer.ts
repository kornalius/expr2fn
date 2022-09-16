export interface Token {
  text: string;
  value: number | string | boolean | null | undefined;
  identifier?: boolean;
};


const CONSTANTS: {
  [key: string]: boolean | null | undefined;
} = {
  'true': true,
  'false': false,
  'null': null,
  'undefined': undefined
};


const OPERATORS = new Set([
  '+', '-', '!', '*', '/', '%', '<', '>', '<=', '>=', '==', '!=', '===', '!==', '&&', '||'
]);


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
      } else if (this.ch === '\'' || this.ch === '"') {
        this.readString();
      } else if (
        this.ch === '[' || this.ch === ',' || this.ch === ']' ||
        this.ch === '{' || this.ch === '}' || this.ch === ':' ||
        this.ch === '.' || this.ch === '(' || this.ch === ')'
      ) {
        this.tokens.push({
          text: this.ch,
          value: null
        });
        this.index++;
      } else if (this.isIdentifier(this.ch)) {
        this.readIdentifier();
      } else if (this.isWhitespace(this.ch)) {
        this.index++;
      } else if (this.isOperator(this.ch) || this.isOperator(this.ch + this.nextCh)) {
        this.readOperator();
      } else {
        throw `Unexpected next character: ${this.ch}`;
      }
    }
    return this.tokens;
  }

  private isNumber(ch: string): boolean {
    return '0' <= ch && ch <= '9';
  }

  private isIdentifier(ch: string): boolean {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch === '_' || ch === '$';
  };

  private isWhitespace(ch: string): boolean {
    return /\s/.test(ch);
  };

  private isOperator(ch: string): boolean {
    return OPERATORS.has(ch);
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

  private readString(): void {
    let string = '';
    let raw = this.ch;
    let quote = this.ch;
    let escapes= ['n', 'f', 'r', 't', 'v', '\'', '"'];
    this.index++;
    while (this.index < this.expr.length) {
      raw += this.ch;
      if (this.ch === '\\') {
        if (this.nextCh === 'u') {
          const hex = this.expr.slice(this.index + 2, this.index + 6);
          if (!hex.match(/[\da-f]{4}/i)) {
            throw 'Invalid Unicode escape sequence';
          }
          const charCode = parseInt(hex, 16);
          string += String.fromCharCode(charCode);
          this.index += 6;
        } else {
          if (escapes.indexOf(this.nextCh) >= 0) {
            string += this.ch + this.nextCh;
          } else {
            string += this.nextCh;
          }
          this.index += 2;
        }
      } else if (this.ch === quote) {
        this.tokens.push({
          text: raw,
          value: string
        });
        this.index++;
        return;
      } else {
        string += this.ch;
        this.index++;
      }
    }
    throw 'Unmatched quote';
  }

  private readIdentifier(): void {
    let name = '';
    while (this.index < this.expr.length) {
      if (this.isIdentifier(this.ch) || this.isNumber(this.ch)) {
        name += this.ch;
        this.index++;
      } else {
        break;
      }
    }

    this.tokens.push({
      text: name,
      value: CONSTANTS[name],
      identifier: !CONSTANTS.hasOwnProperty(name)
    });
  }

  private readOperator(): void {
    let operator = '';
    do {
      operator += this.ch;
      this.index++;
    } while (this.isOperator(operator + this.ch))
    this.tokens.push({
      text: operator,
      value: null
    });
  }
}