import firebase from "firebase/app";
import * as Firepad from "firepad";
import "firebase/database";
import * as fg from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import Template from "../models/templates";
import constants from "../../constants";

const firebaseApp = firebase.initializeApp(constants.firebaseConfig);

interface firepadHeadless {
  getText: (callback: (text: string) => void) => void;
  setText: (text: string, callback: (err?: string, committed?: boolean) => void) => void;
  dispose: () => void;
}

interface IFirepadWoker {
  template: Template;
  id: string;
  parentRef: firebase.database.Reference;
  filePaths: string[];
  firepadRefs: Record<string, firebase.database.Reference>;
  firepadInstances: Record<string, firepadHeadless>;
  firepadState: boolean;
}

export default class FirepadWoker implements IFirepadWoker{
  template: Template;
  id: string;
  parentRef: firebase.database.Reference;
  filePaths = <IFirepadWoker["filePaths"]>[];
  firepadRefs = <IFirepadWoker["firepadRefs"]>{};
  firepadInstances = <IFirepadWoker["firepadInstances"]>{};
  firepadState = false;

  constructor(id: string, template: Template) {
    this.id = id;
    this.template = template;
    this.parentRef = firebaseApp.database().ref().child(id);
    let conf = {
      cwd: join(this.template.wd, this.template.folderName).replace(/\\/g, '/')
    };
    console.log(this.template.files, conf, fg.sync(this.template.files, conf) )
    this.filePaths = fg.sync('*');
    this.parentRef.child('users').on('value', (snapshot) => {
      if (!snapshot.hasChildren()) {
        this.firepadState = false;
        this.dispose();
      }
    })
  }

  getFileTree(): Record<string, any>[] {
    console.log(this.filePaths)
    let tree = <Record<string, any>[]>[];
    let level = {tree};
    for (let path of this.filePaths) {
      let nodes = path.split(/[\/]/);
      nodes.reduce((acc, node, idx) => {
        // @ts-ignore
        if(!acc[node]) {
          // @ts-ignore
          acc[node] = {tree: []};
          // @ts-ignore
          acc.tree.push({title: node, isLeaf: idx == nodes.length - 1, children: acc[node].tree})
        }
        // @ts-ignore
        return acc[node];
      }, level)
    }

    return tree;
  }

  work(): void {
    if (this.parentRef && this.firepadState) return;
    this.firepadState = true;
    try {
      this.filePaths.forEach(path => {
        try {
          // let actualPath = this.template.wd + this.template.folderName + path;
          let actualPath = join("A:\\projects\\repl-frontend\\backend\\", path);
          
          let firepadRef = this.parentRef.child(path.replace(/./g, "@"));
          let firepadInstance = new Firepad.Headless(firepadRef) as firepadHeadless;
          let fileText = readFileSync(actualPath).toString();
          console.log(fileText)
          firepadInstance.setText(fileText, (err?: string, committed?: boolean) => {
            if (err) throw new Error(err);
          });
          firepadRef.on('value', () => {
            firepadInstance.getText(val => {
              writeFileSync(actualPath, val);
            });
          })
          this.firepadRefs[path] = firepadRef;
          this.firepadInstances[path] = firepadInstance
        } catch (err) {
          console.log(err)
        }
      })
    } catch (err) {
      console.log(err);
      this.firepadState = false;
    }
  }

  dispose() {
    for (let instance of Object.values(this.firepadInstances)) {
      instance.dispose();
    }
    for (let ref of Object.values(this.firepadRefs)) {
      ref.off();
    }
    this.firepadState = false;
  }
}