// define libraries
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const express = require("express");
const router = express.Router();

const config = require("../database/general.json");

const filePath = path.join(__dirname, "../database/general.json");
const settings = { method: "Get" };

const ws = config.wsurl + ":" + config.wsport;

router.get("/", (req, res) => {
    res.render("sender", {});
});

const WebSocket = require("ws");
const client = new WebSocket(ws);

function loadGeneralJson() {
    const rawData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(rawData);
}

function saveGeneralJson(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function calculateBest(results) {
    let best = "";

    for (let i = 1; i <= 6; i++) {
        const value = results[String(i)];

        if (!value) continue;
        if (String(value).toUpperCase() === "X") continue;

        const numericValue = parseFloat(String(value).replace(",", "."));

        if (!isNaN(numericValue)) {
            if (best === "" || numericValue > best) {
                best = numericValue;
            }
        }
    }

    return best === "" ? "" : best.toFixed(2);
}

function hasValidResult(results) {
    for (let i = 1; i <= 6; i++) {
        const value = results[String(i)];

        if (!value) continue;
        if (String(value).toUpperCase() === "X") continue;

        const numericValue = parseFloat(String(value).replace(",", "."));

        if (!isNaN(numericValue)) {
            return true;
        }
    }

    return false;
}

function buildHorizontalLeaderboard(results) {
    return [...results]
        .map((atleta) => {
            if (!atleta.res) {
                atleta.res = {
                    "1": "",
                    "2": "",
                    "3": "",
                    "4": "",
                    "5": "",
                    "6": "",
                    "best": ""
                };
            }

            atleta.res.best = calculateBest(atleta.res);
            return atleta;
        })

        // Qui escludo dalla classifica chi non ha risultati validi
        .filter((atleta) => hasValidResult(atleta.res))

        .sort((a, b) => {
            const bestA = parseFloat(a.res.best);
            const bestB = parseFloat(b.res.best);

            // Classifica decrescente: misura più alta sopra
            if (bestB !== bestA) {
                return bestB - bestA;
            }

            // In caso di pari misura, ordine di pettorale
            return Number(a.pett) - Number(b.pett);
        })

        // Nella lb salvo solo i pettorali
        .map((atleta) => atleta.pett);
}

function resetHorizontalEvent(gara) {
    gara.live = {
        current: "",
        next: "",
        lb: []
    };

    gara.results.forEach((atleta) => {
        atleta.res = {
            "1": "",
            "2": "",
            "3": "",
            "4": "",
            "5": "",
            "6": "",
            "best": ""
        };
    });
}

function insertHorizontalResult(jsonIN) {
    const jsonDB = loadGeneralJson();

    const eventId = jsonIN.event || "L013.html";
    const pettorale = String(jsonIN.current || "");
    const result = String(jsonIN.res || "").trim().toUpperCase();

    const gara = jsonDB.events.find((event) =>
        event.id === eventId &&
        Array.isArray(event.results) &&
        event.results.length > 0
    );

    if (!gara) {
        return;
    }

    if (!gara.live) {
        gara.live = {
            current: "",
            next: "",
            lb: []
        };
    }

    if (pettorale.toLowerCase() === "reset") {
        resetHorizontalEvent(gara);
        saveGeneralJson(jsonDB);
        return;
    }

    gara.live.current = jsonIN.current ? String(jsonIN.current) : "";
    gara.live.next = jsonIN.next ? String(jsonIN.next) : "";

    if (result) {
        const atleta = gara.results.find((a) => String(a.pett) === pettorale);

        if (!atleta) {
            gara.live.lb = buildHorizontalLeaderboard(gara.results);
            saveGeneralJson(jsonDB);
            return;
        }

        if (!atleta.res) {
            atleta.res = {
                "1": "",
                "2": "",
                "3": "",
                "4": "",
                "5": "",
                "6": "",
                "best": ""
            };
        }

        let inserted = false;

        for (let i = 1; i <= 6; i++) {
            const key = String(i);

            if (!atleta.res[key]) {
                atleta.res[key] = result;
                inserted = true;
                break;
            }
        }

        if (inserted) {
            atleta.res.best = calculateBest(atleta.res);
        }
    }

    gara.live.lb = buildHorizontalLeaderboard(gara.results);

    saveGeneralJson(jsonDB);
}

client.on("message", (message) => {
    let jsonIN;

    try {
        jsonIN = JSON.parse(message);
    } catch (error) {
        return;
    }

    if (jsonIN.command === "send-hz") {
        insertHorizontalResult(jsonIN);
    }
});

module.exports = router;