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
    }
  });

  callExpressions.replaceWith((path) => {
    const {params, body} = path.node.arguments[0];

    return j.exportDefaultDeclaration(
      j.functionDeclaration(
        j.identifier(functionName),
        params,
        body
      )
    );
  });

  // TODO remove trailing EmptyStatement instead of string replacement
  return root.toSource().replace(/;(\s*)$/m, '$1');
};
