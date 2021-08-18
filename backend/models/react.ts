import Template from "./templates";

export default class ReactTemplate extends Template {
  gitTemplate = "https://github.com/Blakeinstein/codeserver-react-template";
  startScript = "dev";
  folderName = "codeserver-react-template";
  files = [
    'src/*',
    'index.html'
  ];
  glob = true;
}