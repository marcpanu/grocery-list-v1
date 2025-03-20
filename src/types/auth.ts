import { Timestamp } from 'firebase/firestore';

export interface StoredCredential {
  id: string;
  domain: string;
  username: string;
  encryptedPassword: string;  // We'll encrypt passwords before storing
  lastUsed: Timestamp;
} 