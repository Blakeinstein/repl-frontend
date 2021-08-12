<template>
  <div class="editor">
    <file-tree :files="files" :active="main" @fileChange="changeFile" />
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
import FileTree from "./FileTree.vue";

import {
  fromMonaco,
  IFirepad,
  IFirepadConstructorOptions,
} from "@hackerrank/firepad";
import firebase from "firebase/app";
import "firebase/database";
import MonacoEditor from "vue-monaco";
import * as monaco from "monaco-editor";
import constants from "../../../constants";

export default Vue.extend({
  name: "Editor",
  components: {
    MonacoEditor,
    FileTree,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
    files: {
      type: Array,
      default: (): Array<Record<string, unknown>> => {
        return [
          {
            title: "src",
            isLeaf: false,
            children: [
              {
                title: "index.js",
                isLeaf: true,
              },
            ],
          },
          {
            title: "index.html",
            isLeaf: true,
          },
        ];
      },
    },
    main: {
      type: String,
      default: "index.ts",
    }
  },
  data() {
    return {
      code: "",
      firebaseApp: null as unknown as firebase.app.App,
      firepadRef: null as unknown as firebase.database.Reference,
      firepad: null as unknown as IFirepad,
      editor: null as unknown as monaco.editor.IStandaloneCodeEditor
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
      this.firepad?.dispose();
      this.editor?.dispose();
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    initFirepad(editor: monaco.editor.IStandaloneCodeEditor) {
      this.editor = editor;
      editor.updateOptions(this.options);
      this.firepad = fromMonaco(
        this.firepadRef.child(this.main.replace(/./g, "@")),
        editor,
        this.firepadUser
      );
    },
    changeFile(file: string) {
      this.firepad.dispose();
      this.firepad = fromMonaco(
        this.firepadRef.child(file.replace(/./g, "@")),
        this.editor,
        this.firepadUser
      );
    },
  },
});
</script>

<style>
.editor {
  height: 100vh;
  width: 100%;
  display: flex;
  position: relative;
}
</style>
