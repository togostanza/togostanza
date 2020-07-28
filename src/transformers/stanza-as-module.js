const path = require('path');
const camelCase = require('lodash.camelcase');

module.exports = function stanzaAsModuleTransformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

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

  // remove the trailing EmptyStatement
  root = j(root.toSource()); // parse again to obtain the correct AST of the modified code
  root.find(j.EmptyStatement).forEach((path) => {
    // check the depth of EmptyStatement placement
    if (path.parentPath.parentPath.value.type !== 'Program') {
      // skip; `path` doesn't point the EmptyStatement of "top level"
      return;
    }

    const lastNodeInParent = path.parentPath.value.slice(-1)[0];
    if (path.node === lastNodeInParent) {
      path.prune();
    }
  });

  return root.toSource();
};
