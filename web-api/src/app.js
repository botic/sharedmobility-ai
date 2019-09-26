const express = require("express");
const app = express();

// configure express to be less noisy
app.set("etag", false); // we don't need etags ...
app.set("json spaces", 2); // easier to read output instead of saving some bytes
app.set("x-powered-by", false); // nobody needs this header

// security headers
app.use((req, res, next) => {
    // HSTS incl. preload to enforce secure https requests by default
    res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // no sniffing for mime types
    res.header("X-Content-Type-Options", "nosniff");

    // CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

// binds the routes and sets v1 as default version
app.use("/v1", require("./routes/v1"));
app.get("/", (req, res) => res.redirect("/v1"));

module.exports = app;
