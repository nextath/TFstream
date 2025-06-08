let socket;
let ws;
document.addEventListener("DOMContentLoaded", function () {
  const addButton = document.getElementById("addButton");
  const submitButton = document.getElementById("submitButton");
  const container = document.getElementById("container");

  let divCounter = 0;

  // Carica i dati dal file JSON statico
  function loadInitialData() {
    fetch("/general.json") // Assumi che il file JSON sia servito come /data.json
      .then((response) => response.json())
      .then((data) => {
        populateFields(data);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }

  // Popola i campi con i dati JSON
  function populateFields(data) {
    ws = data.wsurl + ":" + data.wsport;

    document.getElementById("name").value = data.name || "";
    document.getElementById("website").value = data.website || "";
    document.getElementById("logo").value = data.logo || "";
    document.getElementById("irunning").value = data.irunning || "";
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

  // Aggiunge un nuovo div dinamico con i dati passati
  function addDynamicDiv(eventData) {
    divCounter++; // Incrementa il contatore per identificare univocamente ogni div

    // Crea un nuovo div
    const newDiv = document.createElement("div");
    newDiv.classList.add("dynamic-div");
    newDiv.setAttribute("id", `div-${divCounter}`);

    // Crea i tre input con le rispettive label
    // Input "name"
    const nameLabel = document.createElement("label");
    nameLabel.innerText = "RACE COMPLETE NAME";
    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("name", `name-${divCounter}`);
    nameInput.setAttribute("placeholder", "insert name...");
    nameInput.value = eventData.name || "";

    // Input "short name"
    const shortNameLabel = document.createElement("label");
    shortNameLabel.innerText = "RACE SHORT NAME";
    const shortNameInput = document.createElement("input");
    shortNameInput.setAttribute("type", "text");
    shortNameInput.setAttribute("name", `shortname-${divCounter}`);
    shortNameInput.setAttribute("placeholder", "insert short name...");
    shortNameInput.value = eventData.short || "";

    // Input "id" (numerico)
    const idLabel = document.createElement("label");
    idLabel.innerText = "ID";
    const idInput = document.createElement("input");
    idInput.setAttribute("type", "text");
    idInput.setAttribute("name", `id-${divCounter}`);
    idInput.setAttribute("placeholder", "insert ID...");
    idInput.value = eventData.id || "";

    const typeLabel = document.createElement("label");
    typeLabel.innerText = "Type";
    
  
    // Crea il menu a tendina (select)
    const typeSelect = document.createElement("select");
    typeSelect.setAttribute("name", `type-${divCounter}`);

    const optionTrack = document.createElement("option");
    optionTrack.value = "track";
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

    // Aggiunge le opzioni al menù
    typeSelect.appendChild(optionTrack);
    typeSelect.appendChild(optionHorizontalEvent);
    typeSelect.appendChild(optionVerticalEvent);
    typeSelect.appendChild(optionNoStadiaEvent);

    typeSelect.value = eventData.type || "track";

    // Crea il pulsante "Delete"
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "-";
    deleteButton.classList.add("delete-button");

    // Aggiunge l'evento di eliminazione al pulsante
    deleteButton.addEventListener("click", function () {
      container.removeChild(newDiv);
    });

    // Aggiunge gli elementi al div
    newDiv.appendChild(nameLabel);
    newDiv.appendChild(nameInput);
    newDiv.appendChild(shortNameLabel);
    newDiv.appendChild(shortNameInput);
    newDiv.appendChild(idLabel);
    newDiv.appendChild(idInput);
    newDiv.appendChild(typeLabel);
    newDiv.appendChild(typeSelect);
    newDiv.appendChild(deleteButton); // Aggiunge il pulsante di eliminazione al div

    // Aggiunge il nuovo div al container
    container.appendChild(newDiv);
  }

  // Carica i dati al caricamento della pagina
  loadInitialData();

  // Aggiunge un nuovo div dinamico
  addButton.addEventListener("click", function () {
    addDynamicDiv({}); // Passa un oggetto vuoto per aggiungere un div vuoto
  });

  // Salva impostazioni (raccoglie i dati)
  submitButton.addEventListener("click", function () {
    // Raccoglie tutti i div dinamici creati
    const dynamicDivs = document.querySelectorAll(".dynamic-div");

    // Array per salvare i dati
    const events = [];

    dynamicDivs.forEach((div) => {
      const nameInput = div.querySelector("input[name^='name']");
      const shortNameInput = div.querySelector("input[name^='shortname']");
      const idInput = div.querySelector("input[name^='id']");
      const typeInput = div.querySelector("select[name^='type']");

      // Raccoglie i valori degli input
      const divData = {
        name: nameInput.value,
        short: shortNameInput.value,
        id: idInput.value,
        type: typeInput.value,
      };

      // Inserisce i dati nell'array
      events.push(divData);
    });

    const name = document.getElementById("name").value;
    const website = document.getElementById("website").value;
    const logo = document.getElementById("logo").value;
    const irunning = document.getElementById("irunning").value;
    const path = document.getElementById("path").value;
    const webport = document.getElementById("webport").value;
    const wsurl = document.getElementById("wsurl").value;
    const wsport = document.getElementById("wsport").value;

    const jsonData = {
      command: "settings",
      logo: logo,
      irunning: irunning,
      name: name,
      webport: webport,
      wsurl: wsurl,
      wsport: wsport,
      website: website,
      path: path,
      events,
    };

    // Mostra i dati nella console (puoi gestirli come preferisci)
    socket = new WebSocket(ws);

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
      let success = document.getElementById("success");
      success.style.display = "block"; // Mostra il testo
      setTimeout(function () {
        success.style.display = "none"; // Nascondi il testo dopo 5 secondi
      }, 5000);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      var weberror = document.getElementById("error");
      weberror.style.display = "block"; // Mostra il testo
      setTimeout(function () {
        weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
      }, 5000);
    };
  });
});
