const os = require('os');
import { Socket } from "socket.io";
import stripAnsi from 'strip-ansi';
const pty = require('node-pty');
const http = require('http');
const express = require('express');
const {Server: SocketServer} = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new SocketServer({
  cors: '*'
});

var shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

io.attach(server);

ptyProcess.onData((data: any) => {
  io.emit('terminal:data', stripAnsi(data));
});

io.on('connection', (socket: Socket) => {
  console.log('New connection:', socket.id);

  socket.on('terminal:write', (data) => {
    ptyProcess.write(data + '\r');
  });
});

server.listen(9000, () => {
    console.log('🐳 Docker server running on port 9000');
});