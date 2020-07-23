import { defineInlineTest } from 'jscodeshift/dist/testUtils';

defineInlineTest((file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  const callExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'foo'
    }
  });

  callExpressions.replaceWith((path) => {
    const {params, body} = path.node.arguments[0];

    return j.exportDefaultDeclaration(
      j.functionDeclaration(
        j.identifier('foo'),
        params,
        body
      )
    );
  });

  return root.toSource();
}, {}, 'foo(function(bar) { baz; });', 'export default function foo(bar) { baz; };');
