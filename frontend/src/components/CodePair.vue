<template>
  <splitpanes style="height: 100vh">
    <pane min-size="30">
      <editor v-if="loaded" :roomId="roomId" @gotfiletree="loaded = true" />
    </pane>
    <pane min-size="30">
      <preview />
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import Vue from "vue";
import { Splitpanes, Pane } from "splitpanes";
import Editor from "./Editor.vue";
import Preview from "./Preview.vue";
import client from "socket.io-client";

export default Vue.extend({
  name: "CodePair",
  data() {
    return {
      loaded: false,
      files: null,
      socket: null as unknown as ReturnType<typeof client>,
    }
  },
  components: {
    Splitpanes,
    Pane,
    Editor,
    Preview,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
  async mounted() {
    let url = process.env.BACKEND_ADDR || "http://localhost:3030";
    let socket = client(url) as ReturnType<typeof client>;

    socket.on("create-room", () => {
      console.log("hello room!");
      if (socket) {
        socket.emit("join-room", this.roomId);
      }
    });

    socket.on("first-in-room", () => {
      console.log("first!");
      if (socket) {
        socket.emit("create-worker", this.roomId, "Vanilla");
      }
    });

    this.socket = socket;
    this.loaded = true;
  },
});
</script>

<style scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: flex;
}
.main > div {
  width: 50%;
  border: 1px solid black;
  border-top: 0;
  border-bottom: 0;
}
</style>
