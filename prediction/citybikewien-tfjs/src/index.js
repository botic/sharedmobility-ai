#!/usr/bin/env node

const path = require("path");
const program = require("commander");
const pkg = require("../package.json");

// Basic Infos
program
    .version(pkg.version)
    .description(pkg.description)
    .usage("<command> [...]");

// Learn for the overall service with all stations
program
    .command("pan-service <input-csv> <output-dir>")
    .description("Runs ML on the given training data and stores the resulting model in the given directory.")
    .action((inputCSV = null, outputDir = null) => {
        const learn = require("./tensorflow/pan-service/learn");
        learn(new URL(`file:///${path.normalize(inputCSV)}`), new URL(`file:///${path.normalize(outputDir)}`));
    });

// Creates a model for every stations
program
    .command("per-station <input-csv> <output-dir>")
    .description("Runs ML on the given training data and stores the resulting model in the given directory.")
    .action((inputCSV = null, outputDir = null) => {
        const learn = require("./tensorflow/per-station/learn");
        learn(new URL(`file:///${path.normalize(inputCSV)}`), new URL(`file:///${path.normalize(outputDir)}`));
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