import {parsePuzzle} from './Parser';
import {Puzzle, SpaceStatus} from './Puzzle';

export class Client {
    /**
     * AF(puzzle) = The current Puzzle puzzle the client is playing on
     * 
     * Representation invariant:
     *  - True
     * 
     * Safety from rep exposure:
     *  - The field puzzle is private, immutable, but isn't readonly so it can be reassigned using functions in the class to update the game state
     */

    public constructor(private puzzle: Puzzle) {}
    
    /**
     * Updates the game state of the client by changing the status
     * of the space at index to newStatus. If the move is invalid,
     * then the error message thrown by puzzle will be shown
     * in the console (may want to change this later since we want to show
     * the user the error, not sure if this does this correctly)
     * 
     * @param index The index of the space we want to change the status of
     * @param newStatus The status we want to give to this space
     * @returns nothing or a string status method
     */
    public makeMove(index: number, newStatus: SpaceStatus): void | string {
        try {this.puzzle = this.puzzle.changeStatus(index, newStatus);} 
        catch(error) {return "This move is not valid";}
    }

    /**
     * Checks if the puzzle is solved, and returns a Boolean
     * to indicate whether it is solved or not
     * 
     * @returns True if the puzzle is solved, false otherwise
     */
    public isSolved(): boolean {return this.puzzle.isSolved;}

    /**
     * Returns the region associated with the index
     * 
     * @param index The index we want to get the column of
     * @returns the region associated with the index
     */
    public getRegion(index: number): number {return this.puzzle.getRegion(index);}

    /**
     * @returns the toString of the Client's current puzzle
     */
    public toString(): string {return this.puzzle.toString();}
}

/**
 * Returns an instance of Client with a blank puzzle
 * corresponding to the file filename
 * 
 * @param puzzleString the toString of the puzzle we want
 * @returns new instance of client based on the filename
 */
export function clientFromPuzzle(puzzleString: string): Client {return new Client(parsePuzzle(puzzleString));}
