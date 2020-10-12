import isEqual from 'lodash.isequal';

export function grouping(objs, ...keys) {
  const normalizedKeys = keys.map((key) => {
    if (key instanceof Array) {
      return {key, alias: key.join('_')};
    } else if (key instanceof Object) {
      return key;
    } else {
      return {key, alias: key};
    }
  });

  return _grouping(objs, normalizedKeys);
}

function _grouping(objs, keys, acc = {}) {
  const [currentKey, ...remainKeys] = keys;

  return groupBy(objs, obj => pluckKeyOrKeys(obj, currentKey.key)).map(([currentValue, remainValues]) => {
    if (remainKeys.length === 0) {
      return currentValue;
    } else {
      const nextKey = remainKeys[0];

      return {
        [currentKey.alias]: currentValue,
        [nextKey.alias]:    _grouping(remainValues, remainKeys)
      };
    }
  });
}

function groupBy(objs, keyFn) {
  const ret = [];

  objs.forEach((obj) => {
    const key   = keyFn(obj);
    const entry = ret.find(([existKey]) => isEqual(existKey, key));

    if (entry) {
      entry[1].push(obj);
    } else {
      ret.push([key, [obj]]);
    }
  });

  return ret;
}

function pluckKeyOrKeys(obj, key) {
  return key instanceof Array ? key.map((k) => obj[k]) : obj[key];
}

export function unwrapValueFromBinding(queryResult) {
  const bindings = queryResult.results.bindings;

  return bindings.map((binding) => {
    const ret = {};

    Object.keys(binding).forEach((key) => {
      ret[key] = binding[key].value;
    });

    return ret;
  });
}
