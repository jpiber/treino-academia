import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB89I0ZaPCfs1TxnW448RrVOgD-KYCwiuU',
  authDomain: 'treino-app-c0666.firebaseapp.com',
  projectId: 'treino-app-c0666',
  storageBucket: 'treino-app-c0666.firebasestorage.app',
  messagingSenderId: '1034106761160',
  appId: '1:1034106761160:web:9e6f739d23b2f177b81afd',
  measurementId: 'G-SNJC49G2MN',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;