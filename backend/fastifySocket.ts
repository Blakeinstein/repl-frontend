import fp from 'fastify-plugin';
import { Server, ServerOptions } from 'socket.io'
import { FastifyPluginAsync } from 'fastify';


declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

export interface SocketOptions {
  SocketOption: Partial<ServerOptions>;
}

const socketRegisterAsync: FastifyPluginAsync<Partial<ServerOptions>> = async (fastify, options) => {
  fastify.decorate('io', new Server(fastify.server, options));
  fastify.addHook('onClose', (fastify, done) => {
    fastify.io.close();
    done();
  })
};

export default fp(socketRegisterAsync, '3.x');