import fastifyPkg from "fastify";
import fastifyCors from "fastify-cors";
import shell from 'shelljs';
import { ActiveWorkers } from "./active";
import FirepadWoker from "./firepadWorker";

import TemplateWorker from "./templateWorker";

shell.rm("-rf", `${shell.pwd()}/test`);
const testDir = `${shell.pwd()}/test/attempt-${Math.floor(Math.random()*101)}`;
shell.mkdir("-p", testDir);

const templateWorker = new TemplateWorker(testDir);

const fastify = fastifyPkg({ logger: true });
let activeWorkers = <ActiveWorkers>{};

fastify.register(fastifyCors, { 
  origin: "*",
});

interface codeParams {
  id: string;
  template: string;
}
// Declare a route
fastify.get<{Params: codeParams}>("/code/:template/:id", {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', },
        template: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  let id = request.params['id'];
  if (!activeWorkers[id] || !activeWorkers[id].working) {
    activeWorkers[id] = {
      working: true,
      worker: null
    }
    let template = templateWorker.createTemplate(request.params['template']);
    let firepad = new FirepadWoker(request.params['id'], template);
    try {
      await template.init();
      // await template.install();
      firepad.work();
      // template.start();
      activeWorkers[id] = {
        working: false,
        worker: {
          id,
          template: request.params['template'],
          templateWorker: template,
          firepadWorker: firepad
        }
      };
      // let res = await template.start();
    } catch (err) {
      template.cleanup();
      console.log(err);
      return reply.code(500).send(JSON.stringify(err));
    }
  }
  try {
    let res = JSON.stringify(activeWorkers[id].worker?.firepadWorker.getFileTree())
    console.log(res)
    return reply.code(200).send(res);
  } catch(err) {
    return reply.code(500).send(JSON.stringify(err));
  }
});

// Run the server!
const App = async () => {
  try {
    await fastify.listen({ port: 3030, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

export default App;
