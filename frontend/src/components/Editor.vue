/* eslint-disable @typescript-eslint/no-this-alias */
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
  MonacoAdapter,
  Firepad,
  FirebaseAdapter,
  IFirepad,
  IFirepadConstructorOptions,
  
} from "@hackerrank/firepad";
import firebase from "firebase/app";
import "firebase/database";
import MonacoEditor from "vue-monaco";
import * as monaco from "monaco-editor";
import constants from "../../../constants";

function hueToRgb(degree, percentage1, percentage2) {
  if (degree < 0) {
    degree += 1;
    }
    if (degree > 1) {
        degree -= 1;
    }
    if (6 * degree < 1) {
        return percentage1 + (percentage2 - percentage1) * 6 * degree;
    }
    if (2 * degree < 1) {
        return percentage2;
    }
    if (3 * degree < 2) {
        return percentage1 + (percentage2 - percentage1) * 6 * (2 / 3 - degree);
    }
    return percentage1;
}

function rgbToHex(red, blue, green) {
    const depth = [red, blue, green].map((color) => Math.round(255 * color)
        .toString(16)
        .padStart(2, "0"));
    return ["#", ...depth].join("");
}

function hslToHex(hue, saturation, lightness) {
    if (saturation === 0) {
        return rgbToHex(lightness, lightness, lightness);
    }
    const percentage2 = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - saturation * lightness;
    const percentage1 = 2 * lightness - percentage2;
    return rgbToHex(hueToRgb(hue + 1 / 3, percentage1, percentage2), hueToRgb(hue, percentage1, percentage2), hueToRgb(hue - 1 / 3, percentage1, percentage2));
}

function colorFromUserId(userId) {
    let a = 1;
    for (let i = 0; i < userId.length; i++) {
        a = (17 * (a + userId.charCodeAt(i))) % 360;
    }
    const hue = a / 360;
    return hslToHex(hue, 1, 0.75);
}

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
    main: {
      type: String,
      default: "index.ts",
    },
  },
  data() {
    return {
      code: "",
      firebaseApp: null as unknown as firebase.app.App,
      firepadRef: null as unknown as firebase.database.Reference,
      firepad: null as unknown as IFirepad,
      editor: null as unknown as monaco.editor.IStandaloneCodeEditor,
      files: [
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
      ],
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
    let firebaseApp = firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(config);
    this.firebaseApp = firebaseApp;
    let firepadRef = firebaseApp.database().ref().child(this.roomId);
    this.firepadRef = firepadRef;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let that = this;
    firepadRef.child("filetree").on("value", (snapshot) => {
      if (snapshot.val()) {
        this.$emit("gotfiletree");
        that.files = JSON.parse(snapshot.val());
      }
    });
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
      this.constructFirePad(
        editor,
        this.firepadRef.child(this.main.replace(/[.]/g, "@"))
      );
    },
    changeFile(file: string) {
      this.firepad.dispose();
      this.constructFirePad(
        this.editor,
        this.firepadRef.child(file.replace(/[.]/g, "@"))
      );
    },
    constructFirePad(
      editor: monaco.editor.IStandaloneCodeEditor,
      fpref: firebase.database.Reference
    ) {
      const userId = this.firepadUser.userId;
      const userColor = colorFromUserId(userId.toString());
      const userName = this.firepadUser.userName;
      const databaseAdapter = new FirebaseAdapter(
        fpref,
        userId,
        userColor,
        userName
      );
      const editorAdapter = new MonacoAdapter(editor, false);
      this.firepad = new Firepad(
        databaseAdapter,
        editorAdapter,
        this.firepadUser
      );
    }
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
