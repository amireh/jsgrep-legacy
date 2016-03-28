var scanner = require('./JSGrepScanner');
var lexer = require('./JSGrepLexer');

module.exports = function jsgrep(argv, sourceCode, fileName) {
  return scanner.scan(lexer.parse(argv), sourceCode, fileName);
};
