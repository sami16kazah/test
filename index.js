import app from './app.js';
import mongoose from 'mongoose';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');
import SocketServer from './socket.js';
import openpgp from 'openpgp';
mongoose
  .connect(process.env.MONGODB_URI)
  .then(console.log('connected to mongo'));
/*const server = https.createServer({ key: privateKey, cert: certificate }, app);
server.listen(process.env.PORT, () => {
  console.log(`server is running at port ${process.env.PORT}`);
});*/

let server;
server = app.listen(process.env.PORT, () => {
  console.log(`server is running at port ${process.env.PORT}`);
});

let keys = { publicKey: '', privateKey: '', clientPublicKey: '' };

const generateKeyPair = async (keys) => {
  const { publicKey, privateKey } = await openpgp.generateKey({
    curve: 'ed25519',
    userIDs: [
      {
        id: 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC1kdEPIW+MCRgO',
      },
    ],
    passphrase:
      'ZRquaXCjT4ibThjNtz9gh/03fyxoBrIWOSNAc7dWh+uCepWBkZJvtrwiXtEj2EhR',
  });
  //console.table({ publicKey, privateKey });
  keys.publicKey = publicKey;
  keys.privateKey = privateKey;
};
generateKeyPair(keys);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000/',
  },
});
io.on('connection', (socket) => {
  console.log('socket io connected successfully');

  SocketServer(socket, io, keys);
});
