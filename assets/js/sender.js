let socket;
let ws;
let path;

const send = document.getElementById("send");
send.addEventListener("click", function () {
    fetch("/general.json")
      .then((response) => response.json())
      .then((data) => {
        ws = data.wsurl + ":" + data.wsport;
        path = data.path;
        socket = new WebSocket(ws);

        const current = document.getElementById("current").value;
        const res = document.getElementById("res").value;
        const next = document.getElementById("next").value;
        const event = document.getElementById("event").value;

        const jsonData = {
          command: "send-hz",
          event: event,
          current: current,
          res: res,
          next: next,
        };

        socket.onopen = function () {
          let jsonSEND = JSON.stringify(jsonData);
          socket.send(jsonSEND);
          document.getElementById("current").value = next;
          document.getElementById("next").value = "";
          document.getElementById("res").value = "";
        };
        socket.onerror = function (error) {
          console.error("WebSocket error:", error);
          alert("ERROR");
        };
        
      })
      .catch((error) => {
        console.error("Error fetching options: ", error);
      });
})
