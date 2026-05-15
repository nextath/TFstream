let socket;
let ws;
let path;

document.addEventListener("DOMContentLoaded", function () {
  const selectElement = document.getElementById("titleSelect");
  const selectTrackRes = document.getElementById("trackResSelect");
  const selectNostadia = document.getElementById("nostadiaSelect");
  const selectFidal = document.getElementById("fidalSelect");
  const selectBio = document.getElementById("bioSelect");
  const selectHz = document.getElementById("hzSelect");

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
    const filteredOptions = options.filter((option) => option.type === "tr");

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

  function populateFidalSelect(options) {
    const filteredOptions = options.filter((option) => option.type === "fi" || option.type === "hz");

    selectFidal.innerHTML = "";
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectFidal.appendChild(newOption);
    });
  }

  function populateBioSelect(options) {
    const filteredOptions = options.filter((option) => option.type === "fi");

    selectBio.innerHTML = "";
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectBio.appendChild(newOption);
    });
  }

  function populateHzSelect(options) {
    const filteredOptions = options.filter((option) => option.type === "hz");

    selectHz.innerHTML = "";
    filteredOptions.forEach((option) => {
      const newOption = document.createElement("option");
      newOption.value = option.id;
      newOption.text = option.name;
      selectHz.appendChild(newOption);
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
      populateFidalSelect(data.events);
      populateBioSelect(data.events);
      populateHzSelect(data.events);
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

const showFidal = document.getElementById("showFidal");
showFidal.addEventListener("click", function () {
  /* PULSANTE CLICCATO #2*/ console.log("CLICK1")
  socket = new WebSocket(ws);
  const fidal = document.getElementById("fidalSelect");
  let fidalRace = fidal.options[fidal.selectedIndex].text;

  const jsonData = {
    command: "show-fidal",
    id: fidal.value,
    name: fidalRace
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    /* STAMPA IL JSON IN CONSOLE #2*/ console.log(jsonSEND)
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const showBio = document.getElementById("showBio");
showBio.addEventListener("click", function () {
  /* PULSANTE CLICCATO #2*/ console.log("CLICK1")
  socket = new WebSocket(ws);
  const bio = document.getElementById("bioSelect");
  const bioRace = bio.options[bio.selectedIndex].text;
  const bioPett = document.getElementById("bioPett").value;

  const jsonData = {
    command: "show-bio",
    id: bio.value,
    name: bioRace,
    pett: bioPett
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    /* STAMPA IL JSON IN CONSOLE #2*/ console.log(jsonSEND)
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const hideBio = document.getElementById("hideBio");
hideBio.addEventListener("click", function () {
  socket = new WebSocket(ws);

  const jsonData = {
    command: "hide-bio-view",
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    console.log("INVIATO")
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const showMeteo = document.getElementById("showMeteo");
showMeteo.addEventListener("click", function () {
  /* PULSANTE CLICCATO #2*/ console.log("CLICK1")
  socket = new WebSocket(ws);
  const meteoText = document.getElementById("meteoText").value;

  const jsonData = {
    command: "show-meteo",
    text: meteoText
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    /* STAMPA IL JSON IN CONSOLE #2*/ console.log(jsonSEND)
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const hideMeteo = document.getElementById("hideMeteo");
hideMeteo.addEventListener("click", function () {
  socket = new WebSocket(ws);

  const jsonData = {
    command: "hide-meteo-view",
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    console.log("INVIATO")
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const hzCurrentShow = document.getElementById("hzCurrentShow");
hzCurrentShow.addEventListener("click", function () {
  socket = new WebSocket(ws);

  const hzSelect = document.getElementById("hzSelect").value;

  const jsonData = {
    command: "show-hz-view",
    event: hzSelect
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    console.log("INVIATO")
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
});

const hzCurrentHide = document.getElementById("hzCurrentHide");
hzCurrentHide.addEventListener("click", function () {
  socket = new WebSocket(ws);

  const jsonData = {
    command: "hide-hz-view",
  };

  socket.onopen = function () {
    let jsonSEND = JSON.stringify(jsonData);
    socket.send(jsonSEND);
    console.log("INVIATO")
  };
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    alert("ERROR");
  };
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
      if(jsonIN.command == "errorFidal") {
        let weberror = document.getElementById("errorFidal");
        weberror.style.display = "block"; // Mostra il testo
        setTimeout(function () {
          weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
        }, 5000);
      }
      if(jsonIN.command == "errorBio") {
        let weberror = document.getElementById("errorBio");
        weberror.style.display = "block"; // Mostra il testo
        setTimeout(function () {
          weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
        }, 5000);
      }
      if(jsonIN.command == "errorMeteo") {
        let weberror = document.getElementById("errorMeteo");
        weberror.style.display = "block"; // Mostra il testo
        setTimeout(function () {
          weberror.style.display = "none"; // Nascondi il testo dopo 5 secondi
        }, 5000);
      }
    })
  }, 1000)
})