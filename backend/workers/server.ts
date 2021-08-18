import fastifyPkg from "fastify";
import fastifyCors from "fastify-cors";
import shell from 'shelljs';

import fastifySocket from '../fastifySocket'; 
import { ActiveWorker } from "./active";
import FirepadWoker from "./firepadWorker";
import TemplateWorker from "./templateWorker";

// shell.rm("-rf", `${shell.pwd()}/test`);
const testDir = `${shell.pwd()}/test/attempt-${Math.floor(Math.random()*101)}`;
console.log("current directory => ", testDir)
shell.mkdir("-p", testDir);

const templateWorker = new TemplateWorker(testDir.replace(/\\/g, '/'));

const fastify = fastifyPkg({ logger: true });
let activeWorkers = new Map<string, ActiveWorker>();

fastify.register(fastifyCors, { 
  origin: "*",
});

fastify.register(fastifySocket, {
  cors: {
    origin: "*"
  }
});

// Declare a route
fastify.ready(err => {
  if (err) throw err;
  fastify.io.on('connect', (socket) => {
    fastify.io.to(socket.id).emit('create-room');
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      try {
        if (!activeWorkers.get(roomId)) {
          fastify.io.to(socket.id).emit('first-in-room');
        } else {
          console.log(activeWorkers.get(roomId), "heyyyy")
          socket.broadcast.to(roomId).emit('new-user', socket.id);
        }
        fastify.io.in(roomId).emit(
          'room-user-change',
          Object.values(fastify.io.sockets.adapter.rooms.get(roomId) || {})
        );
      } catch(err) {
        console.log(err);
      }
    });
    socket.on('create-worker', async (roomId: string, templateName: string) => {
      activeWorkers.set(roomId, {
        id: roomId,
        template: templateName,
        worker: new FirepadWoker(roomId, templateWorker.createTemplate(templateName))
      });

      await activeWorkers.get(roomId).worker.template.init();
      activeWorkers.get(roomId).worker.work();
    })
    socket.on("disconnect", () => {
      socket.removeAllListeners();
    });
  })
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
