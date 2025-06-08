//define libraries
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const express = require("express");
const router = express.Router();

const WebSocket = require("ws");
const client = new WebSocket("ws://localhost:8880");

router.get("/", (req, res) => {

    res.render("settings", {});
});

  
client.on("message", (message) => {
  let jsonIn = JSON.parse(message);

  if (jsonIn.command == "settings") {
    let filePath = path.join(__dirname, "../database/general.json");
    fs.writeFileSync(filePath, JSON.stringify(jsonIn, null, 2), "utf8");
  }
});

module.exports = router;