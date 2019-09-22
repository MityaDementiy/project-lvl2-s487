import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import parseFile from './parsers';
/*

deleted - {name: keyName, type: type, oldValue: oldValue}
added - {name: keyName, type: type, newValue: newValue}
unchanged - {name: keyName, type: type, oldValue: oldValue}
changed - {name: keyName, type: type, oldValue: oldValue, newValue: newValue}

*/
const getType = (key, firstObject, secondObject) => {
  if (_.isObject(firstObject[key]) && _.isObject(secondObject[key])) {
    return 'parent';
  }
  if (_.has(firstObject, key) && !_.has(secondObject, key)) {
    return 'deleted';
  }
  if (!_.has(firstObject, key) && _.has(secondObject, key)) {
    return 'added';
  }
  if (_.has(firstObject, key) && _.has(secondObject, key) && firstObject[key] === secondObject[key]) {
    return 'unchanged';
  }
  if (_.has(firstObject, key) && _.has(secondObject, key) && firstObject[key] !== secondObject[key]) {
    return 'changed';
  }
};

const buildNode = (type, key, oldValue, newValue, getDiffFunc) => {
  if (type === 'parent') {
    const children = getDiffFunc(oldValue, newValue);
    return {
      key,
      type,
      children,
    };
  }
  return {
    key,
    type,
    oldValue,
    newValue,
  };
};

const getDiff = (firstConfig, secondConfig) => {
  const firstKeys = Object.keys(firstConfig);
  const secondKeys = Object.keys(secondConfig);
  const unitedKeys = _.union(firstKeys, secondKeys);
  const innerStructure = unitedKeys.map((key) => {
    const type = getType(key, firstConfig, secondConfig);
    const oldValue = firstConfig[key];
    const newValue = secondConfig[key];
    const node = buildNode(type, key, oldValue, newValue, getDiff);
    return node;
  });
  console.log(typeof innerStructure);
  return innerStructure;
};

const renderDiff = (ast) => {
  const result = ast.map((node) => {
    if (node.type === 'added') {
      return `  + ${node.key}: ${node.newValue}`;
    }
    if (node.type === 'deleted') {
      return `  - ${node.key}: ${node.oldValue}`;
    }
    if (node.type === 'unchanged') {
      return `    ${node.key}: ${node.oldValue}`;
    }
    if (node.type === 'changed') {
      return `  - ${node.key}: ${node.oldValue}\n  + ${node.key}: ${node.newValue}`;
    }
  });
  console.log(typeof result.join('\n'));
  return `{\n${result.join('\n')}\n}`;
};

export default (firstConfig, secondConfig) => {
  const firstExtName = path.extname(firstConfig);
  const secondExtName = path.extname(secondConfig);
  const beforeFileContent = parseFile(fs.readFileSync(firstConfig, 'utf-8'), firstExtName);
  const afterFileContent = parseFile(fs.readFileSync(secondConfig, 'utf-8'), secondExtName);
  const result = renderDiff(getDiff(beforeFileContent, afterFileContent));
  return result;
};
