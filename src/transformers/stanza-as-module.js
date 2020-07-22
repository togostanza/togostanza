import path from 'path';
import camelCase from 'lodash.camelcase';

export default function stanzaAsModuleTransformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const id = path.basename(path.dirname(file.path));
  const functionName = camelCase(id);

  const callExpressions = root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'Stanza',
    },
  });

  callExpressions.replaceWith((path) => {
    const { node } = path;

    const exdef = j.exportDefaultDeclaration(
      j.functionExpression(
        j.identifier(functionName),
        [
          j.identifier('stanza'),
          j.identifier('params'),
        ],
        node.arguments[0].body
      )
    )

    return exdef;
  });

  return root.toSource();
}
