import { defineInlineTest } from 'jscodeshift/dist/testUtils';

defineInlineTest(
  (file, api) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const callExpressions = root.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'foo',
      },
    });

    callExpressions.replaceWith((path) => {
      const { params, body } = path.node.arguments[0];

      return j.exportDefaultDeclaration(
        j.functionDeclaration(j.identifier('foo'), params, body)
      );
    });

    return root.toSource();
  },
  {},
  'foo(function(bar) { baz; });',
  'export default function foo(bar) { baz; };'
);

const transformToClassBased = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.ExportDefaultDeclaration, {
      declaration: { type: 'FunctionDeclaration' },
    })
    .replaceWith((path) => {
      const functionDecl = path.node.declaration;
      const body = functionDecl.body;

      const fnExpr = j.functionExpression(null, [], body);
      fnExpr.async = functionDecl.async; // NOTE workaround: j.functionExpression doesn't handle async argument

      return j.exportDefaultDeclaration(
        j.classDeclaration(
          null,
          j.classBody([
            j.methodDefinition('method', j.identifier('render'), fnExpr),
          ]),
          j.identifier('Stanza')
        )
      );
    });

  return root.toSource();
};

defineInlineTest(
  transformToClassBased,
  {},
  `export default function foo(stanza, params) { foo; };
function fn() { expr };`,
  `export default class extends Stanza {
  render() { foo; }
};
function fn() { expr };`,
  'change to class-based stanza'
);

defineInlineTest(
  transformToClassBased,
  {},
  `export default async function foo(stanza, params) { foo; };
function fn() { expr };`,
  `export default class extends Stanza {
  async render() { foo; }
};
function fn() { expr };`,
  'change to class-based stanza keeping async'
);

defineInlineTest(
  transformToClassBased,
  {},
  `export default class extends Stanza {
  async render() { foo; }
};
function fn() { expr };`,
  `export default class extends Stanza {
  async render() { foo; }
};
function fn() { expr };`,
  'does not change class-based stanzas'
);
