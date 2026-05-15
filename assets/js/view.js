const socket = new WebSocket("ws://localhost:8880");
let title;
var a = 0;
let intervalId = null; 

let hzState = {
  eventId: null,
  currentPett: null,
  loadingSlot: null
};

function getFirstEmptyHzSlot(res) {
  for (let i = 1; i <= 6; i++) {
    const value = res?.[String(i)];

    if (!value || String(value).trim() === "") {
      return i;
    }
  }

  return null;
}

function setHzCellValue(slot, value) {
  const cell = document.getElementById(`hz${slot}`);
  if (!cell) return;

  cell.innerHTML = "";

  if (String(value).toUpperCase() === "X") {
    cell.style.fontWeight = 900;
    cell.style.fontSize = "30px";
    cell.style.color = "darkred";
    cell.textContent = "X";
  } else {
    cell.style.fontSize = "20px";
    cell.style.fontWeight = 200;
    cell.style.color = "white";
    cell.textContent = value || "";
  }
}

function setHzCellLoading(slot) {
  const cell = document.getElementById(`hz${slot}`);
  if (!cell) return;

  cell.innerHTML = "";
  cell.style.fontWeight = 200;
  cell.style.color = "white";

  const img = document.createElement("img");
  img.src = "/img/loading.gif";
  img.style.width = "70px";
  img.style.display = "block";
  img.style.margin = "0 auto";
  img.style.opacity = "1";
  img.style.transition = "opacity 0.35s ease";

  cell.appendChild(img);
}

function fadeLoadingToValue(slot, value) {
  const cell = document.getElementById(`hz${slot}`);
  if (!cell) return;

  const img = cell.querySelector("img");

  if (img) {
    img.style.opacity = "0";

    setTimeout(() => {
      setHzCellValue(slot, value);
      cell.style.opacity = "0";

      requestAnimationFrame(() => {
        cell.style.transition = "opacity 0.35s ease";
        cell.style.opacity = "1";
      });
    }, 350);
  } else {
    setHzCellValue(slot, value);
  }
}

function updateHzRankAndBestFromJson(eventId, currentPett) {
  fetch("/general.json")
    .then((response) => response.json())
    .then((data) => {
      const gara = data.events.find((event) =>
        event.id === eventId &&
        event.type === "hz" &&
        Array.isArray(event.results)
      );

      if (!gara || !gara.live) return;

      const atleta = gara.results.find((a) => String(a.pett) === String(currentPett));
      if (!atleta) return;

      const lb = Array.isArray(gara.live.lb) ? gara.live.lb.map(String) : [];
      const lbIndex = lb.indexOf(String(currentPett));

      document.getElementById("hzRANK").textContent =
        lbIndex !== -1 ? String(lbIndex + 1) : "-";

      document.getElementById("hzPB").textContent =
        atleta.res?.best || "NM";
    })
    .catch((error) => {
      console.error("Errore aggiornamento classifica HZ:", error);
    });
}

