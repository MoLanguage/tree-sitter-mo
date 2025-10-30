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
    source_file: ($) => repeat($._decl),
    _decl: ($) => choice($.fn_decl),
    fn_decl: ($) => seq('fn', $._ident, $._param_list, $._code_block),
    _code_block: $ => seq('{', repeat($._statement),'}'),
    _statement: $ => choice(), // TODO: fill in statements
    var_decl_assign: $ => seq($.variable_ident, $._type, $._decl_assign, $._expr),
    _decl_assign: $ => /:=/,
    _expr: $ => choice(), // TODO: fill in expressions
    _param_list: ($) => seq('(', optional(seq($._param, repeat(seq(',', $._param)))), ')'), // \((param (param,)*)?\)
    _param: ($) => seq($.variable_ident, $._type),
    variable_ident: $ => $._ident,
    _ident: ($) => /[a-zA-Z]+/,
    _type: $ => choice($.primitive_type, $.primitive_type),
    primitive_type: $ => choice('bool', 'i32'),
    array_type: $ => seq('[', optional($.integer_literal), ']', $._type),
    integer_literal: $ => /[0-9]+/,
    string_literal: $ => /".*"/
  },
});
