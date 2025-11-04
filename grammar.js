/**
 * @file Tree-sitter parser for the Mo programming language
 * @author earomc
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// grammar.js — Tree-sitter grammar for the Mo programming language

module.exports = grammar({
  name: 'mo',
  conflicts: $ => [
    [$.typed_decl_assign, $.ident_or_path],
    [$.variable_or_call],
    [$.array_literal],
  ],
  extras: $ => [
    /\s/,       // normal whitespace
    $.comment,  // comments are skipped automatically
  ],

  supertypes: $ => [
    $.expression,
    $.stmt,
    $.literal,
  ],

  rules: {
    // ─────────────────────────────
    // Top-Level
    // ─────────────────────────────

    program: $ => seq(
      repeat(seq($.top_level_decl, repeat($.line_break))),
    ),

    top_level_decl: $ => choice(
      $.use_decl,
      $.struct_decl,
      $.fn_decl
    ),

    // ─────────────────────────────
    // Declarations
    // ─────────────────────────────

    use_decl: $ => seq(
      'use',
      $.module_path,
      optional($.string_literal)
    ),

    struct_decl: $ => seq(
      'struct',
      $.identifier,
      repeat($.line_break),
      '{',
      optional(seq(
        $.struct_field,
        repeat(seq(choice(',', $.line_break), $.struct_field))
      )),
      '}'
    ),

    struct_field: $ => seq($.identifier, $.type_expr),

    fn_decl: $ => seq(
      'fn',
      $.identifier,
      '(',
      optional($.fn_param_list),
      ')',
      optional($.type_expr),
      repeat($.line_break),
      $.code_block
    ),

    fn_param_list: $ => seq($.fn_param, repeat(seq(',', $.fn_param))),

    fn_param: $ => seq($.identifier, $.type_expr),

    code_block: $ => seq(
      '{',
      repeat($.line_break),
      repeat(seq($.stmt, repeat($.line_break))),
      '}'
    ),

    // ─────────────────────────────
    // Statements
    // ─────────────────────────────

    stmt: $ => choice(
      $.for_loop,
      $.if_stmt,
      $.ret_stmt,
      $.defer_stmt,
      $.code_block,
      $.var_decl,
      $.assignment,
      $.var_op_assign,
      $.expr_stmt
    ),

    for_loop: $ => seq('for', $.expression, $.code_block),

    if_stmt: $ => seq(
      'if',
      $.expression,
      $.code_block,
      optional(seq('else', $.code_block))
    ),

    ret_stmt: $ => seq('ret', choice($.expression, $.line_break)),

    defer_stmt: $ => seq('defer', $.stmt),

    assignment: $ => seq($.unary_expr, '=', $.expression),

    var_op_assign: $ => seq($.unary_expr, $.binary_op, '=', $.expression),

    expr_stmt: $ => $.expression,

    // ─────────────────────────────
    // Variable Declarations
    // ─────────────────────────────

    var_decl: $ => choice(
      $.inferred_decl_assign,
      $.typed_decl_assign,
    ),

    inferred_decl_assign: $ => seq($.identifier, ':=', $.expression),
    typed_decl_assign: $ => seq($.identifier, $.type_expr, ':=', $.expression),

    // ─────────────────────────────
    // Expressions
    // ─────────────────────────────

    expression: $ => $.equality_expr,

    equality_expr: $ => prec.left(1, seq(
      $.comparison_expr,
      repeat(seq(choice('==', '!='), $.comparison_expr))
    )),

    comparison_expr: $ => prec.left(2, seq(
      $.term_expr,
      repeat(seq(choice('>', '>=', '<', '<='), $.term_expr))
    )),

    term_expr: $ => prec.left(3, seq(
      $.factor_expr,
      repeat(seq(choice('+', '-'), $.factor_expr))
    )),

    factor_expr: $ => prec.left(4, seq(
      $.unary_expr,
      repeat(seq($.factor_op, $.unary_expr))
    )),

    factor_op: $ => choice('/', '*', '%', '&', '~', '<<', '>>', '^', '|'),

    unary_expr: $ => seq(optional($.unary_op), $.dot_expr),

    unary_op: $ => choice('!', '-', '&', '*'),

    dot_expr: $ => seq($.primary_expr, repeat(seq('.', $.dot_suffix))),

    dot_suffix: $ => choice($.fn_call_suffix, $.field_access),

    fn_call_suffix: $ => prec.left(seq($.identifier, '(', optional($.arg_list), ')')),

    field_access: $ => prec.left($.identifier), // Only simple identifiers allowed

    arg_list: $ => seq($.expression, repeat(seq(',', $.expression))),

    primary_expr: $ => choice(
      $.literal,
      $.grouped_expr,
      $.variable_or_call,
      $.array_literal
    ),

    grouped_expr: $ => seq('(', $.expression, ')'),

    variable_or_call: $ => seq(
      $.ident_or_path,
      optional(choice(
        seq('[', $.expression, ']'),
        seq('(', optional($.arg_list), ')')
      ))
    ),

    ident_or_path: $ => choice($.identifier, $.module_path),

    literal: $ => choice(
      $.number_literal,
      $.string_literal,
      'true',
      'false'
    ),

    array_literal: $ => seq(
      '[',
      optional(seq($.expression, repeat(seq(',', $.expression)))),
      ']',
      optional($.type_expr)
    ),

    // ─────────────────────────────
    // Type Expressions
    // ─────────────────────────────

    type_expr: $ => choice(
      $.array_type,
      $.pointer_type,
      $.named_type
    ),

    array_type: $ => seq(
      '[',
      optional($.decimal_integer_number_literal),
      ']',
      $.type_expr
    ),

    pointer_type: $ => seq('*', $.type_expr),

    named_type: $ => $.ident_or_path,

    // ─────────────────────────────
    // Lexical rules (terminals)
    // ─────────────────────────────

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    module_path: $ => seq(
      $.identifier,
      repeat1(seq(':', $.identifier))
    ),

    string_literal: _ => /"([^"\\]|\\["\\nrt0'])*"/,

    number_literal: _ => token(choice(
      /[0-9][0-9_]*/,                   // decimal
      /[0-9][0-9_]*\.[0-9][0-9_]*/,     // float
      /0x[0-9a-fA-F_]+/,                // hex
      /0o[0-7_]+/,                      // octal
      /0b[01_]+/                        // binary
    )),

    decimal_integer_number_literal: _ => /[0-9][0-9_]*/,

    comment: _ => token(seq('//', /.*/)),

    line_break: _ => token(choice(/\r\n/, /\n/)),

    binary_op: _ => choice('+', '-', '*', '/', '%', '&', '|', '^', '~', '<<', '>>'),
  },
});
