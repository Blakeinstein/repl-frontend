import Template from "./templates";

export default class VanillaTemplate extends Template {
  gitTemplate = "https://github.com/bpk68/parcel-template";
  startScript = "start";
  folderName = "vanilla-template";
  files = [
    'src/index.js',
    'src/app.scss',
    'index.html'
  ];
  glob = false;
}