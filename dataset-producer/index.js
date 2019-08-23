const program = require("commander");

program
    .version("1.0.0")
    .description("Exports snapshots into TensorFlow.js compatible CSV datasets.")
    .usage("<command> [...]");

program
    .command("export <service-id> <start-date> <end-date> <output-path>")
    .description(
        "Exports all datasets into the given directory. Please note that the date interval " +
        "is defined by [start-date, end-date) and half-open."
    )
    .action((serviceId, startDate, endDate, outputPath) => {
        require("./producer")(serviceId, startDate, endDate, outputPath);
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
