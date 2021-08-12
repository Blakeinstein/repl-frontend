import shell, { error } from 'shelljs';
import { ChildProcess } from 'child_process';
import { Clone } from 'nodegit';

interface ITemplate {
  gitTemplate: string;
  folderName: string;
  startScript: string;
  wd: string;
  initState: boolean;
  installState: boolean;
  files: string[];
}

export default class Template implements ITemplate{
  initState = false;
  installState = false;
  gitTemplate = '';
  folderName = '';
  startScript = '';
  wd = '';
  files = <string[]>[];
  output = null as unknown as ChildProcess

  constructor(wd: string) {
    this.wd = wd;
  }

  async init() {
    if (!this.gitTemplate) 
      throw new Error ("Git template missing from template");
    if (!this.wd)
      throw new Error ("Working directory was not provided");
    
    shell.cd(this.wd);
    shell.rm("-rf", this.folderName);
    await Clone.clone(this.gitTemplate, `${this.wd}/${this.folderName}`);
    this.initState = true;
  }

  async install() {
    if (!this.initState)
      throw new Error ("Template was not initialized");
    if (!this.folderName)
      throw new Error ("Template did not specify project folder name");
    shell.cd(`${this.wd}/${this.folderName}`);
    let progress = shell.exec(`yarn`);
    this.installState = true;
  }

  async start() {
    if (!this.installState)
      throw new Error ("Dependencies were not installed");
    if (!this.startScript)
      throw new Error ("Template did not specify start script name");

    shell.cd(`${this.wd}/${this.folderName}`);
    this.output = shell.exec(`yarn ${this.startScript}`, { async: true });
    return await (() => {
      return new Promise( (resolve, reject) => {
        this.output.addListener("error", (err) => {
          reject(err);
        });
        console.log(this.output.eventNames());
      })
    })();

    // let addr = output.grep("", /(https?:\/\/)?localhost:([0-9]+)/)
  }

  async cleanup () {
    if (this.output)
      this.output.kill();
    if (this.initState)
      shell.rm("-rf", `${this.wd}/${this.folderName}`);
  }
}