const express = require("express");
var serveStatic = require("serve-static");
const app = require("./controller/app.js");

require("dotenv").config(); //This code will automatically load the .env file in the root of your project and initialize the values, skipping any variables already preset. Be careful not to use .env files in your production environment, though. Instead, set the values directly on the respective host. So you might want to wrap your load statement in an if statement:

//var port = 8081;
//set a default value if environment variuable not set
const port = process.env.PORT || 8081;

app.use(serveStatic(__dirname + "/public"));

var server = app.listen(port, function () {
  console.log("Web App Hosted at http://localhost:%s", port);
});
