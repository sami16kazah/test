import openpgp from 'openpgp';
import AdditionalInformationModel from './models/additionalInfo.js';
const passphrase = `ZRquaXCjT4ibThjNtz9gh/03fyxoBrIWOSNAc7dWh+uCepWBkZJvtrwiXtEj2EhR`;

export default function (socket, io, keys, users, firstUser) {
  socket.emit('handshake', {
    to: 'client ',
    from: 'Server',
    server_key: keys.publicKey,
  });
  socket.on('handshake2', (user_id) => {
    console.log(user_id);
    //socket.join(user_id.user_id);
    socket.emit('join', { recived: true });
  });
  socket.on('sendkey', async (ClientPublicKey) => {
    if (ClientPublicKey.ClientPublicKey) {
      keys.ClientPublicKey = ClientPublicKey.ClientPublicKey;
      //console.log('key is ;' + ClientPublicKey.ClientPublicKey);
      const publicKey = await openpgp.readKey({
        armoredKey: ClientPublicKey.ClientPublicKey,
      });

      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({
          armoredKey: keys.privateKey,
        }),
        passphrase,
      });
      const response = 'Keys are acciptable !';
      //console.log(response);
      const responseMessage = await openpgp.createMessage({
        text: response,
      });
      //console.log(responseMessage);
      const encrypt = await openpgp.encrypt({
        message: responseMessage,
        encryptionKeys: publicKey,
      });
      //console.log(encrypt);
      socket.emit('confirm keys', { message: encrypt });
    }
  });
  socket.on('sendData', async (encrypt) => {
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: keys.privateKey,
      }),
      passphrase,
    });

    const msg = await openpgp.readMessage({
      armoredMessage: encrypt.encrypt, // parse armored message
    });
    openpgp
      .decrypt({
        message: msg,
        decryptionKeys: privateKey,
      })
      .then(async (plaintext, req, res) => {
        const formData = JSON.parse(plaintext.data);
        const addInfo = await AdditionalInformationModel.findOne({
          userId: formData.id,
        });
        if (!addInfo) {
          await AdditionalInformationModel.create({
            number: formData.number,
            phone: formData.phone,
            city: formData.city,
            userId: formData.id,
          });
          const publicKey = await openpgp.readKey({
            armoredKey: keys.ClientPublicKey,
          });
          const response = 'Info had been added sucessfully to the user ';
          const responseMessage = await openpgp.createMessage({
            text: response,
          });
          //console.log(responseMessage);
          const encrypt = await openpgp.encrypt({
            message: responseMessage,
            encryptionKeys: publicKey,
          });
          socket.emit('successMsg', { encrypt });
        }
        if (addInfo) {
          const publicKey = await openpgp.readKey({
            armoredKey: keys.ClientPublicKey,
          });
          const response = 'User info already existed !!';
          const responseMessage = await openpgp.createMessage({
            text: response,
          });
          //console.log(responseMessage);
          const encrypt = await openpgp.encrypt({
            message: responseMessage,
            encryptionKeys: publicKey,
          });
          socket.emit('dbError', { encrypt });
        }
      });
  });

  socket.on('demandData', async (encrypt) => {
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: keys.privateKey,
      }),
      passphrase,
    });
    const msg = await openpgp.readMessage({
      armoredMessage: encrypt.encrypt,
    });
    openpgp
      .decrypt({
        message: msg,
        decryptionKeys: privateKey,
      })
      .then(async (plaintext, req, res) => {
        const UserId = JSON.parse(plaintext.data);
        const addInfo = await AdditionalInformationModel.findOne({
          userId: UserId,
        });
        if (addInfo) {
          const publicKey = await openpgp.readKey({
            armoredKey: keys.ClientPublicKey,
          });
          const responseMessage = await openpgp.createMessage({
            text: JSON.stringify(addInfo),
          });
          const encrypt = await openpgp.encrypt({
            message: responseMessage,
            encryptionKeys: publicKey,
          });
          socket.emit('reciveData', { encrypt });
        }
        if (!addInfo) {
          const publicKey = await openpgp.readKey({
            armoredKey: keys.ClientPublicKey,
          });
          const response = 'No User Info found  !';
          const responseMessage = await openpgp.createMessage({
            text: response,
          });
          //console.log(responseMessage);
          const encrypt = await openpgp.encrypt({
            message: responseMessage,
            encryptionKeys: publicKey,
          });
          socket.emit('dbError', { encrypt });
        }
      });
  });
}
