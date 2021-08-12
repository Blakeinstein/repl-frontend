import ReactTemplate from "../models/react";
import Template from "../models/templates";

export default class TemplateWorker {
  wd: string;
  constructor(wd: string) {
    this.wd = wd;
  }
  createTemplate(template: string): Template {
    switch(template) {
      case 'React':
        return new ReactTemplate(this.wd);
      default:
        throw new Error("Invalid template");
    }
  }
}