import "./style.css";

import { edit } from "ace-builds";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import axios from "axios";

const Editor = edit("editor");
const Term = new Terminal({ cols: 30, rows: 80 });
Term.open(document.getElementById("output")!);

const api = "20.204.83.203:3030";
const id = "h3xca";

let socket: WebSocket;
const createSocket = () => {
  socket = new WebSocket(`ws://${api}/output/${id}`);
  const attachAddon = new AttachAddon(socket);
  Term.loadAddon(attachAddon);
};

createSocket();

document.getElementById("runcode")!.addEventListener("click", () => {
  axios
    .post(`http://${api}/code/python/${id}`, {
      code: Editor.getValue(),
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

const check = () => {
  requestAnimationFrame(check);
  if (!socket) createSocket();
};
