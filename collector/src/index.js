#!/usr/bin/env node

//
// the main script
//

const program = require("commander");
const pkg = require("../package.json");

// Basic Infos
program
    .version(pkg.version)
    .description(pkg.description)
    .usage("<command> [...]");

// Import
program
    .command("import [input-bundle]")
    .description("Imports the given .tar.gz file as SeestadtFLOTTE data.")
    .action((inputPath = "") => {
        require("./seestadtflotte/collector")(inputPath);
    });

// Database Initialization
program
    .command("init-database [input-bundle]")
    .description("Initializes the service and stations for SeestadtFLOTTE in the database.")
    .action((inputPath = "") => {
        require("./seestadtflotte/init-database")(inputPath);
    });

/**
 * Parses the arguments and executes the associated action.
 */
function main() {
    program.parse(process.argv);

    if (!program.args.filter(arg => typeof arg === "object").length) {
        program.help();
    }
}

main();
