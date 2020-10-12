import { grouping, unwrapValueFromBinding } from '../utils.mjs';

describe('grouping', () => {
  test('group objects values of x then y', () => {
    const objs = [
      {x: 1, y: 3},
      {x: 1, y: 4},
      {x: 2, y: 5},
      {x: 2, y: 6}
    ];

    expect(grouping(objs, 'x', 'y')).toStrictEqual([
      {x: 1, y: [3, 4]},
      {x: 2, y: [5, 6]}
    ]);
  });

  test('use a composite key', () => {
    const objs = [
      {x: 1, y: 1, z: 3},
      {x: 1, y: 2, z: 4},
      {x: 2, y: 1, z: 5},
      {x: 2, y: 2, z: 6},
      {x: 1, y: 2, z: 7},
      {x: 2, y: 1, z: 8}
    ];

    expect(grouping(objs, ['x', 'y'], 'z')).toStrictEqual([
      {x_y: [1, 1], z: [3]},
      {x_y: [1, 2], z: [4, 7]},
      {x_y: [2, 1], z: [5, 8]},
      {x_y: [2, 2], z: [6]}
    ]);
  });

  test('give an alias', () => {
    const objs = [
      {x: 1, y: 3},
      {x: 1, y: 4},
      {x: 2, y: 5},
      {x: 2, y: 6}
    ];

    expect(grouping(objs, {key: 'x', alias: 'z'}, 'y')).toStrictEqual([
      {z: 1, y: [3, 4]},
      {z: 2, y: [5, 6]}
    ]);
  });
});

describe('grouping', () => {
  test('simple', () => {
    const result = {
      "head": {"vars": ["s", "p", "o"]
      },
      "results": {
        "bindings": [{
          "s": {
            "type": "uri",
            "value": "http://example.com/s"
          },
          "p": {
            "type": "uri",
            "value": "http://example.com/p"
          },
          "o": {
            "type": "uri",
            "value": "http://example.com/o"
          }
        }]
      }
    };

    expect(unwrapValueFromBinding(result)).toStrictEqual([
      {
        "s": "http://example.com/s",
        "p": "http://example.com/p",
        "o": "http://example.com/o"
      }
    ]);
  });
});
