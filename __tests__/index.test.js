import path from 'path';
import genDiff from '../src';

const testDir = './__tests__/__fixtures__';
const beforeJson = path.resolve(testDir, 'before.json');
const afterJson = path.resolve(testDir, 'after.json');
const expectedResultFlat = `{
    host: hexlet.io
  + timeout: 20
  - timeout: 50
  - proxy: 123.234.53.22
  - follow: false
  + verbose: true
}`;

test('genDiff', () => {
  expect(genDiff(beforeJson, afterJson)).toEqual(expectedResultFlat);
});
