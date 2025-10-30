/**
 * @file Tree-sitter parser for the Mo programming language
 * @author earomc
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "mo",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
