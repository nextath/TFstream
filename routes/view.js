//define libraries
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { countryToAlpha2, countryToAlpha3 } = require("country-to-iso");

const express = require("express");
const router = express.Router();
const config = require("../database/general.json");

let filePath = path.join(__dirname, "../database/general.json");
let jsonDB;
const settings = { method: "Get" };

let ws = config.wsurl + ":" + config.wsport;

router.get("/", (req, res) => {
  res.render("view", {});
});

const WebSocket = require("ws");
const client = new WebSocket(ws);

client.on("message", (message) => {
  let jsonIN = JSON.parse(message);

  //TITLE UPDATE
  if (jsonIN.command == "show-title") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
      }
      try {
        jsonDB = JSON.parse(data);
        let id = jsonIN.id;
        let round = jsonIN.round;
        const race = jsonDB.events.find((event) => event.id === id);
        let name = race.short;
        let type = race.type;

        if (round == 1 && (type == "vt" || type == "hz")) {
          round = "QUAL";
        } else if (round == 2) {
          round = "FINAL";
        } else if (round == 3) {
          round = "";
        } else {
          round = "HEATS";
        }

        let jsonDATA = {
          command: "show-title-view",
          name: name,
          round: round,
        };
        let jsonSEND = JSON.stringify(jsonDATA);
        client.send(jsonSEND);
      } catch (parseError) {
        console.error(parseError);
      }
    });
  } else if (jsonIN.command == "show-trackres") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
      }
      try {
        jsonDB = JSON.parse(data);

        let lifCode =
          jsonIN.id + "-" + jsonIN.round + "-" + jsonIN.heats + ".lif";
        let filePath = path.join(jsonDB.path, lifCode);
        let round;

        if (jsonIN.round == 1) {
          round = "HEATS";
        } else {
          round = "FINAL";
        }

        let results = [];
        if (fs.existsSync(filePath)) {
          fs.createReadStream(filePath)
            .pipe(
              csv({
                headers: false,
              })
            )
            .on("data", (data) => results.push(data))
            .on("end", () => {
              let mark1;
              let mark2;
              let mark3;
              let mark4;
              let mark5;
              let mark6;
              let mark7;
              let mark8;

              let rank1;
              let rank2;
              let rank3;
              let rank4;
              let rank5;
              let rank6;
              let rank7;
              let rank8;

              if (results[1]?.["6"] == "NP") {
                mark1 = "DNS";
                rank1 = "-";
              } else if (results[1]?.["6"] == "NA") {
                mark1 = "DNF";
                rank1 = "-";
              } else if (results[1]?.["6"] == "") {
                mark1 = "";
                rank1 = "";
              } else {
                mark1 = results[1]?.["6"];
                rank1 = 1;
              }

              if (results[2]?.["6"] == "NP") {
                mark2 = "DNS";
                rank2 = "-";
              } else if (results[2]?.["6"] == "NA") {
                mark2 = "DNF";
                rank2 = "-";
              } else if (results[2]?.["6"] == "") {
                mark2 = "";
                rank2 = "";
              } else {
                mark2 = results[2]?.["6"];
                rank2 = 2;
              }

              if (results[3]?.["6"] == "NP") {
                mark3 = "DNS";
                rank3 = "-";
              } else if (results[3]?.["6"] == "NA") {
                mark3 = "DNF";
                rank3 = "-";
              } else if (results[3]?.["6"] == "") {
                mark3 = "";
                rank3 = "";
              } else {
                mark3 = results[3]?.["6"];
                rank3 = 3;
              }

              if (results[4]?.["6"] == "NP") {
                mark4 = "DNS";
                rank4 = "-";
              } else if (results[4]?.["6"] == "NA") {
                mark4 = "DNF";
                rank4 = "-";
              } else if (results[4]?.["6"] == "") {
                mark4 = "";
                rank4 = "";
              } else {
                mark4 = results[4]?.["6"];
                rank4 = 4;
              }

              if (results[5]?.["6"] == "NP") {
                mark5 = "DNS";
                rank5 = "-";
              } else if (results[5]?.["6"] == "NA") {
                mark5 = "DNF";
                rank5 = "-";
              } else if (results[5]?.["6"] == "") {
                mark5 = "";
                rank5 = "";
              } else {
                mark5 = results[5]?.["6"];
                rank5 = 5;
              }

              if (results[6]?.["6"] == "NP") {
                mark6 = "DNS";
                rank6 = "-";
              } else if (results[6]?.["6"] == "NA") {
                mark6 = "DNF";
                rank6 = "-";
              } else if (results[6]?.["6"] == "") {
                mark6 = "";
                rank6 = "";
              } else {
                mark6 = results[6]?.["6"];
                rank6 = 6;
              }

              if (results[7]?.["6"] == "NP") {
                mark7 = "DNS";
                rank7 = "-";
              } else if (results[7]?.["6"] == "NA") {
                mark7 = "DNF";
                rank7 = "-";
              } else if (results[7]?.["6"] == "") {
                mark7 = "";
                rank7 = "";
              } else {
                mark7 = results[7]?.["6"];
                rank7 = 7;
              }

              if (results[8]?.["6"] == "NP") {
                mark8 = "DNS";
                rank8 = "-";
              } else if (results[8]?.["6"] == "NA") {
                mark8 = "DNF";
                rank8 = "-";
              } else if (results[8]?.["6"] == "") {
                mark8 = "";
                rank8 = "";
              } else {
                mark8 = results[8]?.["6"];
                rank8 = 8;
              }

              let flag1 = countryToAlpha2(results[1]?.["5"]) || "IT";
              let flag2 = countryToAlpha2(results[2]?.["5"]) || "IT";
              let flag3 = countryToAlpha2(results[3]?.["5"]) || "IT";
              let flag4 = countryToAlpha2(results[4]?.["5"]) || "IT";
              let flag5 = countryToAlpha2(results[5]?.["5"]) || "IT";
              let flag6 = countryToAlpha2(results[6]?.["5"]) || "IT";
              let flag7 = countryToAlpha2(results[7]?.["5"]) || "IT";
              let flag8 = countryToAlpha2(results[8]?.["5"]) || "IT";

              let jsonDATA = {
                command: "show-trackres-view",
                title: jsonIN.name,
                wind: results[0]["4"],
                round: "RESULTS - " + round + " " + jsonIN.heats,
                website: jsonDB.website,
                logo: jsonDB.logo,

                name1:
                  (results[1]?.["3"] || "") + " " + (results[1]?.["4"] || ""),
                name2:
                  (results[2]?.["3"] || "") + " " + (results[2]?.["4"] || ""),
                name3:
                  (results[3]?.["3"] || "") + " " + (results[3]?.["4"] || ""),
                name4:
                  (results[4]?.["3"] || "") + " " + (results[4]?.["4"] || ""),
                name5:
                  (results[5]?.["3"] || "") + " " + (results[5]?.["4"] || ""),
                name6:
                  (results[6]?.["3"] || "") + " " + (results[6]?.["4"] || ""),
                name7:
                  (results[7]?.["3"] || "") + " " + (results[7]?.["4"] || ""),
                name8:
                  (results[8]?.["3"] || "") + " " + (results[8]?.["4"] || ""),

                club1: results[1]?.["5"] || "",
                club2: results[2]?.["5"] || "",
                club3: results[3]?.["5"] || "",
                club4: results[4]?.["5"] || "",
                club5: results[5]?.["5"] || "",
                club6: results[6]?.["5"] || "",
                club7: results[7]?.["5"] || "",
                club8: results[8]?.["5"] || "",

                flag1,
                flag2,
                flag3,
                flag4,
                flag5,
                flag6,
                flag7,
                flag8,

                mark1,
                mark2,
                mark3,
                mark4,
                mark5,
                mark6,
                mark7,
                mark8,

                rank1,
                rank2,
                rank3,
                rank4,
                rank5,
                rank6,
                rank7,
                rank8,
              };

              let jsonSEND = JSON.stringify(jsonDATA);
              client.send(jsonSEND);
            })
            .on("error", (err) => {
              console.error("Errore nella lettura del file:", err);
            });
        } else {
          let jsonDATA = {
            command: "errorNoFile",
          };
          let jsonSEND = JSON.stringify(jsonDATA);
          client.send(jsonSEND);
        }
      } catch (parseError) {
        console.error(parseError);
      }
    });
  } else if (jsonIN.command == "show-nostadia") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
      }
      try {
        jsonDB = JSON.parse(data);

        fetch(jsonDB.irunning + jsonIN.id, settings)
          .then((res) => res.json())
          .then((json) => {
            if (json.batterie?.[0] == undefined) {
              let jsonDATA = {
                command: "errorNostadia",
              };
              let jsonSEND = JSON.stringify(jsonDATA);
              client.send(jsonSEND);
            } else {
              let batteria = json.batterie[0];
              let schermate = json.batterie[0].risultati.length;
              let forTime = Math.floor(schermate / 8) + 1;

              

              let jsonDATA = {
                command: "show-nostadia-view",
                title: jsonIN.name,
                schermate: schermate,
                forTime: forTime,
                results: batteria.risultati,
                website: jsonDB.website,
                logo: jsonDB.logo
              };

              let jsonSEND = JSON.stringify(jsonDATA);
              client.send(jsonSEND);
            }
          });
      } catch (parseError) {
        console.error(parseError);
      }
    });
  }
});

module.exports = router;
