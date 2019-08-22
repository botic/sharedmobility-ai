#!/usr/bin/env node

//
// the main script
//

const program = require("commander");
const pkg = require("../package.json");

// Basic infos
program
    .version(pkg.version)
    .description(pkg.description)
    .usage("<command> [...]");

// Import
program
    .command("import <service-name> <input-bundle>")
    .description("Imports the given .tar.gz file for the given service.")
    .action((serviceName = "", inputPath = "") => {
        require(`./services/${serviceName}/snapshot-importer`)(inputPath);
    });

// Database initialization
program
    .command("init-database <service-name> <input-bundle>")
    .description("Initializes the service and stations for the given service in the database.")
    .action((serviceName = "", inputPath = "") => {
        require(`./services/${serviceName}/init-database`)(inputPath);
    });

// Import weather data
program
    .command("import-weather <synop-id> <csv-directory> [start-date]")
    .description("Imports the given weather files into the database.")
    .action((synopId = "", csvDirectory = "", startDate = "2018-07-31") => {
        require("./weather")(synopId, csvDirectory, startDate)
            .catch(e => {
                console.error(e);
            });
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
