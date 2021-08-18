import * as Firepad from "firepad";
import * as firebase from 'firebase-admin';
import * as fg from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import Template from "../models/templates";

const firebaseAdmin = firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: 'https://devtest-294022-default-rtdb.firebaseio.com/'
})
const firebaseApp = firebaseAdmin.database();

interface firepadHeadless {
  getText: (callback: (text: string) => void) => void;
  setText: (text: string, callback: (err?: string, committed?: boolean) => void) => void;
  dispose: () => void;
}

interface ITextOperation {
  fromJSON: (OP: Array<any>) => ITextOperation;
  apply:    (str: string) => string
}

interface IFirepadWoker {
  template: Template;
  id: string;
  parentRef: firebase.database.Reference;
  filePaths: string[];
  firepadRefs: Record<string, firebase.database.Reference>;
  firepadInstances: Record<string, firepadHeadless>;
  firepadState: boolean;
  fileContents: Record<string, {
    lastRevision: string
  }>;
}

interface IRevision {
  a: number, o: Array<any>, t: number
}

export default class FirepadWoker implements IFirepadWoker{
  template: Template;
  id: string;
  parentRef: firebase.database.Reference;
  filePaths = <IFirepadWoker["filePaths"]>[];
  firepadRefs = <IFirepadWoker["firepadRefs"]>{};
  firepadInstances = <IFirepadWoker["firepadInstances"]>{};
  firepadState = false;
  fileContents = <IFirepadWoker['fileContents']>{};

  constructor(id: string, template: Template) {
    this.id = id;
    this.template = template;
    this.parentRef = firebaseApp.ref().child(id);
    if (this.template.glob) {
      let conf = {
        cwd: join(this.template.wd, this.template.folderName).replace(/\\/g, '/'),
        root: join(this.template.wd, this.template.folderName).replace(/\\/g, '/')
      };
      console.log("files found", fg.sync(this.template.files, conf), this.template.files, conf)
      this.filePaths = fg.sync('*');
    } else {
      this.filePaths = this.template.files;
    }
    this.parentRef.child('users').on('value', (snapshot) => {
      if (!snapshot.hasChildren()) {
        this.firepadState = false;
        this.dispose();
      }
    })
  }

  getFileTree(): Record<string, any>[] {
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

  async work(): Promise<void> {
    if (this.parentRef && this.firepadState) return;
    this.firepadState = true;
    try {
      await Promise.all(this.filePaths.map(async path => {
        let actualPath = `${this.template.wd}/${this.template.folderName}/${path}`;
        // let actualPath = join("A:\\projects\\repl-frontend\\backend\\", path);
        let firepadRef = this.parentRef.child(path.replace(/[.]/g, "@"));
        let existingData = await firepadRef.child('history').get();
        this.fileContents[path] = {
          lastRevision: 'A0'
        }
        if (!existingData.exists()) {
          console.log("New Session");
          let firepadInstance = new Firepad.Headless(this.parentRef.child(path.replace(/[.]/g, "@"))) as firepadHeadless;
          firepadInstance.setText(readFileSync(actualPath).toString(), (err, comitted) => {
            if (err) console.log(err);
            console.log("Added new data", comitted)
          })
        }
        firepadRef.child('history').limitToLast(1).on('child_added', snapshot => {
          try {
            let revision = snapshot.val() as IRevision;
            console.log(revision.o, snapshot.key, this.fileContents[path].lastRevision)
            if (revision && snapshot.key > this.fileContents[path].lastRevision) {
              console.log(revision.o)
              let operation = (Firepad.TextOperation as ITextOperation).fromJSON(revision.o);
              console.log(revision)
              let text = operation.apply(readFileSync(actualPath).toString());
              writeFileSync(actualPath, text);
              this.fileContents[path].lastRevision = snapshot.key
            }
          } catch (err) {
            console.log(err);
          }
        })
        this.firepadRefs[path] = firepadRef;
      }))
    } catch (err) {
      console.log(err);
      this.firepadState = false;
    }
    let tree = this.getFileTree();
    this.parentRef.child('filetree').set(JSON.stringify(tree))
  }

  dispose() {
    for (let ref of Object.values(this.firepadRefs)) {
      ref.off();
    }
    this.firepadState = false;
  }
}