const jsgrep = require('../lib/JSGrep');
const multiline = require('multiline-slash');

describe('jsgrep', function() {
  describe('instance methods', function() {
    context('when arity is specified', function() {
      it('works', function() {
        const results = run('#getAll{2}', multiline(function() {
          // this.cache.getAll('foo', 'bar');
        }));
      });
    });
  });
});

function run(argv, sourceCode) {
  jsgrep(argv, sourceCode);
}