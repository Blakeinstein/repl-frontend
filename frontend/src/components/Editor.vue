<template>
  <div class="editor">
    <monaco-editor
      ref="editor"
      v-model="code"
      class="editor"
      theme="vs-dark"
      language="javascript"
      :options="options"
      @editorDidMount="initFirepad"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import {
  fromMonaco,
  IFirepad,
  IFirepadConstructorOptions,
} from "@hackerrank/firepad";
import firebase from "firebase/app";
import "firebase/database";
import MonacoEditor from "vue-monaco";
import * as monaco from "monaco-editor";
import constants from "../constants";

export default Vue.extend({
  name: "Editor",
  components: {
    MonacoEditor,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      code: "",
      firebaseApp: null as unknown as firebase.app.App,
      firepadRef: null as unknown as firebase.database.Reference,
      firepad: null as unknown as IFirepad,
    };
  },
  computed: {
    options(): monaco.editor.IEditorOptions {
      return {
        minimap: {
          enabled: false,
        },
        readOnly: false,
        automaticLayout: true,
      };
    },
    firepadUser(): Partial<IFirepadConstructorOptions> {
      let userId = Math.floor(Math.random() * 10);
      return {
        defaultText: "const test = () => { console.log('Hello World') }",
        userId,
        userName: `user-${userId}`,
      };
    },
  },
  beforeMount() {
    let config = constants.firebaseConfig;
    this.firebaseApp = firebase.initializeApp(config);
    this.firepadRef = this.firebaseApp.database().ref().child(this.roomId);
  },
  beforeDestroy() {
    try {
      this.firepad.dispose();
      (
        this.$refs.editor.getEditor() as monaco.editor.IStandaloneCodeEditor
      ).dispose();
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    initFirepad(editor: monaco.editor.IStandaloneCodeEditor) {
      editor.updateOptions(this.options);
      this.firepad = fromMonaco(this.firepadRef, editor, this.firepadUser);
    },
  },
});
</script>

<style>
.editor {
  height: 100vh;
  width: 100%;
  position: relative;
}
</style>
