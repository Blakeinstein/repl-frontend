<template>
  <splitpanes style="height: 100vh">
    <pane min-size="30">
      <editor v-if="loaded" :roomId="roomId" :files="files" />
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

export default Vue.extend({
  name: "CodePair",
  data() {
    return {
      loaded: false,
      files: null,
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
    let res = await fetch(`${url}/code/React/${this.roomId}`, {
      method: "GET",
    }).then((res) => res.json());
    this.files = res;
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
