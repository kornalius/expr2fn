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
});