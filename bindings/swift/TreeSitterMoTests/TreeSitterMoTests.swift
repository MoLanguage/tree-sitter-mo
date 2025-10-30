import XCTest
import SwiftTreeSitter
import TreeSitterMo

final class TreeSitterMoTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_mo())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Mo grammar")
    }
}
