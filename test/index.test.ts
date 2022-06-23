import { describe, expect, test } from '@jest/globals'
import { compile } from '../src/index';


describe('compile', () => {
  test('can compile an integer', () => {
    const fn = compile('12');
    expect(fn).toBeInstanceOf(Function);
    expect(fn()).toBe(12);
  });
});