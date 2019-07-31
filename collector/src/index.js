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
    .command("import <service-name> <input-bundle>")
    .description("Imports the given .tar.gz file for the given service.")
    .action((serviceName = "", inputPath = "") => {
        require(`./services/${serviceName}/collector`)(inputPath);
    });

// Database Initialization
program
    .command("init-database <service-name> <input-bundle>")
    .description("Initializes the service and stations for the given service in the database.")
    .action((serviceName = "", inputPath = "") => {
        require(`./services/${serviceName}/init-database`)(inputPath);
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
