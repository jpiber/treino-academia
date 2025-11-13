import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const sessionsCollection = collection(db, 'sessions');
const exerciseConfigsCollection = (userId) =>
  collection(db, 'userConfigs', userId, 'exerciseSettings');
const lastSessionsDoc = (userId, workoutId) =>
  doc(db, 'userConfigs', userId, 'lastSessions', workoutId);

export const saveSession = async (session) => {
  const docRef = await addDoc(sessionsCollection, session);
  return { id: docRef.id, ...session };
};

export const listSessions = async (userId) => {
  try {
    const constraints = [];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    // Se tiver userId, tenta com orderBy. Se falhar, busca sem orderBy e ordena em memória
    let snapshot;
    try {
      if (constraints.length > 0) {
        constraints.push(orderBy('completedAt', 'desc'));
        snapshot = await getDocs(query(sessionsCollection, ...constraints));
      } else {
        snapshot = await getDocs(sessionsCollection);
      }
    } catch (indexError) {
      // Se falhar por falta de índice, busca sem orderBy e ordena depois
      if (constraints.length > 0) {
        snapshot = await getDocs(query(sessionsCollection, ...constraints.slice(0, -1)));
      } else {
        snapshot = await getDocs(sessionsCollection);
      }
    }

    const sessions = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Ordenar por data se não foi possível usar orderBy no Firestore
    return sessions.sort((a, b) => {
      const dateA = new Date(a.completedAt || 0);
      const dateB = new Date(b.completedAt || 0);
      return dateB - dateA; // Descendente
    });
  } catch (error) {
    console.warn('Erro ao listar sessões:', error);
    return [];
  }
};

export const getAllExerciseConfigs = async (userId) => {
  const snapshot = await getDocs(exerciseConfigsCollection(userId));
  const configs = {};
  snapshot.forEach((docSnap) => {
    configs[docSnap.id] = docSnap.data();
  });
  return configs;
};

export const saveExerciseConfig = async (userId, exerciseId, data) => {
  if (!userId || !exerciseId) {
    return;
  }
  const ref = doc(exerciseConfigsCollection(userId), exerciseId);
  await setDoc(ref, data, { merge: true });
};

export const getExerciseConfig = async (userId, exerciseId) => {
  if (!userId || !exerciseId) {
    return null;
  }
  const ref = doc(exerciseConfigsCollection(userId), exerciseId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};
export const saveLastWorkoutSnapshot = async (userId, workoutId, data) => {
  if (!userId || !workoutId) {
    return;
  }
  const ref = lastSessionsDoc(userId, workoutId);
  await setDoc(ref, data, { merge: true });
};

export const getLastWorkoutSnapshot = async (userId, workoutId) => {
  if (!userId || !workoutId) {
    return null;
  }
  const ref = lastSessionsDoc(userId, workoutId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};

