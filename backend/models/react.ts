import Template from "./templates";

export default class ReactTemplate extends Template {
  constructor(wd: string) {
    super(wd);
    this.gitTemplate = "https://github.com/Blakeinstein/codeserver-react-template";
    this.startScript = "dev";
    this.folderName = "codeserver-react-template";
    this.files = [
      'src/*',
      'index.html'
    ];
  }
}