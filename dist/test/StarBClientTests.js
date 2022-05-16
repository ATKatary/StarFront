"use strict";
/* Copyright (c) 2021 MIT 6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
Object.defineProperty(exports, "__esModule", { value: true });
describe('starb-client', function () {
    // Manual tests
    /*
     * Manual test: navigate to puzzle.html via your browser
     * Covers: puzzle=blank, checking puzzle = solved
     * 2. switch dropdown selection to kd-6-31-6.starb["ready for change"]
     * 3. click on "request a new puzzle" button
     * 4. assert that the grid of size 10x10 appears on the grid canvas section
     * 5. click on "check this puzzle" button
     * 6. assert that the status message says "Your puzzle is not fully solved yet...Chug Away!"
     */
    /*
    * Manual test: navigate to puzzle.html via your browser
    * Covers: action=adding star, adding dot, removing star
    * 1. switch dropdown selection to kd-6-31-6.starb["ready for change"]
    * 3. click on the top right most grid cell
    * 4. assert that a dot-like symbol appears in that grid cell
    * 5. click on the top right most grid cell again
    * 6. assert that a star-like symbol appears in that grid cell
    * 7. click on the top right most grid cell again
    * 8. assert that the top right most grid cell is now blank
    */
    /*
   * Manual test: navigate to puzzle.html via your browser
   * Covers: checking puzzle = solved
   * 1. switch dropdown selection to kd-6-31-6.starb["ready for change"]
   * 3. solve the puzzle as defined by the game specifications
   * 4. assert that the status message says "You win!"
   */
});
//# sourceMappingURL=StarBClientTests.js.map