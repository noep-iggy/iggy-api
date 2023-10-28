export function encrypt(text: string, password: string, type: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CryptoJS = require('crypto-js');
    const cripted = CryptoJS.AES.encrypt(text, password);
    return `${type}:crypto:${cripted.toString()}`;
  } catch (err) {
    console.error(err);
  }
}

export function decrypt(textCrypted: string, password: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const CryptoJS = require('crypto-js');
    const [type, text] = textCrypted.split(':crypto:');
    const bytes = CryptoJS.AES.decrypt(text, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8).replace(/['"]+/g, '');
    return renderType(decrypted, type);
  } catch (err) {
    console.error(err);
  }
}

export function encryptObject<T>(object: T) {
  try {
    const encryptedObject: any = {};
    const password = process.env.CRYPTO_SECRET;
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        const jsonString = JSON.stringify(value);
        const encryptedValue = encrypt(jsonString, password, typeof value);
        encryptedObject[key] = encryptedValue;
      }
    }
    return encryptedObject as T;
  } catch (err) {
    console.error(err);
    return object;
  }
}

export function decryptObject<T>(object: T): T {
  if (!object) return null;
  try {
    const encryptedObject: any = {};
    const password = process.env.CRYPTO_SECRET;
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        if (value?.toString().includes(':crypto:'))
          encryptedObject[key] = decrypt(value.toString(), password);
        else encryptedObject[key] = value;
      }
    }
    return encryptedObject as T;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderType(value: string, type: string) {
  switch (type) {
    case 'string':
      return value as string;
    case 'number':
      return Number(value);
    case 'object':
      return new Date(value);
    case 'boolean':
      return value;
  }
}
