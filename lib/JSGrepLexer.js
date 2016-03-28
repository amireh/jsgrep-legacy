var TOKEN_TYPES = require('./JSGrepTokenTypes');

exports.parse = function(string) {
  var stream = string.split('');
  var tokenType;
  var tokenArgs = [];
  var context = {};

  while (stream.length) {
    parseChar(stream[0]);
  }

  function parseChar(char) {
    if (char === '#') {
      tokenType = TOKEN_TYPES.INSTANCE_METHOD;
    }
    else if (char === '{' && tokenType === TOKEN_TYPES.INSTANCE_METHOD) {
      context.arity = parseInt(eatUntil('}', stream.slice(1)), 10);
      stream.splice(context.arity.length);
    }
    else {
      tokenArgs.push(char);
    }

    stream.shift();
  }

  return { type: tokenType, value: tokenArgs.join(''), context: context };
}

function eatUntil(delim, str) {
  var buffer = [];

  str.some(function(x) {
    if (x === delim) { return true; }
    buffer.push(x);
  });

  return buffer.join('');
}

