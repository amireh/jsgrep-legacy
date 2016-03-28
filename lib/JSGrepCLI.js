#!/usr/bin/env node

var program = require('commander');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var jsgrep = require('./JSGrep');
var reporter = require('./JSGrepReporter');
var async = require('async');
var fork = require('child_process').fork;

program
  .usage('[options] PATTERN [FILE]...')
  .option('-r, --recursive')
  .option('-n, --line-number', 'print line number with output lines')
  .option('-H, --with-filename', 'print the file name for each match', true)
  .option('-h, --no-filename', 'suppress the file name prefix on output', false)
  .option('--exclude <PATTERN>', 'filenames that match PATTERN will be skipped')
  .option('--exclude-dir <PATTERN>', 'directories that match PATTERN will be skipped')
  .option('-l, --files-with-matches', 'print only names of FILEs containing matches')
  .option('-j, --threads <COUNT>', 'how many threads to spawn for processing the sources', 5)
  .option('-c, --color', 'use markers to highlight the matching strings', true)
  .option('--no-progressive', 'report results only when all threads are done', false)
  .option('--verbose', 'print debug messages', false)
  .parse(process.argv);

var pattern = program.args[0];

if (!pattern) {
  program.help();
}

var filePatterns = program.args.slice(1);
var files = filePatterns
  .reduce(function(x, pattern) {
    if (fs.existsSync(pattern) && fs.statSync(pattern).isDirectory()) {
      return x.concat(glob.sync(path.join(pattern, '**/*')));
    }
    else {
      return x.concat(glob.sync(pattern));
    }
  }, [])
  .filter(function(filePath) {
    if (program.exclude) {
      return !filePath.match(program.exclude);
    }
    else {
      return true;
    }
  })
;

var threadCount = Math.max(parseInt(program.threads, 10) || 1, 1);

launchThreads(threadCount, pattern, files, function(err, results) {
  if (err) {
    throw err;
    return;
  }

  if (!program.progressive) {
    report(results);
  }
});

function report(results) {
  reporter.dump(results, program);
}

function launchThreads(count, pattern, files, done) {
  var fpt = Math.ceil(files.length / count);
  var i;
  var results = [];
  var resultsReceived = 0;

  if (program.verbose) {
    console.log('jsgrep: seeking "%s" in %d files across %d threads.', pattern, files.length, count);
  }

  for (i = 0; i < count; ++i) {
    Thread(i, pattern, files.slice(i * fpt, i * fpt + fpt), acceptResult);
  }

  function acceptResult(err, result) {
    if (err) {
      return done(err);
    }

    if (program.progressive) {
      report(result);
    }
    else {
      results = results.concat(result);
    }

    if (++resultsReceived >= count) {
      done(null, results);
    }
  }
}

function Thread(id, pattern, files, done) {
  var fd = fork(path.resolve(__dirname, 'JSGrepWorker.js'));

  fd.on('message', function(message) {
    if (!fd.connected) {
      return;
    }
    else if (message.name === 'ready') {
      if (program.verbose) {
        console.log('jsgrep: Worker[%s] is about to scrape %d files', String(id), files.length);
      }

      fd.send({
        name: 'run',
        pattern: pattern,
        files: files
      });
    }
    else if (message.name === 'done') {
      if (program.verbose) {
        console.log('jsgrep: Worker[%s] is done', String(id));
      }

      fd.disconnect();

      done(message.error, message.results);
    }
  });

  return {
    isConnected: function() {
      return fd.connected;
    }
  };
}
