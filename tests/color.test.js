import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, validHex, generateColors, cssExport } from '../src/color.js';
test('reference contrast ratios and symmetry', () => {
  assert.equal(contrast('#000000', '#FFFFFF'), 21);
  assert.equal(contrast('#123456', '#123456'), 1);
  assert.equal(contrast('#ABCDEF', '#123456'), contrast('#123456', '#ABCDEF'));
});
test('locked colors survive palette generation', () => {
  const input = ['#123456', '#ABCDEF', '#000000', '#FFFFFF', '#654321'];
  const result = generateColors(input, [true, false, true, false, true], () => .5);
  assert.equal(result[0], input[0]); assert.equal(result[2], input[2]); assert.equal(result[4], input[4]);
  assert.ok(result.every(validHex)); assert.notEqual(result[1], input[1]);
});
test('CSS export contains named variables', () => {
  assert.equal(cssExport(['#123456']), ':root {\n  --color-1: #123456;\n}\n');
});
