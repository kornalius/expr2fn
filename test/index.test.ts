import { describe, expect, test } from '@jest/globals'
import { compile } from '../src/index';


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

    test('but throw an exception to invalid format', () => {
      expect(() => compile('{\'a\': 1 \'bc\': \'23\'}')).toThrow();
      expect(() => compile('{\'a\': 1')).toThrow();
      expect(() => compile('{a: 1 bc: \'23\'}')).toThrow();
      expect(() => compile('{a: 1')).toThrow();
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
});