const express = require("express");
const app = express();
const path = require("path");

const config = require("./database/general.json");


app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'database')));


app.set("view engine", "ejs");

const WebSocket = require("ws");
const server = new WebSocket.Server({ port: config.wsport });

server.on("connection", (ws) => {
  console.log("WS: new CLIENT connected!");

  ws.on("message", (message) => {
    server.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
      }
    });
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

const panel = require("./routes/panel");
const settings = require("./routes/settings");
const view = require("./routes/view");
const sender = require("./routes/sender");
app.use("/panel", panel);
app.use("/settings", settings);
app.use("/view", view);
app.use("/sender", sender);

app.listen(2087);

