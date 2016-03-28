var fs = require('fs');
var async = require('async');
var jsgrep = require('./JSGrep');

process.on('message', function(message) {
  if (message.name === 'run') {
    async.map(message.files, function(filePath, done) {
      async.setImmediate(function() {
        done(null, {
          filePath: filePath,
          results: jsgrep(message.pattern, fs.readFileSync(filePath, 'utf-8'), filePath) || []
        });
      });
    }, function(err, results) {
      process.send({
        name: 'done',
        error: err,
        results: results
      });
    });
  }
});

process.send({ name: 'ready' });
