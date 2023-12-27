import openpgp from 'openpgp';
import AdditionalInformationModel from './models/additionalInfo.js';
import MarksModel from './models/marks.js';

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

  socket.on('sendMarks', async (encrypt) => {
    let signature = false;
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: keys.privateKey,
      }),
      passphrase,
    });
    const publicKey = await openpgp.readKey({
      armoredKey: keys.ClientPublicKey,
    });
    const msg = await openpgp.readMessage({
      armoredMessage: encrypt.encrypt, // parse armored message
    });
    const Signedmsg = await openpgp.readMessage({
      armoredMessage: encrypt.signedMessage, // parse armored message
    });
    // console.log(encrypt.signedMessage);
    const verficationResult = await openpgp.verify({
      message: Signedmsg,
      verificationKeys: publicKey,
    });
    const { verified, keyID } = verficationResult.signatures[0];
    if (await verified) {
      signature = true;
      openpgp
        .decrypt({
          message: msg,
          decryptionKeys: privateKey,
        })
        .then(async (plaintext, req, res) => {
          const formData = JSON.parse(plaintext.data);
          const verficationResultString = JSON.stringify(
            verficationResult.data
          );
          const formDataString = JSON.stringify(formData);

          if (
            verficationResultString.replaceAll('\\', '').replaceAll('"', '') ===
            formDataString.replaceAll('"', '')
          ) {
            const addInfo = await MarksModel.findOne({
              $and: [{ userId: formData.id }, { subject: formData.subject }],
            });
            if (!addInfo) {
              await MarksModel.create({
                passPercent: formData.passPercent,
                subject: formData.subject,
                userId: formData.id,
              });
              const publicKey = await openpgp.readKey({
                armoredKey: keys.ClientPublicKey,
              });
              const response =
                formData.subject +
                ' Marks had been added sucessfully by dr and signature varified status is  ' +
                signature;
              const responseMessage = await openpgp.createMessage({
                text: response,
              });
              //console.log(responseMessage);
              const encrypt = await openpgp.encrypt({
                message: responseMessage,
                encryptionKeys: publicKey,
              });
              socket.emit('successMark', { encrypt });
            }
            if (addInfo) {
              const publicKey = await openpgp.readKey({
                armoredKey: keys.ClientPublicKey,
              });
              const response =
                'Mark info already existed  !! and signature varified status is ' +
                signature;
              const responseMessage = await openpgp.createMessage({
                text: response,
              });
              //console.log(responseMessage);
              const encrypt = await openpgp.encrypt({
                message: responseMessage,
                encryptionKeys: publicKey,
              });
              socket.emit('dbErrorAddMarks', { encrypt });
            }
          } else {
            const response =
              'Invalid msg dosenot match the signed one' + signature;
            const responseMessage = await openpgp.createMessage({
              text: response,
            });
            //console.log(responseMessage);
            const encrypt = await openpgp.encrypt({
              message: responseMessage,
              encryptionKeys: publicKey,
            });
            socket.emit('dbErrorAddMarks', { encrypt });
          }
        });
    } else if (!verified) {
      signature = false;
      socket.emit('dbErrorAddMarks', 'invalid signature');
    }
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

  socket.on('demandMarks', async (encrypt) => {
    let signature = false;
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({
        armoredKey: keys.privateKey,
      }),
      passphrase,
    });
    const publicKey = await openpgp.readKey({
      armoredKey: keys.ClientPublicKey,
    });
    const msg = await openpgp.readMessage({
      armoredMessage: encrypt.encrypt,
    });

    const Signedmsg = await openpgp.readMessage({
      armoredMessage: encrypt.signedMessage, // parse armored message
    });

    const verficationResult = await openpgp.verify({
      message: Signedmsg,
      verificationKeys: publicKey,
    });

    const { verified, keyID } = verficationResult.signatures[0];
    if (verified) {
      signature = true;
      openpgp
        .decrypt({
          message: msg,
          decryptionKeys: privateKey,
        })
        .then(async (plaintext, req, res) => {
          const UserId = JSON.parse(plaintext.data);
          if ('"' + UserId + '"' === verficationResult.data) {
            const addInfo = await MarksModel.find({
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
              socket.emit('reciveMarks', { encrypt });
            }
            if (!addInfo) {
              const publicKey = await openpgp.readKey({
                armoredKey: keys.ClientPublicKey,
              });
              const response = 'No Marks found  !';
              const responseMessage = await openpgp.createMessage({
                text: response,
              });
              //console.log(responseMessage);
              const encrypt = await openpgp.encrypt({
                message: responseMessage,
                encryptionKeys: publicKey,
              });
              socket.emit('dbErrorMarks', { encrypt });
            }
          } else {
            const responseMessage = await openpgp.createMessage({
              text: 'the msg dosent match the signed one',
            });
            const encrypt = await openpgp.encrypt({
              message: responseMessage,
              encryptionKeys: publicKey,
            });
            socket.emit('UnSignError', { encrypt });
          }
        });
    } else if (!verified) {
      signature = false;
      socket.emit('dbErrorMarks', 'invalid signature');
    }
  });
}
