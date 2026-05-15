//define libraries
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
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

function weatherCodeToIcon(code, isDay = 1) {
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if (code === 1 || code === 2) return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([80, 81, 82].includes(code)) return "rain-showers";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "unknown";
}

function fetchMeteoByItalianCity(city, settings = {}) {
  const cityRaw = String(city || "").trim();
  if (!cityRaw) return Promise.resolve(null);

  const geoUrl =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(cityRaw)}` +
    "&count=1&language=it&format=json&country=IT";

  return fetch(geoUrl, settings)
    .then((r) => {
      if (!r.ok) throw new Error(`Geocoding HTTP ${r.status}`);
      return r.json();
    })
    .then((geo) => {
      const place = geo.results && geo.results[0];
      if (!place) return null;

      const lat = place.latitude;
      const lon = place.longitude;

      const meteoUrl =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,weather_code,wind_speed_10m,is_day" +
        "&daily=temperature_2m_max,temperature_2m_min" +
        "&timezone=Europe%2FRome";

      return fetch(meteoUrl, settings)
        .then((r2) => {
          if (!r2.ok) throw new Error(`Forecast HTTP ${r2.status}`);
          return r2.json();
        })
        .then((meteo) => {
          const cur = meteo.current || {};
          const daily = meteo.daily || {};

          const code = cur.weather_code;
          const isDay = cur.is_day;

          return {
            query: cityRaw,
            citta: place.name,
            provincia: place.admin1 || place.admin2 || "",
            lat,
            lon,
            temp: cur.temperature_2m,
            tmax: (daily.temperature_2m_max && daily.temperature_2m_max[0]) ?? null,
            tmin: (daily.temperature_2m_min && daily.temperature_2m_min[0]) ?? null,
            wind_kmh: cur.wind_speed_10m,
            code,
            icon: weatherCodeToIcon(code, isDay), // nome icona
          };
        });
    });
}




function fetchFidalHtmlTableBio(url, pettIn, settings = {}) {
  const targetPett = String(pettIn).trim();

  return fetch(url, {
    ...settings,
    headers: {
      "user-agent":
        (settings.headers && settings.headers["user-agent"]) ||
        "Mozilla/5.0 (Node.js)",
      ...(settings.headers || {}),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
      return res.text();
    })
    .then((html) => {
      const $ = cheerio.load(html);
      const $table = $("table.table").first();
      if (!$table.length) return null;

      let found = null;

      $table.find("tbody tr").each((i, tr) => {
        if (found) return; // abbiamo già trovato: ignora le altre righe

        const $tr = $(tr);
        if ($tr.text().includes("Totale:")) return;

        const $tds = $tr.find("td");
        if ($tds.length < 6) return;

        const pettRow = $tds.eq(0).text().trim();
        if (pettRow !== targetPett) return;

        const $a = $tds.eq(1).find("a").first();
        const atleta = ($a.text() || $tds.eq(1).text()).trim();

        const societaSpanText = $tds.eq(4).find("span").first().text().trim();
        const societa =
          societaSpanText.length >= 6
            ? societaSpanText.slice(6).trim()
            : societaSpanText;

        const sb = $tds.eq(5).text().trim();

        found = { pett: pettRow, atleta, societa, sb };
      });

      return found; // oggetto oppure null
    });
}




function fetchFidalHtmlTable(url, settings = {}) {
  return fetch(url, {
    ...settings,
    // se vuoi essere safe con alcuni siti:
    headers: {
      "user-agent":
        (settings.headers && settings.headers["user-agent"]) ||
        "Mozilla/5.0 (Node.js)",
      ...(settings.headers || {}),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
      return res.text();
    })
    .then((html) => {
      const $ = cheerio.load(html);

      // selettore tabella: usa quello che hai (class="table ...")
      const $table = $("table.table").first();
      if (!$table.length) return [];

      const results = [];

      $table.find("tbody tr").each((i, tr) => {
        const $tr = $(tr);

        // salta riga "Totale: 35"
        if ($tr.text().includes("Totale:")) return;

        const $tds = $tr.find("td");
        if ($tds.length < 6) return;

        const pett = $tds.eq(0).text().trim();

        const $a = $tds.eq(1).find("a").first();
        const atleta = ($a.text() || $tds.eq(1).text()).trim();

        // PRIMO span di società
        const societaSpanText = $tds.eq(4).find("span").first().text().trim();

        // togli i primi 6 caratteri "BA005 " (5 + spazio)
        // (se preferisci più robusto, vedi nota sotto)
        const societa =
          societaSpanText.length >= 6 ? societaSpanText.slice(6).trim() : societaSpanText;

        const sb = $tds.eq(5).text().trim(); // può essere ""

        results.push({
          pett,
          atleta,
          societa,
          sb,
        });
      });

      return results;
    });
}

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



    //TRACK RES
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


  //NOSTADIA
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



  //SHOW FIDAL
  } else if (jsonIN.command == "show-fidal") {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) console.error(err);

    try {
      jsonDB = JSON.parse(data);

      const url = jsonDB.fidal + jsonIN.id;

      fetchFidalHtmlTable(url, settings)
        .then((results) => {
          if (!results || results.length === 0) {
            client.send(JSON.stringify({ command: "errorFidal" }));
            return;
          }

          const schermate = results.length;
          const forTime = Math.floor(schermate / 8) + 1;

          const jsonDATA = {
            command: "show-fidal-view",   // metti il command che vuoi
            title: jsonIN.name,
            schermate,
            forTime,
            results,
            website: jsonDB.website,
            logo: jsonDB.logo,
          };

          client.send(JSON.stringify(jsonDATA));
        })
        .catch((e) => {
          console.error("Errore fetch/parsing FIDAL:", e);
          client.send(JSON.stringify({ command: "errorFidal" }));
        });
    } catch (parseError) {
      console.error(parseError);
    }
  });
}  else if (jsonIN.command == "show-bio") {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) console.error(err);

    try {
      jsonDB = JSON.parse(data);

      const pettIn = jsonIN.pett
      const url = jsonDB.fidal + jsonIN.id;

      fetchFidalHtmlTableBio(url, pettIn, settings)
  .then((bio) => {
    if (!bio) {
      client.send(JSON.stringify({ command: "errorBio" }));
      return;
    }

    client.send(
      JSON.stringify({
        command: "show-bio-view",
        ...bio
      })
    );
  })
  .catch(console.error);
    } catch (parseError) {
      console.error(parseError);
    }
  });
} else if (jsonIN.command == "show-meteo") {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) console.error(err);

    try {
      jsonDB = JSON.parse(data);

      const city = jsonIN.text;

      fetchMeteoByItalianCity(city, settings)
        .then((meteo) => {
          if (!meteo) {
            client.send(JSON.stringify({ command: "errorMeteo" }));
            return;
          }

          client.send(
            JSON.stringify({
              command: "show-meteo-view",
              title: meteo.citta,
              query: meteo.query,
              temp: meteo.temp,
              tmax: meteo.tmax,
              tmin: meteo.tmin,
              wind_kmh: meteo.wind_kmh,
              icon: meteo.icon,
            })
          );
        })
        .catch((e) => {
          console.error("Errore meteo:", e);
          client.send(JSON.stringify({ command: "errorMeteo" }));
        });
    } catch (parseError) {
      console.error(parseError);
    }
  });
}
});

module.exports = router;
