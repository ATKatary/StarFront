"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebServer = void 0;
const fs_1 = __importDefault(require("fs"));
const assert_1 = __importDefault(require("assert"));
const Parser_1 = require("./Parser");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
/*** Global Constants ***/
const PORT = 8789;
/**
 * Server to play the game on
 */
class WebServer {
    /**
     * AF(requestedPort) = Intiates a server to play the game on at requestedPort (default is 8789)
     *
     * Representation invariant:
     *  - True
     *
     * Safety from rep exposure:
     *  - Safe
     */
    constructor(requestedPort = PORT) {
        this.requestedPort = requestedPort;
        this.app = (0, express_1.default)();
        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set("Access-Control-Allow-Origin", "*");
            next();
        });
        /**
         * Handle a request for /get/<puzzle> by responding with the parsed puzzle in the form of the Puzzle ADT
         */
        this.app.get('/get/:puzzle', (0, express_async_handler_1.default)(async function (request, response) {
            const puzzleName = request.params['puzzle'];
            (0, assert_1.default)(puzzleName, "corrupt puzzle name");
            const contents = (await fs_1.default.promises.readFile(`puzzles/${puzzleName}`)).toString();
            const puzzleBoard = (0, Parser_1.parsePuzzle)(contents);
            let [status, apiResponse] = [http_status_codes_1.default.NOT_FOUND, "Error sending puzzle board"];
            [status, apiResponse] = [http_status_codes_1.default.OK, puzzleBoard.toString()];
            response.status(status).type("text").send(apiResponse);
        }));
    }
    /**
     * Start this server.
     *
     * @returns (a promise that) resolves when the server is listening
     */
    start() {
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
    get port() {
        const address = this.server?.address() ?? "not connected";
        if (typeof address === "string")
            throw new Error("server is not listening at a port");
        return address.port;
    }
    /**
     * Stop this server. Once stopped, this server cannot be restarted.
     */
    stop() { this.server?.close(); console.log("server stopped"); }
}
exports.WebServer = WebServer;
//# sourceMappingURL=Server.js.map