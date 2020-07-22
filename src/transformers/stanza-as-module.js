const path = require('path');
const camelCase = require('lodash.camelcase');

module.exports = function stanzaAsModuleTransformer(file, api) {
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
      j.functionDeclaration(
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

  // TODO remove trailing EmptyStatement instead of string replacement
  return root.toSource().replace(/;(\s*)$/m, '$1');
}
