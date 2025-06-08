let socket;
let ws;
let path;

document.addEventListener("DOMContentLoaded", function () {
  const selectElement = document.getElementById("titleSelect");
  const selectTrackRes = document.getElementById("trackResSelect");
  const selectNostadia = document.getElementById("nostadiaSelect");

  function populateSelect(options) {
    selectElement.innerHTML = "";
    options.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectElement.appendChild(newOption);
    });
  }

  function populateTrackSelect(options) {
    const filteredOptions = options.filter((option) => option.type === "track");

    selectTrackRes.innerHTML = "";
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectTrackRes.appendChild(newOption);
    });
  }

  function populateNostadiaSelect(options) {
    const filteredOptions = options.filter((option) => option.type === "ns");

    selectNostadia.innerHTML = "";
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectNostadia.appendChild(newOption);
    });
  }


  

  fetch("/general.json")
    .then((response) => response.json())
    .then((data) => {
      ws = data.wsurl + ":" + data.wsport;
      path = data.path
      socket = new WebSocket(ws);
      populateSelect(data.events);
      populateTrackSelect(data.events);
      populateNostadiaSelect(data.events);
    })
    .catch((error) => {
      console.error("Error fetching options: ", error);
    });

  const showTitle = document.getElementById("showTitle");
  showTitle.addEventListener("click", function () {
    const titleSelect = document.getElementById("titleSelect").value;
    const roundTitle = document.getElementById("roundTitle").value;

    socket = new WebSocket(ws);

    const jsonData = {
      command: "show-title",
      id: titleSelect,
      round: roundTitle,
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });


  const hideChrono = document.getElementById("hideChrono");
  hideChrono.addEventListener("click", function () {
    socket = new WebSocket(ws);

    const jsonData = {
      command: "hide-chrono-view",
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });

  const startChrono = document.getElementById("startChrono");
  startChrono.addEventListener("click", function () {
    socket = new WebSocket(ws);

    const jsonData = {
      command: "start-chrono-view",
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });

  const showChrono = document.getElementById("showChrono");
  showChrono.addEventListener("click", function () {
    socket = new WebSocket(ws);

    const jsonData = {
      command: "show-chrono-view",
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });


  const hideTitle = document.getElementById("hideTitle");
  hideTitle.addEventListener("click", function () {
    socket = new WebSocket(ws);

    const jsonData = {
      command: "hide-title-view",
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });
  const showTrackRes = document.getElementById("showTrackRes");
  showTrackRes.addEventListener("click", function () {
    socket = new WebSocket(ws);
    const trackRes = document.getElementById("trackResSelect");
    let trackResName = trackRes.options[trackRes.selectedIndex].text;
    const trackResRound = document.getElementById("trackResRound").value;
    const trackResHeats = document.getElementById("trackResHeats").value;

    const jsonData = {
      command: "show-trackres",
      id: trackRes.value,
      name: trackResName,
      round: trackResRound,
      heats: trackResHeats
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });

  const showNostadia = document.getElementById("showNostadia");
  showNostadia.addEventListener("click", function () {
    socket = new WebSocket(ws);
    const nostadia = document.getElementById("nostadiaSelect");
    let nostadiaRace = nostadia.options[nostadia.selectedIndex].text;

    const jsonData = {
      command: "show-nostadia",
      id: nostadia.value,
      name: nostadiaRace
    };

    socket.onopen = function () {
      let jsonSEND = JSON.stringify(jsonData);
      socket.send(jsonSEND);
    };
    socket.onerror = function (error) {
      console.error("WebSocket error:", error);
      alert("ERROR");
    };
  });
});

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function() {
    socket.addEventListener("message", (message) => {
      let jsonIN = JSON.parse(message.data); 
      if(jsonIN.command == "errorNoFile") {
        let weberror = document.getElementById("error");
        weberror.style.display = "block"; // Mostra il testo
        setTimeout(function () {
          weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
        }, 5000);
      }
      if(jsonIN.command == "errorNostadia") {
        let weberror = document.getElementById("errorNostadia");
        weberror.style.display = "block"; // Mostra il testo
        setTimeout(function () {
          weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
        }, 5000);
      }
    })
  }, 1000)
})