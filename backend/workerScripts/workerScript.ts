import { Worker, parentPort, workerData } from 'worker_threads';
import FirepadWoker from '../workers/firepadWorker';
import TemplateWorker from '../workers/templateWorker';

// declare module workerData {
//   var id: string;
//   var templateWorker: TemplateWorker;
//   var template: string;
// }

console.log("somebody once told me");

if (workerData.id && workerData.templateWorker && workerData.template)  {
  let template = workerData.templateWorker.createTemplate(workerData.template);
  let firepad = new FirepadWoker(workerData.id, template);
  (async () => {
    try {
      await template.init();
      // await template.install();
      firepad.work();
      // template.start();
      while(true) {
        
      }
    } catch (err) {
      console.log(err);
    }
  })()
}