var babel = require('babel-core');
var VISITORS = [];
var TOKENS = require('./JSGrepTokenTypes');

exports.scan = function(token, sourceCode, fileName) {
  var visitor = VISITORS.filter(function(x) { return x.type === token.type; })[0];

  if (!visitor) {
    return;
  }

  var ast = babel.transform(sourceCode, {
    code: false,
    ast: true,
    babelrc: true,
    filename: fileName,
  }).ast;

  var results = [];

  babel.traverse(ast, visitor.create(token, trackResult, sourceCode.split('\n')));

  function trackResult(result) {
    results.push(result);
  }

  return results;
};


VISITORS.push({
  type: TOKENS.INSTANCE_METHOD,
  create: function(token, onResult, sourceLines) {
    return {
      CallExpression: function(path) {
        if ('MemberExpression' === path.node.callee.type) {
          if (path.node.callee.property.name === token.value) {
            if (token.context.hasOwnProperty('arity') && path.node.arguments.length !== token.context.arity) {
              return false;
            }

            var code;

            if (path.node.loc.start.line === path.node.loc.end.line) {
              code = sourceLines[path.node.loc.start.line-1].slice(
                path.node.loc.start.column,
                path.node.loc.end.column
              );
            }
            else {
              code = sourceLines.slice(
                path.node.loc.start.line-1,
                path.node.loc.end.line-1
              );

              code[0] = code[0].slice(path.node.loc.start.column);
              code[code.length-1] = code[code.length-1].slice(0, path.node.loc.end.column);
              code = code.join('\n');
            }

            onResult({
              value: code,
              matchRange: [ code.indexOf(token.value), code.indexOf(token.value) + token.value.length ],
              loc: path.node.loc
            });
          }
        }
      }
    };
  }
});
