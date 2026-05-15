let socket;
let ws;

document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("addButton");
  const submitButton = document.getElementById("submitButton");
  const container = document.getElementById("container");

  let divCounter = 0;

  function loadInitialData() {
    fetch("/general.json")
      .then((response) => response.json())
      .then((data) => {
        populateFields(data);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }

  function populateFields(data) {
    ws = data.wsurl + ":" + data.wsport;

    document.getElementById("name").value = data.name || "";
    document.getElementById("website").value = data.website || "";
    document.getElementById("logo").value = data.logo || "";
    document.getElementById("irunning").value = data.irunning || "";
    document.getElementById("fidal").value = data.fidal || "";
    document.getElementById("path").value = data.path || "";
    document.getElementById("webport").value = data.webport || "";
    document.getElementById("wsurl").value = data.wsurl || "";
    document.getElementById("wsport").value = data.wsport || "";

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((event) => {
        addDynamicDiv(event);
      });
    }
  }

  function addDynamicDiv(eventData = {}) {
    divCounter++;

    const newDiv = document.createElement("div");
    newDiv.classList.add("dynamic-div");
    newDiv.setAttribute("id", `div-${divCounter}`);

    /*
      Salvo l'evento originale dentro il div.
      Così, quando salvi, puoi mantenere campi extra:
      results, live, qualunque altra cosa futura.
    */
    newDiv.dataset.originalEvent = JSON.stringify(eventData);

    const nameLabel = document.createElement("label");
    nameLabel.innerText = "RACE COMPLETE NAME";

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("name", `name-${divCounter}`);
    nameInput.setAttribute("placeholder", "insert name...");
    nameInput.value = eventData.name || "";

    const shortNameLabel = document.createElement("label");
    shortNameLabel.innerText = "RACE SHORT NAME";

    const shortNameInput = document.createElement("input");
    shortNameInput.setAttribute("type", "text");
    shortNameInput.setAttribute("name", `shortname-${divCounter}`);
    shortNameInput.setAttribute("placeholder", "insert short name...");
    shortNameInput.value = eventData.short || "";

    const idLabel = document.createElement("label");
    idLabel.innerText = "ID";

    const idInput = document.createElement("input");
    idInput.setAttribute("type", "text");
    idInput.setAttribute("name", `id-${divCounter}`);
    idInput.setAttribute("placeholder", "insert ID...");
    idInput.value = eventData.id || "";

    const typeLabel = document.createElement("label");
    typeLabel.innerText = "Type";

    const typeSelect = document.createElement("select");
    typeSelect.setAttribute("name", `type-${divCounter}`);

    const optionTrack = document.createElement("option");
    optionTrack.value = "tr";
    optionTrack.text = "TRACK";

    const optionHorizontalEvent = document.createElement("option");
    optionHorizontalEvent.value = "hz";
    optionHorizontalEvent.text = "HORIZONTAL EVENT";

    const optionVerticalEvent = document.createElement("option");
    optionVerticalEvent.value = "vt";
    optionVerticalEvent.text = "VERTICAL EVENT";

    const optionNoStadiaEvent = document.createElement("option");
    optionNoStadiaEvent.value = "ns";
    optionNoStadiaEvent.text = "NOSTADIA EVENT";

    const optionFidal = document.createElement("option");
    optionFidal.value = "fi";
    optionFidal.text = "FIDAL OFFLINE";

    typeSelect.appendChild(optionTrack);
    typeSelect.appendChild(optionHorizontalEvent);
    typeSelect.appendChild(optionVerticalEvent);
    typeSelect.appendChild(optionNoStadiaEvent);
    typeSelect.appendChild(optionFidal);

    typeSelect.value = eventData.type || "track";

    /*
      Textarea results solo per horizontal events.
      Qui dentro devi incollare SOLO l'array, non "results": [...]
    */
      const resultsWrapper = document.createElement("div");
      resultsWrapper.classList.add("results-wrapper");
      
      const resultsLabel = document.createElement("label");
      resultsLabel.innerText = "RESULTS JSON";
      resultsLabel.classList.add("results-label");
      
      const resultsTextarea = document.createElement("textarea");
      resultsTextarea.setAttribute("name", `results-${divCounter}`);
      resultsTextarea.setAttribute("rows", "12");
      resultsTextarea.setAttribute("placeholder", `[{"pett":"1","atleta":"Nome Cognome","societa":"Società","sb":"","res":{"1":"","2":"","3":"","4":"","5":"","6":"","best":""}}]`);
      resultsTextarea.classList.add("results-textarea");
      
      resultsTextarea.value = JSON.stringify(eventData.results || [], null, 2);
      
      resultsWrapper.appendChild(resultsLabel);
      resultsWrapper.appendChild(resultsTextarea);

    function updateResultsVisibility() {
      if (typeSelect.value === "hz") {
        resultsWrapper.style.display = "block";
      } else {
        resultsWrapper.style.display = "none";
      }
    }

    typeSelect.addEventListener("change", updateResultsVisibility);
    updateResultsVisibility();

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "-";
    deleteButton.classList.add("delete-button");

    deleteButton.addEventListener("click", function () {
      container.removeChild(newDiv);
    });

    newDiv.appendChild(nameLabel);
    newDiv.appendChild(nameInput);

    newDiv.appendChild(shortNameLabel);
    newDiv.appendChild(shortNameInput);

    newDiv.appendChild(idLabel);
    newDiv.appendChild(idInput);

    newDiv.appendChild(typeLabel);
    newDiv.appendChild(typeSelect);

    newDiv.appendChild(resultsWrapper);

    newDiv.appendChild(deleteButton);

    container.appendChild(newDiv);
  }

  loadInitialData();

  addButton.addEventListener("click", function () {
    addDynamicDiv({});
  });

  submitButton.addEventListener("click", function () {
    const dynamicDivs = document.querySelectorAll(".dynamic-div");

    const events = [];

    for (const div of dynamicDivs) {
      const nameInput = div.querySelector("input[name^='name']");
      const shortNameInput = div.querySelector("input[name^='shortname']");
      const idInput = div.querySelector("input[name^='id']");
      const typeInput = div.querySelector("select[name^='type']");
      const resultsTextarea = div.querySelector("textarea[name^='results']");

      let originalEvent = {};

      try {
        originalEvent = JSON.parse(div.dataset.originalEvent || "{}");
      } catch (error) {
        originalEvent = {};
      }

      /*
        Parti dall'evento originale:
        così non perdi campi extra tipo live, results, ecc.
      */
      const divData = {
        ...originalEvent,
        name: nameInput.value,
        short: shortNameInput.value,
        id: idInput.value,
        type: typeInput.value,
      };

      if (typeInput.value === "hz") {
        let parsedResults = [];

        if (resultsTextarea && resultsTextarea.value.trim() !== "") {
          try {
            parsedResults = JSON.parse(resultsTextarea.value);
          } catch (error) {
            alert(`Errore nel JSON results della gara ${idInput.value}`);
            return;
          }

          if (!Array.isArray(parsedResults)) {
            alert(`Il campo results della gara ${idInput.value} deve essere un array`);
            return;
          }
        }

        divData.results = parsedResults;

        /*
          Mantieni live se esiste già.
          Se non esiste, lo crea.
        */
        divData.live = originalEvent.live || {
          current: "",
          next: "",
          lb: []
        };
      } else {
        /*
          Se NON è hz, tolgo results e live.
          Se invece vuoi mantenerli comunque anche sui non-hz,
          elimina queste due righe.
        */
        delete divData.results;
        delete divData.live;
      }

      events.push(divData);
    }

    const name = document.getElementById("name").value;
    const website = document.getElementById("website").value;
    const logo = document.getElementById("logo").value;
    const irunning = document.getElementById("irunning").value;
    const fidal = document.getElementById("fidal").value;
    const path = document.getElementById("path").value;
    const webport = document.getElementById("webport").value;
    const wsurl = document.getElementById("wsurl").value;
    const wsport = document.getElementById("wsport").value;

    const jsonData = {
      command: "settings",
      logo: logo,
      irunning: irunning,
      fidal: fidal,
      name: name,
      webport: webport,
      wsurl: wsurl,
      wsport: wsport,
      website: website,
      path: path,
      events: events,
    };

    socket = new WebSocket(ws);

    socket.onopen = function () {
      const jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);

      const success = document.getElementById("success");
      success.style.display = "block";

      setTimeout(function () {
        success.style.display = "none";
      }, 5000);
    };

    socket.onerror = function (error) {
      console.error("WebSocket error:", error);

      const weberror = document.getElementById("error");
      weberror.style.display = "block";

      setTimeout(function () {
        weberror.style.display = "none";
      }, 5000);
    };
  });
});