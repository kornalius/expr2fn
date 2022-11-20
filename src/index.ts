import { Lexer } from './lexer';
import { Parser } from './parser';
import { Compiler } from './compiler';


export default function compile(expr: string) {
  const lexer = new Lexer();
  const parser = new Parser();
  const compiler = new Compiler();

  const tokens = lexer.tokenize(expr);
  const ast = parser.parse(tokens);
  const fn = compiler.compile(ast);

  return fn;
}