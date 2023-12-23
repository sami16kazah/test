import app from './app.js';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');
mongoose
  .connect(process.env.MONGODB_URI)
  .then(console.log('connected to mongo'));
/*const server = https.createServer({ key: privateKey, cert: certificate }, app);
server.listen(process.env.PORT, () => {
  console.log(`server is running at port ${process.env.PORT}`);
});*/
app.listen(process.env.PORT, () => {
  console.log(`server is running at port ${process.env.PORT}`);
});
