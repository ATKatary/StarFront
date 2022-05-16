"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
/**
 * Start a server that serves puzzles from the `puzzles` directory
 * on localhost:8789.
 */
async function main() {
    // skip the first two arguments 
    // (argv[0] is node executable file, argv[1] is this script)
    const [portString] = process.argv.slice(2);
    if (portString === undefined)
        throw new Error('missing PORT');
    const port = parseInt(portString);
    if (isNaN(port) || port < 0)
        throw new Error('invalid PORT');
    const server = new Server_1.WebServer(port);
    await server.start();
}
if (require.main === module) {
    void main();
}
//# sourceMappingURL=StarbServer.js.map