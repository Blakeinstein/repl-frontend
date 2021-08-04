<template>
  <splitpanes style="height: 100vh">
    <pane min-size="30">
      <editor :roomId="roomId" />
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
