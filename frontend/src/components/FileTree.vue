<template>
  <div>
    <sl-vue-tree ref="tree" v-model="nodes" @nodeclick="fileSelected" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SlVueTree, { ISlTreeNode } from "sl-vue-tree";
import "sl-vue-tree/dist/sl-vue-tree-dark.css";

export default Vue.extend({
  name: "FileTree",
  components: {
    SlVueTree,
  },
  data() {
    return {
      nodes: this.files,
      activeFile: this.active,
    };
  },
  props: {
    files: {
      type: Array,
      default: (): Array<Record<string, unknown>> => [],
    },
    active: {
      type: String,
      default: "",
    },
  },
  mounted() {
    // for (let node of this.$refs.tree.getSelected() as ISlTreeNode<string>[]) {
    //   node.isSelected = false;
    // }
    if (this.active) {
      let pathList = this.active.split("/");
      let nodePath = [];
      try {
        let currNode = { children: this.files } as ISlTreeNode<string>;
        for (let node of pathList) {
          let idx = currNode.children.findIndex(
            (treeNode: ISlTreeNode<string>) => treeNode.title == node
          );
          nodePath.push(idx);
          currNode = currNode.children[idx];
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.$refs.tree.select(nodePath, true);
      } catch (err) {
        console.log(err);
      }
    }
  },
  methods: {
    addFile(): void {
      console.log("File Added");
    },
    addFolder(): void {
      console.log("Folder Added");
    },
    createNode(name: string): void {
      console.log("node created", name);
    },
    fileSelected(node: ISlTreeNode<string>) {
      let path = node.path;
      let currNode = (this.nodes as ISlTreeNode<string>[])[path[0]];
      let fileName = [currNode.title as string];
      for (let idx of path.slice(1)) {
        currNode = currNode.children[idx];
        fileName.push(currNode.title);
      }
      this.$emit("fileChange", fileName.join("/"));
    },
  },
});
</script>

<style>
.sl-vue-tree-root {
  height: 100%;
  width: 220px;
  text-align: center;
  border-radius: 0 !important;
}
</style>
