"use strict";
/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Server_1 = require("../src/Server");
const Puzzle_1 = require("../src/Puzzle");
const Parser_1 = require("../src/Parser");
const node_fetch_1 = __importDefault(require("node-fetch"));
describe('puzzle', function () {
    // Testing strategy
    //   partition on isSolved output
    //    solved[true] (manually tested)
    //    unsolved[false] 
    //   partition on getRegion index
    //     valid
    //     invalid
    //   partition on new status of a grid cell
    //      empty cell[immutable puzzle --> no change]
    //      cell filled with star [immutable puzzle --> no change]
    //      cell filled with a dot [immutable puzzle --> no change]
    //   parition on toString output
    //     valid for kd-1-1-1.starb
    //     valid for kd-6-31-6.starb
    it("covers isSolved output = false", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-1-1-1.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        (0, assert_1.default)(!puzzle.isSolved);
        server.stop();
    });
    it("covers new status of a grid cell = Dot[no change], covers valid getRegion index", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-1-1-1.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        puzzle.changeStatus(0, Puzzle_1.SpaceStatus.Dot);
        (0, assert_1.default)(puzzle.getRegion(0) === Puzzle_1.SpaceStatus.Empty);
        server.stop();
    });
    it("covers new status of a grid cell = Empty[no change], covers invalid getRegion index", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-1-1-1.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        puzzle.changeStatus(1, Puzzle_1.SpaceStatus.Empty);
        (0, assert_1.default)(puzzle.getRegion(1) === Puzzle_1.SpaceStatus.Empty);
        try {
            puzzle.getRegion(14434);
            (0, assert_1.default)(false);
        }
        catch (e) {
            (0, assert_1.default)(true);
        }
        server.stop();
    });
    it("covers new status of a grid cell = Star[no change]", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-1-1-1.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        puzzle.changeStatus(1, Puzzle_1.SpaceStatus.Star);
        (0, assert_1.default)(puzzle.getRegion(1) === Puzzle_1.SpaceStatus.Empty);
        try {
            puzzle.getRegion(14434);
            (0, assert_1.default)(false);
        }
        catch (e) {
            (0, assert_1.default)(true);
        }
        server.stop();
    });
    it("covers toString output valid for kd-1-1-1.starb", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-1-1-1.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        const expected = "10x10\n" +
            "| 1,2 1,5 1,1 1,3 1,4 1,6 1,7 1,8 2,1 2,2 2,3 2,4 2,5 2,6 2,8 3,5 \n" +
            "| 2,9 4,10 1,9 1,10 2,10 3,9 3,10 4,9 5,9 5,10 6,9 6,10 7,10 8,10 \n" +
            "| 3,2 3,4 3,3 \n" +
            "| 2,7 4,8 3,6 3,7 3,8 \n" +
            "| 6,1 9,1 3,1 4,1 4,2 4,3 4,4 5,1 5,2 5,3 6,2 7,1 7,2 8,1 8,2 8,3 8,4 8,5 8,6 \n" +
            "| 5,4 5,6 4,5 5,5 6,4 6,5 6,6 \n" +
            "| 6,8 8,7 4,6 4,7 5,7 5,8 6,7 7,6 7,7 7,8 8,8 \n" +
            "| 7,3 7,5 6,3 7,4 \n" +
            "| 8,9 10,10 7,9 9,9 9,10 \n" +
            "| 9,3 10,6 9,2 9,4 9,5 9,6 9,7 9,8 10,1 10,2 10,3 10,4 10,5 10,7 10,8 10,9 \n";
        assert_1.default.strictEqual(puzzle.toString(), expected);
        server.stop();
    });
    it("covers toString output valid for kd-6-31-6.starb", async function () {
        const server = new Server_1.WebServer(0);
        await server.start();
        const fileContents = await (0, node_fetch_1.default)(`http://localhost:${server.port}/get/kd-6-31-6.starb`);
        const puzzle = (0, Parser_1.parsePuzzle)(await (fileContents.text()));
        const expected = "10x10\n" +
            "| 1,1 3,1 2,1 \n" +
            "| 2,3 3,5 1,2 1,3 1,4 1,5 2,2 2,4 2,5 \n" +
            "| 1,6 2,8 1,7 1,8 1,9 1,10 2,9 2,10 \n" +
            "| 6,2 5,4 3,2 3,3 3,4 4,1 4,2 4,3 4,4 4,5 5,1 5,2 5,3 5,5 6,1 6,3 6,4 6,5 7,1 7,2 7,5 8,1 8,5 9,1 10,1 \n" +
            "| 5,6 4,8 2,6 2,7 3,6 3,7 3,8 3,9 4,6 4,7 4,9 5,7 6,6 6,7 6,8 7,6 \n" +
            "| 4,10 6,10 3,10 5,8 5,9 5,10 6,9 7,9 7,10 8,10 9,10 10,10 \n" +
            "| 7,4 8,2 7,3 8,3 8,4 9,2 10,2 \n" +
            "| 9,5 10,3 8,6 8,7 9,3 9,4 9,6 10,4 10,5 \n" +
            "| 7,7 8,9 7,8 8,8 9,8 \n" +
            "| 9,7 10,9 9,9 10,6 10,7 10,8 \n";
        assert_1.default.strictEqual(puzzle.toString(), expected);
        server.stop();
    });
});
//# sourceMappingURL=PuzzleTests.js.map