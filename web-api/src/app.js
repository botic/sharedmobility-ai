const express = require("express");
const app = express();

app.use("/v1", require("./routes/v1"));
app.get("/", (req, res) => res.redirect("/v1"));

module.exports = app;
