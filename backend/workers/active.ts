import Template from "../models/templates";
import FirepadWoker from "./firepadWorker";

export interface ActiveWorker {
  id: string;
  template: string;
  templateWorker: Template;
  firepadWorker: FirepadWoker;
}

export interface ActiveWorkerState {
  working: boolean;
  worker: ActiveWorker | null;
}

export type ActiveWorkers = Record<string, ActiveWorkerState>;