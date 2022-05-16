"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Puzzle = exports.ModifyValue = exports.SpaceStatus = void 0;
/*** Global Constants ***/
const REQUIRED_STARS = 2;
/*** Enums ***/
var SpaceStatus;
(function (SpaceStatus) {
    SpaceStatus[SpaceStatus["Empty"] = 0] = "Empty";
    SpaceStatus[SpaceStatus["Dot"] = 1] = "Dot";
    SpaceStatus[SpaceStatus["Star"] = 2] = "Star";
})(SpaceStatus = exports.SpaceStatus || (exports.SpaceStatus = {}));
var ModifyValue;
(function (ModifyValue) {
    ModifyValue[ModifyValue["Increment"] = 0] = "Increment";
    ModifyValue[ModifyValue["Decrement"] = 1] = "Decrement";
    ModifyValue[ModifyValue["Constant"] = 2] = "Constant";
})(ModifyValue = exports.ModifyValue || (exports.ModifyValue = {}));
class Puzzle {
    /**
     * AF(rowToStars, columnToStars, regionToStars,
     *    regionToCells, isSolved, cellToRegion,
     *    cellToSpaceStatus) =  The puzzle, where rowToStars maps each row to the number of stars in that row, columnToStars maps each column to the number
     *                          of stars in that column, regionToStars maps each region to the number of stars in that region, regionToIndeces maps each region to the
     *                          indeces that region encloses, isSolved is true if the puzzle is solved, false otherwise, indexToRegion maps each index to the region it belongs to,
     *                          and indexToSpaceStatus maps each index to that space's status (empty, has a dot, has a star).
     *
     * Representation invariant:
     *  - Every value in rowToStars, colToStars, and regionToStars is <= 2 and > 0
     *
     * Safety from rep exposure:
     *  - All fields are private, readonly, and no reference to any of the mutable fields is given by any of the functions
     */
    constructor(cellToRegion, cellToSpaceStatus, puzzleSize) {
        this.cellToRegion = cellToRegion;
        this.cellToSpaceStatus = cellToSpaceStatus;
        this.puzzleSize = puzzleSize;
        this.rowToStars = new Map();
        this.columnToStars = new Map();
        this.regionToStars = new Map();
        this.regionToCells = new Map();
        this.isSolved = true;
        for (let i = 0; i < 2; i++) {
            for (const [cell, status] of cellToSpaceStatus) {
                const region = cellToRegion.get(cell);
                const [row, col] = this._coordinates(cell);
                if (region === undefined)
                    throw new Error("region does not exist");
                let numRowStars = this.rowToStars.get(row);
                let numColStars = this.columnToStars.get(col);
                let numRegionStars = this.regionToStars.get(region);
                if (numRowStars === undefined)
                    numRowStars = 0;
                if (numColStars === undefined)
                    numColStars = 0;
                if (numRegionStars === undefined)
                    numRegionStars = 0;
                if (status === SpaceStatus.Star) {
                    numRowStars += 1;
                    numColStars += 1;
                    numRegionStars += 1;
                }
                if (i === 0) {
                    this.rowToStars.set(row, numRowStars);
                    this.columnToStars.set(col, numColStars);
                    this.regionToStars.set(region, numRegionStars);
                }
                else {
                    if (numRowStars < REQUIRED_STARS || numColStars < REQUIRED_STARS || numRegionStars < REQUIRED_STARS) {
                        this.isSolved = false;
                        break;
                    }
                }
            }
        }
        for (const [cell, region] of this.cellToRegion) {
            const cellsEnclosedByRegion = this.regionToCells.get(region);
            if (!cellsEnclosedByRegion)
                this.regionToCells.set(region, [cell]);
            else {
                const cellSpaceStatus = cellToSpaceStatus.get(cell);
                if (cellSpaceStatus === SpaceStatus.Star)
                    cellsEnclosedByRegion.unshift(cell);
                else
                    cellsEnclosedByRegion.push(cell);
            }
        }
        this.checkRep();
    }
    /**
     * Checks to ensure the RI hasn't been violated
     *
     * @throws Error if the RI has been violated
     */
    checkRep() {
        for (const [region, regionStars] of this.regionToStars) {
            const rowStars = this.rowToStars.get(region);
            const colStars = this.columnToStars.get(region);
            if (rowStars === undefined || regionStars === undefined || colStars === undefined)
                throw new Error("Something here is wrong");
            if (rowStars > REQUIRED_STARS || rowStars < 0)
                throw Error("The RI has been violated: expected rowStars <= 2");
            if (colStars > REQUIRED_STARS || colStars < 0)
                throw Error("The RI has been violated: expected colStars <= 2");
            if (regionStars > REQUIRED_STARS || regionStars < 0)
                throw Error("The RI has been violated: expected regionStars <= 2");
        }
    }
    /**
     * Modify's the star maps that this index belongs to
     *
     * @param cell The 1D cell index of the board space we want to use to modify the stars map
     * @param increment true if we are incrementing each map, false otherwise
     */
    modifyStarsMaps(cell, increment) {
        let valueChange = 0;
        if (increment === ModifyValue.Increment)
            valueChange = 1;
        else if (increment === ModifyValue.Decrement)
            valueChange = -1;
        const region = this.cellToRegion.get(cell);
        const [row, col] = this._coordinates(cell);
        if (region === undefined)
            throw new Error("region does not exist");
        const numRowStars = this.rowToStars.get(row);
        const numColStars = this.columnToStars.get(col);
        const numRegionStars = this.regionToStars.get(region);
        if (numRowStars === undefined || numColStars === undefined || numRegionStars === undefined)
            throw new Error("something went wrong with star count");
        this.rowToStars.set(row, numRowStars + valueChange);
        this.columnToStars.set(col, numColStars + valueChange);
        this.regionToStars.set(region, numRegionStars + valueChange);
    }
    /**
     * Returns the region associated with the index
     *
     * @param cell The 1D cell index we want to get the column of
     * @returns the region associated with the index
     */
    getRegion(cell) {
        const region = this.cellToRegion.get(cell);
        if (region === undefined)
            throw new Error("region does not exist");
        return region;
    }
    /**
     * Changes the SpaceStatus of the space corresponding to
     * cell to status by returning a new puzzle with this change
     *
     * @param cell The 1D cell index at which we want to modify's status
     * @param newStatus The newStatus we want to assign to this board space
     * @returns A new puzzle based on this puzzle, with the only
     *          change being a the board space's SpaceStatus
     *          corresponding to index changing to status
     * @throws Error if changing this board space's SpaceStatus to star, and
     *         doing this would conflict with the rule of only having two
     *         stars in each column, row, or region
     */
    changeStatus(cell, newStatus) {
        let modifyValue;
        let revertValue;
        const currStatus = this.cellToSpaceStatus.get(cell);
        switch (currStatus) {
            case SpaceStatus.Dot || SpaceStatus.Empty: {
                if (newStatus === SpaceStatus.Star)
                    [modifyValue, revertValue] = [ModifyValue.Increment, ModifyValue.Decrement];
                break;
            }
            case SpaceStatus.Star: {
                if (newStatus === SpaceStatus.Dot || newStatus === SpaceStatus.Empty)
                    [modifyValue, revertValue] = [ModifyValue.Decrement, ModifyValue.Increment];
                break;
            }
            default: break;
        }
        if (modifyValue !== undefined && revertValue !== undefined) {
            this.modifyStarsMaps(cell, modifyValue);
            try {
                this.checkRep();
            }
            catch (error) {
                this.modifyStarsMaps(cell, revertValue);
                throw Error("Making this modification would lead to an invalid board");
            }
            this.modifyStarsMaps(cell, revertValue);
        }
        const newCellToRegion = new Map(this.cellToRegion);
        const newCellToSpaceStatus = new Map(this.cellToSpaceStatus);
        newCellToSpaceStatus.set(cell, newStatus);
        return new Puzzle(newCellToRegion, newCellToSpaceStatus, this.puzzleSize);
    }
    /**
     * Gives the string representation of the puzzle,
     * the string representation described in the returns section
     *
     * @returns a string representation of the puzzle,
     *          with the same format as the kd-1-1-1.starb file
     *          and the kd-6-31-6.starb file
     */
    toString() {
        let returnString = `${this.puzzleSize}x${this.puzzleSize}\n`;
        for (let region = 0; region < this.puzzleSize; region++) {
            let pipeInserted = false;
            const cellsEnclosedByRegion = this.regionToCells.get(region);
            if (!cellsEnclosedByRegion)
                continue;
            for (const cell of cellsEnclosedByRegion) {
                const cellSpaceStatus = this.cellToSpaceStatus.get(cell);
                let [row, col] = this._coordinates(cell);
                row += 1;
                col += 1;
                if (cellSpaceStatus !== SpaceStatus.Star && !pipeInserted) {
                    returnString += `| `;
                    pipeInserted = true;
                }
                returnString += `${row},${col} `;
            }
            returnString += '\n';
        }
        return returnString;
    }
    /*** Helper Methods ***/
    /**
     * Retrives the 2D coordinates of a cell given the 1D index coordinate
     *
     * @param cell the 1D index number of the cell
     * @returns row, col of the 2D coordinates of a cell
     */
    _coordinates(cell) {
        const row = Math.floor(cell / this.puzzleSize);
        const col = cell % this.puzzleSize;
        return [row, col];
    }
}
exports.Puzzle = Puzzle;
//# sourceMappingURL=Puzzle.js.map