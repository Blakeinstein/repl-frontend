import Template from "../models/templates";
import FirepadWoker from "./firepadWorker";

export interface ActiveWorker {
  id: string;
  template: string;
  worker: FirepadWoker;
}

export type ActiveWorkers = Record<string, ActiveWorker>;