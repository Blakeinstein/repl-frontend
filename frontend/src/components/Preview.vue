<template>
  <div class="preview">
    <span>PREVIEW</span>
  </div>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  name: "Preview",
});
</script>

<style>
.preview {
  height: 100%;
  width: 100%;
  color: #2c3e5040;
  background: #e5e6eb;
  font-size: 4em;
  font-style: italic;
  display: grid;
  place-items: center;
}
</style>
