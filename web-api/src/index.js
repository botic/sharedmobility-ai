const express = require("express");
const app = express();

const config = require("./config");
const PORT = config.get("port");

app.use("/v1", require("./v1"));
app.get("/", (req, res) => res.redirect("/v1"));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
