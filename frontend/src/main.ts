import "./style.css";

import { edit } from "ace-builds";

import axios from "axios";

const editor = edit("editor");
const output = document.getElementById("output")!;

const api = "localhost:3030";
const id = "h3xca";

let socket = new WebSocket(`ws://${api}/output/${id}`);
socket.addEventListener("open", (_) => {
  socket.send("Hello server!");
});
socket.addEventListener("message", (ev) => {
  output.innerHTML += "<p>" + ev.data + "</p>";
});

document.getElementById("runcode")!.addEventListener("click", () => {
  axios
    .post(`http://${api}/code/python/${id}`, {
      code: editor.getValue(),
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
