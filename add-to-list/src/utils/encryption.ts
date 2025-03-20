// Key generation and storage
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const storedKey = localStorage.getItem('encryptionKey');
  
  if (storedKey) {
    const keyBuffer = Buffer.from(storedKey, 'base64');
    return crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Generate a new key if none exists
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Store the key
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBase64 = Buffer.from(exportedKey).toString('base64');
  localStorage.setItem('encryptionKey', keyBase64);

  return key;
};

export const encryptPassword = async (password: string): Promise<string> => {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    new TextEncoder().encode(password)
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return Buffer.from(combined).toString('base64');
};

export const decryptPassword = async (encryptedData: string): Promise<string> => {
  const key = await getEncryptionKey();
  const data = Buffer.from(encryptedData, 'base64');
  
  // Extract IV and encrypted password
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}; 