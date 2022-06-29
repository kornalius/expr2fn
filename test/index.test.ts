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
});