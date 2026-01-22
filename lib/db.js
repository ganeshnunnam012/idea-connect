// lib/db.js
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

/* ---------------- CREATE IDEA ---------------- */
export const createIdea = async (data) => {
  return await addDoc(collection(db, 'ideas'), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

/* ---------------- GET ALL IDEAS ---------------- */
export const getIdeas = async () => {
  const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ---------------- GET IDEA BY ID ---------------- */
export const getIdeaById = async (id) => {
  const ref = doc(db, 'ideas', id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/* ---------------- UPDATE USER PROFILE ---------------- */
export const updateUserProfile = async (uid, data) => {
  if (!uid) return;
  await updateDoc(doc(db, 'users', uid), data);
};

export async function updateIdea(id, data) {
  const ideaRef = doc(db, "ideas", id);
  await updateDoc(ideaRef, data);
}

// delete idea
export async function deleteIdea(id) {
  const ideaRef = doc(db, "ideas", id);
  await deleteDoc(ideaRef);
}

/**
 * Save an idea for a user
 */
export async function saveIdea(userId, ideaId) {
  if (!userId || !ideaId) return;

  const userRef = doc(db, "users", userId);

  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // Create user doc if not exists
    await setDoc(userRef, {
      savedIdeas: [ideaId],
    });
  } else {
    await updateDoc(userRef, {
      savedIdeas: arrayUnion(ideaId),
    });
  }
}

/**
 * Remove saved idea
 */
export async function unsaveIdea(userId, ideaId) {
  if (!userId || !ideaId) return;

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    savedIdeas: arrayRemove(ideaId),
  });
}

/**
 * Get all saved idea IDs of a user
 */
export async function getSavedIdeaIds(userId) {
  if (!userId) return [];

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return [];

  return snap.data().savedIdeas || [];
}