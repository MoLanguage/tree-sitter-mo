package tree_sitter_mo_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_mo "github.com/molanguage/tree-sitter-mo/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_mo.Language())
	if language == nil {
		t.Errorf("Error loading Mo grammar")
	}
}
