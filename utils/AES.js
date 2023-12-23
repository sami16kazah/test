import CryptoJS from 'crypto-js';

export const decrypt = (str, key) => {
  var decipher = CryptoJS.AES.decrypt(str, key);
  decipher = decipher.toString(CryptoJS.enc.Utf8);
  return decipher;
};

export const compares = (HSH_1, HSH_2) => {
  const hash1 = HSH_1;
  const hash2 = decrypt(HSH_2, process.env.AES_KEY);
  const hex1 = hash1.toString().trim();
  const hex2 = hash2.toString().trim();
  const result = hex1 === hex2; // or hex1 < hex2, hex1 > hex2, etc.
  return result;
};

export const encrypt = (str, key) => {
  var ciphertext = CryptoJS.AES.encrypt(str, key).toString();
  return ciphertext;
};

export const mac = (message, secret) => {
  var newHMAC = CryptoJS.HmacSHA256(message, secret).toString();
  return newHMAC;
};
