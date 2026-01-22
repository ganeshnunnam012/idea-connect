import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { doc, getDoc } from 'firebase/firestore';
// Get all ideas
export async function getAllIdeas() {
  const snapshot = await getDocs(collection(db, "ideas"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export const getIdeaById = async (id) => {
  const docRef = doc(db, 'ideas', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
};

// Create new idea
export async function createIdea(idea) {
  await addDoc(collection(db, "ideas"), idea);
}