import fs from 'fs';
import {Server} from 'http';
import assert from 'assert';
import {parsePuzzle} from './Parser';
import HttpStatus from 'http-status-codes';
import express, {Application} from 'express';
import asyncHandler from 'express-async-handler';

/*** Global Constants ***/
const PORT = 8789;

/**
 * Server to play the game on
 */
export class WebServer {
    private readonly app: Application;
    private server: Server | undefined;
    /**
     * AF(requestedPort) = Intiates a server to play the game on at requestedPort (default is 8789)
     * 
     * Representation invariant:
     *  - True
     * 
     * Safety from rep exposure:
     *  - Safe
     */

    public constructor(private readonly requestedPort : number = PORT) {
        this.app = express();
        this.app.use((request, response, next) => {
          // allow requests from web pages hosted anywhere
          response.set("Access-Control-Allow-Origin", "*");
          next();
        });

        /**
         * Handle a request for /get/<puzzle> by responding with the parsed puzzle in the form of the Puzzle ADT
         */
        this.app.get('/get/:puzzle', asyncHandler(async function (request, response) {
            const puzzleName = request.params['puzzle'];
            assert(puzzleName, "corrupt puzzle name");

            const contents: string = (await fs.promises.readFile(`puzzles/${puzzleName}`)).toString();
            const puzzleBoard = parsePuzzle(contents);
            let [status, apiResponse] = [HttpStatus.NOT_FOUND, "Error sending puzzle board"];

            [status, apiResponse] = [HttpStatus.OK, puzzleBoard.toString()];
            response.status(status).type("text").send(apiResponse);
        }));

    }
    /**
     * Start this server.
     *
     * @returns (a promise that) resolves when the server is listening
     */
    public start(): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.requestedPort, () => {
                console.log("server now listening at", this.port);
                resolve();
            });
        });
    }

    /**
     * @returns the actual port that server is listening at. (May be different
     *          than the requestedPort used in the constructor, since if
     *          requestedPort = 0 then an arbitrary available port is chosen.)
     *          Requires that start() has already been called and completed.
     */
    public get port(): number {
        const address = this.server?.address() ?? "not connected";

        if (typeof address === "string") throw new Error("server is not listening at a port");
        return address.port;
    }

    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    public stop(): void {this.server?.close(); console.log("server stopped");}
}