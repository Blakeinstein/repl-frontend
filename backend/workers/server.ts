import fastifyPkg from "fastify";
import fastifyCors from "fastify-cors";
import shell from 'shelljs';
import { Worker } from "worker_threads";

import fastifySocket from '../fastifySocket'; 
import { ActiveWorkers } from "./active";
import TemplateWorker from "./templateWorker";

// shell.rm("-rf", `${shell.pwd()}/test`);
const testDir = `${shell.pwd()}/test/attempt-${Math.floor(Math.random()*101)}`;
shell.mkdir("-p", testDir);

const templateWorker = new TemplateWorker(testDir);

const fastify = fastifyPkg({ logger: true });
let activeWorkers = <ActiveWorkers>{};

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
        // @ts-ignore
        if (fastify.io.sockets.adapter.rooms.get(roomId).size <= 1) {
          fastify.io.to(socket.id).emit('first-in-room');
        } else {
          socket.broadcast.to(roomId).emit('new-user', socket.id);
        }
        fastify.io.in(roomId).emit(
          'room-user-change',
          // @ts-ignore
          Object.values(fastify.io.sockets.adapter.rooms.get(roomId))
        );
      } catch(err) {
        console.log(err);
      }
    });
    socket.on('create-worker', (roomId: string, template: string) => {
      activeWorkers[roomId] = {
        id: roomId,
        template,
        worker: new Worker('./workerScripts/workerScripts.js', {
          workerData: {
            template,
            templateWorker
          }
        })
      };
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
