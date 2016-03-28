var colors = require('colors/safe');

exports.dump = function(entries, options) {
  entries.forEach(function(entry) {
    entry.results.forEach(function(result) {
      var buffer = [];
      var needsPadding = false;
      var frag;

      if (options.withFilename) {
        buffer.push(options.color ? colors.magenta(entry.filePath) : entry.filePath);
        buffer.push(options.color ? colors.cyan(':') : ':');

        needsPadding = true;
      }

      if (options.lineNumber) {
        buffer.push(result.loc.start.column);
        buffer.push(options.color ? colors.cyan(':') : ':');

        needsPadding = true;
      }

      if (needsPadding) {
        buffer.push(' ');
      }

      if (options.color) {
        buffer.push(result.value.slice(0, result.matchRange[0]));
        buffer.push(
          colors.bold(
            colors.red(
              result.value.slice(result.matchRange[0], result.matchRange[1])
            )
          )
        );
        buffer.push(result.value.slice(result.matchRange[1]));
      }
      else {
        buffer.push(result.value);
      }

      console.log(buffer.join(''));
    });
  });
};