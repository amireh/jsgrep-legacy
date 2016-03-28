# jsgrep

A JavaScript "grep" that runs against the AST. Useful for locating tokens or
statements that might be difficult to catch using regular grep, like instance
method calls with a certain arity.

## Installation

```shell
npm install -g jsgrep-frd
```

Then run `jsgrep --help` to get started.

## Supported Matching Tokens

#### Instance method calls

_TODO_

Example for locating `log` calls with two arguments:

```shell
jsgrep -Hnc "#log{2}" lib/
```
