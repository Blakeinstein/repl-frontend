import ReactTemplate from "../models/react";
import Template from "../models/templates";
import VanillaTemplate from "../models/vanilla";

export default class TemplateWorker {
  wd: string;
  constructor(wd: string) {
    this.wd = wd;
  }
  createTemplate(template: string): Template {
    switch(template) {
      case 'React':
        return new ReactTemplate(this.wd);
      case 'Vanilla':
      default:
        return new VanillaTemplate(this.wd);
    }
  }
}