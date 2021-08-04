<template>
  <code-pair roomId="abcdef" />
</template>

<script lang="ts">
import Vue from "vue";
import CodePair from "./components/CodePair.vue";

export default Vue.extend({
  name: "App",
  components: {
    CodePair,
  },
});
</script>

<style>
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
