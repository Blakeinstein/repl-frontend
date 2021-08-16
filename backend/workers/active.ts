import Template from "../models/templates";
import { Worker } from "worker_threads";

export interface ActiveWorker {
  id: string;
  template: string;
  worker: Worker;
}

export type ActiveWorkers = Record<string, ActiveWorker>;