socket.addEventListener("message", (message) => {
  let jsonIN = JSON.parse(message.data);

  if (jsonIN.command == "show-title-view") {
    const titleTEXT = document.getElementById("titleTEXT");
    const titleBOX = document.getElementById("box");
    title = jsonIN.name + " " + jsonIN.round;
    titleTEXT.textContent = title;
    titleBOX.classList.add("show");
  } else if (jsonIN.command == "hide-title-view") {
    const titleBOX = document.getElementById("box");
    titleBOX.classList.remove("show");
  } else if (jsonIN.command == "show-chrono-view") {
    const chronoTEXT = document.getElementById("chronoTEXT");
    const chronobox = document.getElementById("chronobox");
    chronoTEXT.textContent = "00:00.0";
    chronobox.classList.add("show");
  } else if (jsonIN.command == "hide-chrono-view") {
    const chronoTEXT = document.getElementById("chronoTEXT");
    const chronobox = document.getElementById("chronobox");

    // Resetta il cronometro e nascondi la box
    chronoTEXT.textContent = "00:00.0";
    chronobox.classList.remove("show");

    // Ferma l'intervallo se attivo
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  } else if (jsonIN.command == "start-chrono-view") {
    const chronoTEXT = document.getElementById("chronoTEXT");
    let startTime = new Date().getTime();

    // Ferma l'intervallo precedente, se presente
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    // Funzione per aggiornare il cronometro
    function updateCronometro() {
      let currentTime = new Date().getTime();
      let elapsedTime = currentTime - startTime;

      let milliseconds = Math.floor((elapsedTime / 100) % 10);
      let seconds = Math.floor((elapsedTime / 1000) % 60);
      let minutes = Math.floor((elapsedTime / 60000) % 60);

      // Formatta il tempo come "MM:SS.S"
      let formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${milliseconds}`;

      // Aggiorna il display del cronometro
      chronoTEXT.textContent = formattedTime;
    }

    // Avvia il cronometro e aggiorna ogni 100 millisecondi
    intervalId = setInterval(updateCronometro, 100);
  } else if (jsonIN.command == "show-trackres-view") {
    document.getElementById("resTitleTEXT").textContent = jsonIN.title;
    document.getElementById("resRACE").textContent = jsonIN.round;
    document.getElementById("resINFO").textContent = jsonIN.website;
    document.getElementById("resLOGO").src = "/img/logo/" + jsonIN.logo;

    document.getElementById("resNAME1").textContent = jsonIN.name1;
    document.getElementById("resNAME2").textContent = jsonIN.name2;
    document.getElementById("resNAME3").textContent = jsonIN.name3;
    document.getElementById("resNAME4").textContent = jsonIN.name4;
    document.getElementById("resNAME5").textContent = jsonIN.name5;
    document.getElementById("resNAME6").textContent = jsonIN.name6;
    document.getElementById("resNAME7").textContent = jsonIN.name7;
    document.getElementById("resNAME8").textContent = jsonIN.name8;

    document.getElementById("resCLUB1").textContent = jsonIN.club1;
    document.getElementById("resCLUB2").textContent = jsonIN.club2;
    document.getElementById("resCLUB3").textContent = jsonIN.club3;
    document.getElementById("resCLUB4").textContent = jsonIN.club4;
    document.getElementById("resCLUB5").textContent = jsonIN.club5;
    document.getElementById("resCLUB6").textContent = jsonIN.club6;
    document.getElementById("resCLUB7").textContent = jsonIN.club7;
    document.getElementById("resCLUB8").textContent = jsonIN.club8;

    document.getElementById("resRES1").textContent = jsonIN.mark1;
    document.getElementById("resRES2").textContent = jsonIN.mark2;
    document.getElementById("resRES3").textContent = jsonIN.mark3;
    document.getElementById("resRES4").textContent = jsonIN.mark4;
    document.getElementById("resRES5").textContent = jsonIN.mark5;
    document.getElementById("resRES6").textContent = jsonIN.mark6;
    document.getElementById("resRES7").textContent = jsonIN.mark7;
    document.getElementById("resRES8").textContent = jsonIN.mark8;

    document.getElementById("resRANK1").textContent = jsonIN.rank1;
    document.getElementById("resRANK2").textContent = jsonIN.rank2;
    document.getElementById("resRANK3").textContent = jsonIN.rank3;
    document.getElementById("resRANK4").textContent = jsonIN.rank4;
    document.getElementById("resRANK5").textContent = jsonIN.rank5;
    document.getElementById("resRANK6").textContent = jsonIN.rank6;
    document.getElementById("resRANK7").textContent = jsonIN.rank7;
    document.getElementById("resRANK8").textContent = jsonIN.rank8;

    document.getElementById("resFLAG1").src =
      "/img/flags/" + jsonIN.flag1 + ".png";
    document.getElementById("resFLAG2").src =
      "/img/flags/" + jsonIN.flag2 + ".png";
    document.getElementById("resFLAG3").src =
      "/img/flags/" + jsonIN.flag3 + ".png";
    document.getElementById("resFLAG4").src =
      "/img/flags/" + jsonIN.flag4 + ".png";
    document.getElementById("resFLAG5").src =
      "/img/flags/" + jsonIN.flag5 + ".png";
    document.getElementById("resFLAG6").src =
      "/img/flags/" + jsonIN.flag6 + ".png";
    document.getElementById("resFLAG7").src =
      "/img/flags/" + jsonIN.flag7 + ".png";
    document.getElementById("resFLAG8").src =
      "/img/flags/" + jsonIN.flag8 + ".png";

    document.getElementById("box").style.width = "1300px";
    document.getElementById("box").style.height = "639px";
    document.getElementById("box").style.backgroundColor = "#1e2857";
    document.getElementById("box").style.bottom = "241px";
    document.getElementById("box").style.left = "-220px";
    document.getElementById("box").style.opacity = "98";

    // Clear the initial text
    document.getElementById("titleTEXT").innerText = "";

    const totalItems = 8;

    // After the box expands, fade in the result details
    setTimeout(function () {
      // Make the results box visible
      // Assicurati che il resBOX diventi visibile
      document.getElementById("resBOX").style.opacity = 1;

      // Fade in elements inside the resBOX from top to bottom
      setTimeout(function () {
        document.getElementById("resTitleTEXT").classList.add("show");
        document.getElementById("resINFO").classList.add("show");
        document.getElementById("resRACE").classList.add("show");
        document.getElementById("resMARK").classList.add("show");
        document.getElementById("resLOGO").classList.add("show");

        // Definisci il ritardo iniziale e l'incremento per ogni elemento
        const delayIncrement = 60; // Incremento del ritardo per ogni elemento

        for (let i = 1; i <= totalItems; i++) {
          // Accesso dinamico alle proprietà del JSON
          const club = jsonIN[`club${i}`];

          // Controlla se la proprietà 'club' esiste e non è vuota
          if (club && club.trim() !== "") {
            setTimeout(function () {
              // Aggiunge la classe "show" agli elementi corrispondenti
              document.getElementById(`resDIV${i}`).classList.add("show");
              document.getElementById(`resRANK${i}`).classList.add("show");
              document.getElementById(`resFLAG${i}`).classList.add("show");
              document.getElementById(`resNAME${i}`).classList.add("show");
              document.getElementById(`resCLUB${i}`).classList.add("show");
              document.getElementById(`resRES${i}`).classList.add("show");

              document.getElementById(`resDIV${i + 1}`).classList.add("show");
            }, i * delayIncrement); // Aumenta il ritardo per ogni gruppo di elementi
          }
        }

        // Controllo per l'elemento resDIV9 separatamente, basato sulla presenza di club8
      }, 100); // Aggiungi un leggero delay per sincronizzare le animazioni

      // Reverse the animation after 4 seconds
      setTimeout(function () {
        // Start fading out the result details
        const delayIncrement = 60;

        document.getElementById("resTitleTEXT").classList.remove("show");
        document.getElementById("resRACE").classList.remove("show");
        document.getElementById("resMARK").classList.remove("show"); // Incremento del ritardo per ogni elemento

        for (let i = 1; i <= totalItems; i++) {
          // Accesso dinamico alle proprietà del JSON
          const club = jsonIN[`club${i}`];

          // Controlla se la proprietà 'club' esiste e non è vuota
          if (club && club.trim() !== "") {
            setTimeout(function () {
              // Aggiunge la classe "show" agli elementi corrispondenti
              document.getElementById(`resDIV${i}`).classList.remove("show");
              document.getElementById(`resRANK${i}`).classList.remove("show");
              document.getElementById(`resFLAG${i}`).classList.remove("show");
              document.getElementById(`resNAME${i}`).classList.remove("show");
              document.getElementById(`resCLUB${i}`).classList.remove("show");
              document.getElementById(`resRES${i}`).classList.remove("show");
              document
                .getElementById(`resDIV${i + 1}`)
                .classList.remove("show");
              document.getElementById(`resDIV`).classList.remove("show");
            }, i * delayIncrement); // Aumenta il ritardo per ogni gruppo di elementi
          }
        }

        // Hide the result box gradually
        setTimeout(function () {
          document.getElementById("resBOX").style.opacity = 0;

          // Shrink the box back to the original size and change color back
          setTimeout(function () {
            document.getElementById("box").style.width = "360px";
            document.getElementById("box").style.height = "40px";
            document.getElementById("box").style.backgroundColor = "#02979e";
            document.getElementById("box").style.bottom = "30px";
            document.getElementById("box").style.left = "-500px";
            document.getElementById("box").style.opacity = "100";

            // Change the text back to "HIGH J. FINAL"
            document.getElementById("titleTEXT").innerText = title;
          }, 300); // Timing for shrinking the box back
        }, 100); // Timing for hiding the result box
      }, 17000); // Delay before reversing the animation
    }, 300); // Timing for showing the result details
  } else if (jsonIN.command == "show-nostadia-view") {
    document.getElementById("resTitleTEXT").textContent = jsonIN.title;
    document.getElementById("resINFO").textContent = jsonIN.website;
    document.getElementById("resLOGO").src = "/img/logo/" + jsonIN.logo;
    document.getElementById("resRACE").textContent = "RESULTS";
    document.getElementById("box").style.width = "1300px";
    document.getElementById("box").style.height = "639px";
    document.getElementById("box").style.backgroundColor = "#1e2857";
    document.getElementById("box").style.bottom = "241px";
    document.getElementById("box").style.left = "-220px";
    document.getElementById("box").style.opacity = "98";

    document.getElementById("titleTEXT").innerText = "";

    setTimeout(function () {
      document.getElementById("resBOX").style.opacity = 1;

      setTimeout(function () {
        document.getElementById("resTitleTEXT").classList.add("show");
        document.getElementById("resINFO").classList.add("show");
        document.getElementById("resRACE").classList.add("show");
        document.getElementById("resMARK").classList.add("show");
        document.getElementById("resLOGO").classList.add("show");

        let a = 0; // Indice iniziale per jsonIN.results
        const forTime = jsonIN.forTime; // Numero di ripetizioni
        const duration = 6000; // Durata per mostrare gli elementi (6 secondi)
        const elementCount = 8; // Numero di elementi da mostrare
        const delayBetweenRows = 60; // Ritardo tra la visualizzazione di ciascuna riga

        function showElements() {
          for (let f = 1; f <= elementCount; f++) {
            setTimeout(() => {
              let club = jsonIN.results[a]?.[0]?.soc;

              if (club && club.trim() !== "") {
                document.getElementById(`resDIV${f}`).classList.add("show");
                document.getElementById(`resDIV${f + 1}`).classList.add("show");

                if (jsonIN.results[a][0].piazzamento == 0) {
                  document.getElementById(`resRANK${f}`).textContent = "RIT";
                } else if (jsonIN.results[a][0].piazzamento == -1) {
                  document.getElementById(`resRANK${f}`).textContent = "DNF";
                } else if (jsonIN.results[a][0].piazzamento == -2) {
                  document.getElementById(`resRANK${f}`).textContent = "DNS";
                } else if (jsonIN.results[a][0].piazzamento == -3) {
                  document.getElementById(`resRANK${f}`).textContent = "DNS";
                } else if (jsonIN.results[a][0].piazzamento == -4) {
                  document.getElementById(`resRANK${f}`).textContent = "DQ";
                } else if (jsonIN.results[a][0].piazzamento == -6) {
                  document.getElementById(`resRANK${f}`).textContent = "DQ";
                } else if (jsonIN.results[a][0].piazzamento == -22) {
                  document.getElementById(`resRANK${f}`).textContent = "DNS";
                } else {
                  document.getElementById(`resRANK${f}`).textContent =
                    jsonIN.results[a][0].piazzamento;
                }

                document.getElementById(`resRANK${f}`).classList.add("show");

                document.getElementById(`resFLAG${f}`).src =
                  "/img/flags/" + jsonIN.results[a][0].naz_sigla_short + ".png";
                document.getElementById(`resFLAG${f}`).classList.add("show");

                document.getElementById(`resNAME${f}`).textContent =
                  jsonIN.results[a][0].atleta.toUpperCase();
                document.getElementById(`resNAME${f}`).classList.add("show");

                document.getElementById(`resCLUB${f}`).textContent =
                  jsonIN.results[a][0].soc;
                document.getElementById(`resCLUB${f}`).classList.add("show");

                document.getElementById(`resRES${f}`).textContent =
                  jsonIN.results[a][0].ris;
                document.getElementById(`resRES${f}`).classList.add("show");

                a++;
              }
            }, delayBetweenRows * (f - 1));
          }
        }

        function hideElements() {
          for (let f = 1; f <= elementCount; f++) {
            setTimeout(() => {
              document.getElementById(`resDIV${f}`).classList.remove("show");
              document
                .getElementById(`resDIV${f + 1}`)
                .classList.remove("show");
              document.getElementById(`resRANK${f}`).classList.remove("show");
              document.getElementById(`resFLAG${f}`).classList.remove("show");
              document.getElementById(`resNAME${f}`).classList.remove("show");
              document.getElementById(`resCLUB${f}`).classList.remove("show");
              document.getElementById(`resRES${f}`).classList.remove("show");
            }, delayBetweenRows * (f - 1));
          }
        }

        function cycleElements(cycles) {
          let currentCycle = 0;

          function runCycle() {
            if (currentCycle < cycles) {
              showElements();
              setTimeout(() => {
                hideElements();
                currentCycle++;
                setTimeout(runCycle, 1000); // Pausa di 1 secondo tra i cicli
              }, duration);
            } else {
              setTimeout(function () {
                document.getElementById("resBOX").style.opacity = 0;

                // Shrink the box back to the original size and change color back
                setTimeout(function () {
                  document.getElementById("box").style.width = "360px";
                  document.getElementById("box").style.height = "40px";
                  document.getElementById("box").style.backgroundColor = "#02979e";
                  document.getElementById("box").style.bottom = "30px";
                  document.getElementById("box").style.left = "-500px";
                  document.getElementById("box").style.opacity = "100";

                  // Change the text back to "HIGH J. FINAL"
                  document.getElementById("titleTEXT").innerText = title;
                }, 300); // Timing for shrinking the box back
              }, 100); // Timing for hiding the result box
            }
          }

          runCycle();
        }

        cycleElements(forTime);
      }, 100);
    }, 300);
  } else if (jsonIN.command == "show-fidal-view") {
    document.getElementById("resTitleTEXT").textContent = jsonIN.title;
    document.getElementById("resINFO").textContent = jsonIN.website;
    document.getElementById("resLOGO").src = "/img/logo/" + jsonIN.logo;
  
    document.getElementById("resRACE").textContent = "STARTLIST";
    const resMarkEl = document.getElementById("resMARK");
    if (resMarkEl) resMarkEl.textContent = "SB";
  
    // Box grande
    document.getElementById("box").style.width = "1300px";
    document.getElementById("box").style.height = "639px";
    document.getElementById("box").style.backgroundColor = "#1e2857";
    document.getElementById("box").style.bottom = "241px";
    document.getElementById("box").style.left = "-220px";
    document.getElementById("box").style.opacity = "98";
  
    // Clear title principale
    document.getElementById("titleTEXT").innerText = "";
  
    setTimeout(function () {
      document.getElementById("resBOX").style.opacity = 1;
  
      setTimeout(function () {
        document.getElementById("resTitleTEXT").classList.add("show");
        document.getElementById("resINFO").classList.add("show");
        document.getElementById("resRACE").classList.add("show");
        document.getElementById("resMARK").classList.add("show");
        document.getElementById("resLOGO").classList.add("show");
  
        let idx = 0; // indice sui risultati
        const results = Array.isArray(jsonIN.results) ? jsonIN.results : [];
        const pages = Math.max(1, Math.ceil(results.length / 8));
  
        const duration = 6000;       // quanto restano visibili le righe
        const elementCount = 8;      // righe per pagina
        const delayBetweenRows = 60; // effetto cascata
  
        function showElements() {
          for (let f = 1; f <= elementCount; f++) {
            setTimeout(() => {
              const row = results[idx];
              if (!row) return;
  
              // Mostra riga (div + separatore)
              document.getElementById(`resDIV${f}`).classList.add("show");
              document.getElementById(`resDIV${f + 1}`).classList.add("show");
  
              // PETTORALE nel campo rank
              const el = document.getElementById(`resRANK${f}`);
              const pett = (row.pett ?? "").toString().trim();
              
              el.textContent = pett;
              
              // reset: togli eventuali classi di stato precedenti
              el.classList.remove("resRANK--3", "resRANK--3x");
              
              // applica regola
              if (pett.length >= 3) {
                el.classList.add("resRANK--3");   // oppure "resRANK--3x"
              }
              document.getElementById(`resRANK${f}`).classList.add("show");
  
              // Bandiera (se non la mandi, IT)
              const flag = (row.flag || "IT").toUpperCase();
              document.getElementById(`resFLAG${f}`).src =
                "/img/flags/" + flag + ".png";
              document.getElementById(`resFLAG${f}`).classList.add("show");
  
              // Nome atleta
              document.getElementById(`resNAME${f}`).textContent =
                (row.atleta || "").toUpperCase();
              document.getElementById(`resNAME${f}`).classList.add("show");
  
              // Società
              document.getElementById(`resCLUB${f}`).textContent = row.societa || "";
              document.getElementById(`resCLUB${f}`).classList.add("show");
  
              // Risultato = SB
              document.getElementById(`resRES${f}`).textContent = row.sb || "";
              document.getElementById(`resRES${f}`).classList.add("show");
  
              idx++;
            }, delayBetweenRows * (f - 1));
          }
        }
  
        function hideElements() {
          for (let f = 1; f <= elementCount; f++) {
            setTimeout(() => {
              document.getElementById(`resDIV${f}`).classList.remove("show");
              document.getElementById(`resDIV${f + 1}`).classList.remove("show");
              document.getElementById(`resRANK${f}`).classList.remove("show");
              document.getElementById(`resFLAG${f}`).classList.remove("show");
              document.getElementById(`resNAME${f}`).classList.remove("show");
              document.getElementById(`resCLUB${f}`).classList.remove("show");
              document.getElementById(`resRES${f}`).classList.remove("show");
            }, delayBetweenRows * (f - 1));
          }
        }
  
        function cycleElements(cycles) {
          let currentCycle = 0;
  
          function runCycle() {
            if (currentCycle < cycles) {
              showElements();
  
              setTimeout(() => {
                hideElements();
                currentCycle++;
                setTimeout(runCycle, 1000); // pausa tra pagine
              }, duration);
            } else {
              setTimeout(function () {
                document.getElementById("resBOX").style.opacity = 0;
  
                setTimeout(function () {
                  document.getElementById("box").style.width = "360px";
                  document.getElementById("box").style.height = "40px";
                  document.getElementById("box").style.backgroundColor = "#02979e";
                  document.getElementById("box").style.bottom = "30px";
                  document.getElementById("box").style.left = "-500px";
                  document.getElementById("box").style.opacity = "100";
  
                  document.getElementById("titleTEXT").innerText = title;
                }, 300);
              }, 100);
            }
          }
  
          runCycle();
        }
  
        cycleElements(pages);
      }, 100);
    }, 300);
  } else if (jsonIN.command == "show-bio-view") {
    const bioBOX = document.getElementById("bioBOX");
    const bioNAME = document.getElementById("bioNAME");
    const bioCLUB = document.getElementById("bioCLUB");
    const bioPETT = document.getElementById("bioPETT");
    const bioSB = document.getElementById("bioSB");
    const bioSBname = document.getElementById("bioSBname");
    
    bioSBname.textContent = "SB"
    bioSB.textContent = jsonIN.sb;
    bioNAME.textContent = jsonIN.atleta;
    bioCLUB.textContent =
  jsonIN.societa.length > 24
    ? jsonIN.societa.slice(0, 24) + "..."
    : jsonIN.societa;
    bioPETT.textContent = jsonIN.pett;
    bioBOX.classList.add("is-open");
  } else if (jsonIN.command == "hide-bio-view") {
    const bioBOX = document.getElementById("bioBOX");
    bioBOX.classList.remove("is-open");
  } else if (jsonIN.command == "show-meteo-view") {
    const bioBOX = document.getElementById("bioBOX");
    const bioNAME = document.getElementById("bioNAME");
    const bioCLUB = document.getElementById("bioCLUB");
    const bioFLAG = document.getElementById("bioFLAG");
    const bioPETT = document.getElementById("bioPETT");
    const bioSB = document.getElementById("bioSB");
    const bioSBname = document.getElementById("bioSBname");
    
    bioSBname.textContent = ""
    bioSB.textContent = ""
    bioPETT.textContent = ""
    bioNAME.textContent = jsonIN.title.toUpperCase();
    bioCLUB.textContent = jsonIN.temp + "º  |  Max: " + jsonIN.tmax + "º  |   Min: "  + jsonIN.tmin + "º  |  Vento: " + jsonIN.wind_kmh + "km/h"
    bioFLAG.src = "/img/meteo/" + jsonIN.icon + ".png";
    bioBOX.classList.add("is-open");


  }else if (jsonIN.command == "show-hz-view") {
    const eventId = jsonIN.event || jsonIN.id || "L013.html";
  
    fetch("/general.json")
      .then((response) => response.json())
      .then((data) => {
        const gara = data.events.find((event) =>
          event.id === eventId &&
          event.type === "hz" &&
          Array.isArray(event.results)
        );
  
        if (!gara) {
          console.error("Gara horizontal non trovata:", eventId);
          return;
        }
  
        if (!gara.live) {
          console.error("Campo live non presente nella gara:", eventId);
          return;
        }
  
        // QUI CAMBIA: mostro il NEXT, non il CURRENT
        const shownPett = String(gara.live.next || "");
  
        if (!shownPett) {
          console.error("Nessun atleta next impostato");
          return;
        }
  
        const atleta = gara.results.find((a) => String(a.pett) === shownPett);
  
        if (!atleta) {
          console.error("Atleta non trovato con pettorale:", shownPett);
          return;
        }
  
        hzState.eventId = eventId;
  
        // Salvo il pettorale mostrato: quando arriverà send-hz,
        // jsonIN.current dovrà corrispondere a questo pettorale
        hzState.currentPett = shownPett;
  
        hzState.loadingSlot = getFirstEmptyHzSlot(atleta.res);
  
        const lb = Array.isArray(gara.live.lb) ? gara.live.lb.map(String) : [];
        const lbIndex = lb.indexOf(shownPett);
  
        document.getElementById("hzRANK").textContent =
          lbIndex !== -1 ? String(lbIndex + 1) : "-";
  
        document.getElementById("hzNAME").textContent =
          (atleta.atleta || "").toUpperCase();
  
        document.getElementById("hzCLUB").textContent =
          atleta.societa || "";
  
        document.getElementById("hzPB").textContent =
          atleta.res?.best || "NM";

  
        for (let i = 1; i <= 6; i++) {
          const value = atleta.res?.[String(i)] || "";
  
          if (hzState.loadingSlot === i) {
            setHzCellLoading(i);
          } else {
            setHzCellValue(i, value);
          }
        }
  
        const hzBOX = document.querySelector(".hzBOX");
  
        if (hzBOX) {
          hzBOX.classList.add("show");
        }
      })
      .catch((error) => {
        console.error("Errore caricamento general.json:", error);
      });
  } else if (jsonIN.command == "send-hz") {
    const eventId = jsonIN.event || jsonIN.id || "L013.html";
    const currentPett = String(jsonIN.current || "");
    const result = String(jsonIN.res || "").trim().toUpperCase();
  
    if (
      hzState.eventId === eventId &&
      hzState.currentPett === currentPett &&
      hzState.loadingSlot &&
      result
    ) {
      fadeLoadingToValue(hzState.loadingSlot, result);
  
      hzState.loadingSlot = null;
  
      setTimeout(() => {
        updateHzRankAndBestFromJson(eventId, currentPett);
      }, 500);
    }
  } else if (jsonIN.command === "hide-hz-view") {
    const hzBOX = document.querySelector(".hzBOX");
  
    if (hzBOX) {
      hzBOX.classList.remove("show");
    }
  }
});
