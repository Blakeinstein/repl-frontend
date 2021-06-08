const fastify = require("fastify")({ logger: true });
fastify.register(require('fastify-cors'), { 
  origin: "*",
})
fastify.register(require('fastify-websocket'), {
  errorHandler: function (error, conn /* SocketStream */, req /* FastifyRequest */, reply /* FastifyReply */) {
    console.log(error);
    conn.destroy(error);
  },
  options: {
    maxPayload: 1048576,
  }
})

const fs = require("fs");
const shell = require('shelljs');
var pty = require('node-pty');
var os = require('os');

const SHELL = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const PWD = shell.pwd();

const tty = {
  _shell: new Map(),
  _sockets: new Map(),
  new(id, pwd) {
    let rootPath = `programs/${id}`
    shell.mkdir('-p', rootPath);
    this._shell[id] = pty.spawn(SHELL, [], {
      name: 'xterm-color',
      cols: 100,
      rows: 100,
      cwd: rootPath
    });
    this._shell[id].write('clear\r\n');
    
    this._shell[id].on('data', data => {
      this._sockets[id].send(data);
    })
  },
  shell(id, pwd) {
    if (this._shell.has(id))
      return this._shell[id];
    this.new(id, pwd ?? shell.pwd().toString());
    return this._shell[id]
  },
  conn(id, conn) {
    this._sockets[id] = conn;
  },
}

// Declare a route
fastify.post("/code/:lang/:id", async (request, reply) => {
  try {
    let fileName;
    let fileExt;
    let lang;
    let id = request.params.id
    if (request.params.lang == 'python'){
      fileName = 'main';
      fileExt = 'py';
      lang = 'python';
    }
    let cmd = tty.shell(id);
    await fs.writeFileSync(`programs/${id}/${fileName}.${fileExt}`, request.body.code);
    cmd.write(`run-project -l ${lang}\r`);
    return reply.code(200);
  } catch (err) {
    console.log(err);
    return reply.code(500).send(JSON.stringify(err));
  }
});

fastify.get('/output/:id', { websocket: true }, (conn, req) => {
  tty.conn(req.params.id, conn.socket);
  conn.socket.on('message', message => {
    tty.shell(req.params.id).write(message);
  });
})

fastify.get('/', (req, res) => res.code(200).send({data: "Hello world!"}));

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3030, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
