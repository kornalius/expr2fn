import { describe, expect, test } from '@jest/globals'
import compile from '../src/index';


describe('compile', () => {
  test('can compile an integer', () => {
    const fn = compile('12');
    expect(fn).toBeInstanceOf(Function);
    expect(fn()).toBe(12);
  });

  describe('can compile a floating point number', () => {
    test('with an integer part', () => {
      const fn = compile('0.1');
      expect(fn()).toBe(0.1);
    });

    test('without an integer part', () => {
      const fn = compile('.1');
      expect(fn()).toBe(0.1);
    });
  });

  describe('can compile a scientific notation number', () => {
    test('with lowercase e', () => {
      const fn = compile('1e2');
      expect(fn()).toBe(100);
    });

    test('with uppercase E', () => {
      const fn = compile('1E2');
      expect(fn()).toBe(100);
    });

    test('with floating point coefficient', () => {
      const fn = compile('0.1E2');
      expect(fn()).toBe(10);
    });

    test('with exponent prefixed with + sign', () => {
      const fn = compile('1E+2');
      expect(fn()).toBe(100);
    });

    test('with exponent prefixed with - sign', () => {
      const fn = compile('1E-2');
      expect(fn()).toBe(0.01);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('1e-')).toThrow();
      expect(() => compile('1ea')).toThrow();
      expect(() => compile('1e-a')).toThrow();
      expect(() => compile('1e2e3')).toThrow();
    });
  });

  describe('can compile a string', () => {
    test('in single quotes', () => {
      const fn = compile('\'ab\'');
      expect(fn()).toBe('ab');
    });

    test('in double quotes', () => {
      const fn = compile('"ab"');
      expect(fn()).toBe('ab');
    });

    test('but throw an exception to mismatched quotes', () => {
      expect(() => compile('\'ab"')).toThrow();
    });

    test('with single quotes inside', () => {
      const fn = compile('\'a\\\'b\'');
      expect(fn()).toBe('a\'b');
    });

    test('with double quotes inside', () => {
      const fn = compile('\'a\\\"b\'');
      expect(fn()).toBe('a"b');
    });

    test('with Unicode escape sequences inside', () => {
      const fn = compile('\'a\\u00A0b\'');
      expect(fn()).toBe('a\u00A0b');
    });

    test('but throw an exception to invalid Unicode escape sequence', () => {
      expect(() => compile('\'\\u00G0\'')).toThrow();
    });
  });

  test('can compile constant values true, false, null and undefined', () => {
    expect(compile('true')()).toBe(true);
    expect(compile('false')()).toBe(false);
    expect(compile('null')()).toBe(null);
    expect(compile('undefined')()).toBe(undefined);
  });

  test('ignores whitespace', () => {
    const fn = compile(' \n\r123\t\v\u00A0 ');
    expect(fn()).toBe(123);
  });

  describe('can compile an array', () => {
    test('without elements', () => {
      const fn = compile('[]');
      expect(fn()).toEqual([]);
    });

    test('with elements', () => {
      const fn = compile('[1, \'2\', [3, \'4\'], true, false]');
      expect(fn()).toEqual([1, '2', [3, '4'], true, false]);
    });

    test('with empty, null and undefined elements', () => {
      const fn = compile('[, null, undefined]');
      expect(fn()).toEqual([, null, undefined]);
      expect(Object.keys(fn())).toEqual(['1', '2']);
    });

    test('with trailing commas', () => {
      const fn = compile('[1, 2, , ]');
      expect(fn()).toEqual([1, 2, , ]);
      expect(Object.keys(fn())).toEqual(['0', '1']);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('[\'1\' \'2\']')).toThrow();
      expect(() => compile('[1')).toThrow();
      expect(() => compile('[1]]')).toThrow();
    });

    test('with expressions', () => {
      const fn = compile('[0 || 2, 10 + 23, 1 ? \'hello\' : \'world\']');
      expect(fn()).toEqual([2, 33, 'hello']);
    });
  });

  describe('can compile an object', () => {
    test('without properties', () => {
      const fn = compile('{}');
      expect(fn()).toEqual({});
    });

    test('with literal-key properties ', () => {
      const fn = compile('{\'a\': 1, \'bc\': \'23\', \'def\': [\'4\', 5, {\'g\': 67}]}');
      expect(fn()).toEqual({'a': 1, 'bc': '23', 'def': ['4', 5, {'g': 67}]});
    });

    test('with identifier-key properties ', () => {
      const fn = compile('{a: 1, bc: \'23\', def: [\'4\', 5, {g: 67}]}');
      expect(fn()).toEqual({a: 1, bc: '23', def: ['4', 5, {g: 67}]});
    });

    test('with expression values ', () => {
      const fn = compile('{a: 0 || 2, bc: 10 + 23, def: 1 ? \'hello\' : \'world\' }');
      expect(fn()).toEqual({a: 2, bc: 33, def: 'hello' });
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('{\'a\': 1 \'bc\': \'23\'}')).toThrow();
      expect(() => compile('{\'a\': 1')).toThrow();
      expect(() => compile('{a: 1 bc: \'23\'}')).toThrow();
      expect(() => compile('{a: 1')).toThrow();
      expect(() => compile('{a: 1}}')).toThrow();
    });
  });

  describe('can compile context attribute access', () => {
    test('when the context is given', () => {
      const fn = compile('a');
      expect(fn({a: 1})).toBe(1);
      expect(fn({})).toBeUndefined();
    });

    test('when the context is not given', () => {
      const fn = compile('a');
      expect(fn()).toBeUndefined();
    });
  });

  describe('can compile nested attribute access', () => {
    test('in non-computed way (i.e. using dot operator)', () => {
      const fn = compile('a.b.c');
      expect(fn({a: {b: {c: 1}}})).toBe(1);
      expect(fn({a: {b: {}}})).toBe(undefined);
      expect(fn({a: {}})).toBe(undefined);
      expect(fn({})).toBe(undefined);
      expect(fn()).toBe(undefined);
    });

    test('in computed way (i.e. using square bracket notation)', () => {
      expect(compile('a[0]')({a: [1, 2, 3]})).toBe(1);
      expect(compile('a[\'b\']')({a: {b: 1}})).toBe(1);
      expect(compile('a[c]')({a: {b: 1}, c: 'b'})).toBe(1);
      expect(compile('a[c[\'d\']]')({a: {b: 1}, c: {d: 'b'}})).toBe(1);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('a.')).toThrow();
      expect(() => compile('a[')).toThrow();
      expect(() => compile('a[]')).toThrow();
      expect(() => compile('a[0]]')).toThrow();
    });
  });

  describe('can compile function call', () => {
    test('without arguments', () => {
      const fn = compile('a()');
      expect(fn({a: () => 1})).toBe(1);
    });

    test('with arguments', () => {
      expect(compile('a(1)')({a: (p) => p})).toBe(1);
      expect(compile('a(1, 2)')({a: (p1, p2) => p1 + p2})).toBe(3);
      expect(
        compile('a(1, b, c, d(2, 3))')(
          {
            a: (p1, p2, p3, p4) => p1 + p2 + p3() + p4,
            b: 4,
            c: () => 5,
            d: (p1, p2) => p1 + p2
          }
        )
      ).toBe(15);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('a(')).toThrow();
      expect(() => compile('a(]')).toThrow();
      expect(() => compile('a())')).toThrow();
    });
  });

  describe('can compile method call', () => {
    test('of the context', () => {
      const fn = compile('a()');
      const ctx = {
        a: function() {
          return this.b;
        },
        b: 1
      };
      expect(fn(ctx)).toBe(1);
    });

    test('of the attribute', () => {
      const ctx = {
        a: {
          // ES6's fat arrow function should be transformed into ES5's function at first
          // b: () => this.c,
          b: function() {
            return this.c
          },
          c: 1
        }
      };
      expect(compile('a.b()')(ctx)).toBe(1);
      expect(compile('a[\'b\']()')(ctx)).toBe(1);
    });
  });

  describe('can compile unary operators +, - and !', () => {
    test('inside a string', () => {
      expect(compile('\'+\'')()).toBe('+');
      expect(compile('\'-\'')()).toBe('-');
      expect(compile('\'!\'')()).toBe('!');
    });

    test('once', () => {
      expect(compile('+1')()).toBe(1);
      expect(compile('+\'1\'')()).toBe(1);
      expect(compile('+a')({a: 1})).toBe(1);
      expect(compile('+a')({a: '1'})).toBe(1);

      expect(compile('-1')()).toBe(-1);
      expect(compile('-\'1\'')()).toBe(-1);
      expect(compile('-a')({a: 1})).toBe(-1);
      expect(compile('-a')({a: '1'})).toBe(-1);

      expect(compile('!true')()).toBe(false);
      expect(compile('!false')()).toBe(true);
      expect(compile('!1')()).toBe(false);
      expect(compile('!0')()).toBe(true);
      expect(compile('!\'1\'')()).toBe(false);
      expect(compile('!\'\'')()).toBe(true);
      expect(compile('![]')()).toBe(false);
      expect(compile('!{}')()).toBe(false);
    });

    test('multiple times', () => {
      expect(compile('!!true')()).toBe(true);
      expect(compile('!!!true')()).toBe(false);
      expect(compile('!+1')()).toBe(false);
      expect(compile('!-1')()).toBe(false);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('+')).toThrow();
      expect(() => compile('-')).toThrow();
      expect(() => compile('!')).toThrow();
      expect(() => compile('+<')).toThrow();
      expect(() => compile('-<')).toThrow();
      expect(() => compile('!<')).toThrow();
    });
  });

  describe('can compile multiplicative operators *, / and %', () => {
    test('once', () => {
      expect(compile('1 * 2')()).toBe(1 * 2);
      expect(compile('1 / 2')()).toBe(1 / 2);
      expect(compile('1 % 2')()).toBe(1 % 2);
    });

    test('multiple times', () => {
      expect(compile('1 * 2 / 3 % 4')()).toBe(1 * 2 / 3 % 4);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('1 *')).toThrow();
      expect(() => compile('1 /')).toThrow();
      expect(() => compile('1 %')).toThrow();
      expect(() => compile('1 * *')).toThrow();
      expect(() => compile('1 / /')).toThrow();
      expect(() => compile('1 % %')).toThrow();
    });
  });

  describe('can compile additive operators + and -', () => {
    test('once', () => {
      expect(compile('1 + 2')()).toBe(1 + 2);
      expect(compile('1 - 2')()).toBe(1 - 2);
    });

    test('multiple times', () => {
      expect(compile('1 + 2 - 3')()).toBe(1 + 2 - 3);
    });

    test('on a lower precedence than multiplicative operators', () => {
      expect(compile('1 + 2 * 3')()).toBe(1 + 2 * 3);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('1 +')).toThrow();
      expect(() => compile('1 -')).toThrow();
      expect(() => compile('1 + <')).toThrow();
      expect(() => compile('1 - <')).toThrow();
    });
  });

  describe('can compile relational operators >, <, >= and <=', () => {
    test('once', () => {
      expect(compile('1 < 2')()).toBe(true);
      expect(compile('1 > 2')()).toBe(false);
      expect(compile('1 <= 2')()).toBe(true);
      expect(compile('1 <= 1')()).toBe(true);
      expect(compile('1 >= 2')()).toBe(false);
      expect(compile('1 >= 1')()).toBe(true);
    });

    test('multiple times', () => {
      expect(compile('1 < 2 < 3')()).toBe(true);
    });

    test('on a lower precedence than additive operators', () => {
      expect(compile('1 + 2 < 3 + 4')()).toBe(true);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('1 <')).toThrow();
      expect(() => compile('1 >')).toThrow();
      expect(() => compile('1 <=')).toThrow();
      expect(() => compile('1 >=')).toThrow();
      expect(() => compile('1 < <')).toThrow();
      expect(() => compile('1 > >')).toThrow();
      expect(() => compile('1 <= <=')).toThrow();
      expect(() => compile('1 >= >=')).toThrow();
    });
  });

  describe('can compile equality operators ==, !=, === and !==', () => {
    test('once', () => {
      expect(compile('1 == 1')()).toBe(true);
      expect(compile('1 == \'1\'')()).toBe(true);
      expect(compile('1 != 1')()).toBe(false);
      expect(compile('1 != \'1\'')()).toBe(false);
      expect(compile('1 === 1')()).toBe(true);
      expect(compile('1 === \'1\'')()).toBe(false);
      expect(compile('1 !== 1')()).toBe(false);
      expect(compile('1 !== \'1\'')()).toBe(true);
    });

    test('multiple times', () => {
      expect(compile('1 === 2 !== 3')()).toBe(true);
    });

    test('on a lower precedence than relational operators', () => {
      expect(compile('1 == \'1\' > 1 !== \'1\'')()).toBe(true);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('1 ==')).toThrow();
      expect(() => compile('1 !=')).toThrow();
      expect(() => compile('1 ===')).toThrow();
      expect(() => compile('1 !==')).toThrow();

      expect(() => compile('1 == ==')).toThrow();
      expect(() => compile('1 != !=')).toThrow();
      expect(() => compile('1 === ===')).toThrow();
      expect(() => compile('1 !== !==')).toThrow();
    });
  });

  describe('can compile AND operator &&', () => {
    test('once', () => {
      expect(compile('true && true')()).toBe(true);
      expect(compile('true && false')()).toBe(false);
      expect(compile('false && false')()).toBe(false);
    });

    test('multiple times', () => {
      expect(compile('true && true && true')()).toBe(true);
      expect(compile('true && true && false')()).toBe(false);
      expect(compile('true && false && false')()).toBe(false);
      expect(compile('false && false && false')()).toBe(false);
    });

    test('in short-circuit way', () => {
      let invoked = false;
      compile('false && fn()')({fn: () => invoked = true});
      expect(invoked).toBe(false);
    });

    test('on a lower precedence than equality operators', () => {
      expect(compile('true && 1 === 1')()).toBe(true);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('true &&')).toThrow();
      expect(() => compile('true && &&')).toThrow();
    });
  });

  describe('can compile OR operator ||', () => {
    test('once', () => {
      expect(compile('true || true')()).toBe(true);
      expect(compile('true || false')()).toBe(true);
      expect(compile('false || false')()).toBe(false);
      expect(compile('false || true')()).toBe(true);
    });

    test('multiple times', () => {
      expect(compile('true || true || true')()).toBe(true);
      expect(compile('true || true || false')()).toBe(true);
      expect(compile('true || false || false')()).toBe(true);
      expect(compile('false || false || false')()).toBe(false);
      expect(compile('false || false || true')()).toBe(true);
      expect(compile('false || true || true')()).toBe(true);
    });

    test('in short-circuit way', () => {
      let invoked = false;
      compile('true || fn()')({fn: () => invoked = true});
      expect(invoked).toBe(false);
    });

    test('on a lower precedence than AND operator', () => {
      expect(compile('true || true && false')()).toBe(true);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('true ||')).toThrow();
      expect(() => compile('true || ||')).toThrow();
    });
  });

  describe('can compile ternary operators ? and :', () => {
    test('once', () => {
      expect(compile('true ? 1 : 2')()).toBe(1);
      expect(compile('a === 1 ? 1 : 2')({a: 2})).toBe(2);
    });

    test('multiple times', () => {
      expect(compile('a === 1 ? b === 2 ? 3 : c === 3 ? 4 : 5 : 6')({a: 1, b: '2', c: '3'})).toBe(5);
    });

    test('on a lower precedence than OR operator', () => {
      expect(compile('true || false ? 1 : 2')()).toBe(1);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('true ?')).toThrow();
      expect(() => compile('true ? 1 :')).toThrow();
      expect(() => compile('true ? ? : 1')).toThrow();
      expect(() => compile('true ? 1 : :')).toThrow();
      expect(() => compile('true ? 1 : 2 :')).toThrow();
    });
  });

  describe('can compile parentheses', () => {
    test('once', () => {
      expect(compile('(1 + 2) * 3')()).toBe(9);
      expect(compile('false && (true || true)')()).toBe(false);
    });

    test('multiple times', () => {
      expect(compile('(((1) > (2)) ? (3) : (4))')()).toBe(4);
    });

    test('but throw an exception to invalid format', () => {
      expect(() => compile('(')).toThrow();
      expect(() => compile('()')).toThrow();
      expect(() => compile('(1))')).toThrow();
    });
  });

  test('can compile multiple statements', () => {
    let invoked1 = false;
    let invoked2 = false;
    let invoked3 = false;
    const ctx = {
      fn1: () => {
        invoked1 = true;
        return 1;
      },
      fn2: () => {
        invoked2 = true;
        return 2;
      },
      fn3: () => {
        invoked3 = true;
        return 3;
      }
    };
    const result = compile('fn1(); fn2();;; fn3()')(ctx);
    expect(invoked1).toBe(true);
    expect(invoked2).toBe(true);
    expect(invoked3).toBe(true);
    expect(result).toBe(3);
  });

  describe('does not allow calling the function constructor', () => {
    test('explicitly', () => {
      const fn = compile('fn.constructor(\'delete a;\')()');
      const ctx = {
        fn: () => {}
      };
      expect(() => fn(ctx)).toThrow();
    });

    test('by an alias', () => {
      const fn = compile('aliasFn(\'delete a;\')()');
      const ctx = {
        aliasFn: Function
      };
      expect(() => fn(ctx)).toThrow();
    });
  });
});
