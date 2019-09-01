const nconf = require("nconf");

function Config() {
    nconf.env("__");
    nconf.defaults({conf: `${__dirname}/config.json`});
    nconf.file("user", nconf.get("conf"));
}

Config.prototype.get = function(key) {
    return nconf.get(key);
};

Config.prototype.overrides = function(obj) {
    return nconf.overrides(obj);
};

module.exports = new Config();
