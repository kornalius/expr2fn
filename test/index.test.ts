import { expect, test } from '@jest/globals'
import { compile } from '../src/index';


test('compile an expression into a function', () => {
  expect(compile('')).toBeInstanceOf(Function);
});