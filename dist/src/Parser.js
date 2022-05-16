"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePuzzle = void 0;
const Puzzle_1 = require("./Puzzle");
const parserlib_1 = require("parserlib");
// the grammar
const grammar = `
@skip whitespace {
    puzzle ::= size region+;
    size ::= number 'x' number '\\n';
    region ::= cell* '|' cell+ '\\n';
}
number ::= [1-9][0-9]*;
cell ::= number ',' number;
whitespace ::= [ \\t\\r\\.]+;
`;
// the nonterminals of the grammar
var PuzzleGrammar;
(function (PuzzleGrammar) {
    PuzzleGrammar[PuzzleGrammar["Size"] = 0] = "Size";
    PuzzleGrammar[PuzzleGrammar["Puzzle"] = 1] = "Puzzle";
    PuzzleGrammar[PuzzleGrammar["Cell"] = 2] = "Cell";
    PuzzleGrammar[PuzzleGrammar["Text"] = 3] = "Text";
    PuzzleGrammar[PuzzleGrammar["Number"] = 4] = "Number";
    PuzzleGrammar[PuzzleGrammar["Whitespace"] = 5] = "Whitespace";
    PuzzleGrammar[PuzzleGrammar["Region"] = 6] = "Region";
})(PuzzleGrammar || (PuzzleGrammar = {}));
// compile the grammar into a parser
const parser = (0, parserlib_1.compile)(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);
/**
 * Parse a string into a Puzzle.
 *
 * @param puzzleString string to parse
 * @returns Puzzle parsed from the string
 * @throws UnableToParseException if the string doesn't match the Puzzle grammar
 */
function parsePuzzle(puzzleString) {
    // parse the example into a parse tree
    let cleanedPuzzleString = '';
    for (const line of puzzleString.split('\n')) {
        if (line && line[0] !== '#')
            cleanedPuzzleString = cleanedPuzzleString.concat(line, '\n');
    }
    const parseTree = parser.parse(cleanedPuzzleString);
    return makeAbstractSyntaxTree(parseTree);
}
exports.parsePuzzle = parsePuzzle;
/**
 * Convert a parse tree into an abstract syntax tree.
 *
 * @param parseTree constructed according to the grammar in Puzzle.g
 * @returns abstract syntax tree corresponding to the parseTree
 */
function makeAbstractSyntaxTree(parseTree) {
    switch (parseTree.name) {
        case PuzzleGrammar.Puzzle: // puzzle ::= size regions+;
            {
                const size = parseTree.children[0];
                if (!size)
                    throw new Error("Corrupt puzzle file");
                const [puzzleW, puzzleH] = [size.children[0], size.children[1]];
                if (!puzzleW || !puzzleH)
                    throw new Error("Corrupt puzzle file");
                const w = Number.parseInt(puzzleW.text);
                const h = Number.parseInt(puzzleH.text);
                const regions = parseTree.children.slice(1);
                const cellToRegion = new Map();
                const cellToSpaceStatus = new Map();
                for (let i = 0; i < regions.length; i++) {
                    const region = regions[i];
                    if (!region)
                        throw new Error("Corrupt puzzle file");
                    const cells = region.children;
                    for (const cell of cells) {
                        const [row, col] = cell.children;
                        if (!row || !col)
                            throw new Error("Corrupt puzzle file");
                        const index = (Number.parseInt(row.text) - 1) * h + (Number.parseInt(col.text) - 1);
                        cellToRegion.set(index, i);
                        cellToSpaceStatus.set(index, Puzzle_1.SpaceStatus.Empty);
                    }
                }
                return new Puzzle_1.Puzzle(cellToRegion, cellToSpaceStatus, h);
            }
        default:
            throw new Error("should never get here");
    }
}
//# sourceMappingURL=Parser.js.map