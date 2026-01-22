'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from "react-hot-toast";

import IdeaCard from './IdeaCard';

const IdeaList = ({
  searchQuery = '',
  ideasFromParent = [],
  user = null,
  onlyMyIdeas = false,
  allowEdit = false,
}) => {
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  /* ===============================
     STEP 1: FETCH IDEAS (SAFE)
  =============================== */
  useEffect(() => {
    if (!user || user.isBanned) return; // ⛔ STOP HERE

    // If ideas are already passed (Home/Profile), use them
    if (ideasFromParent && ideasFromParent.length > 0) {
      setIdeas(ideasFromParent);
      setFilteredIdeas(ideasFromParent);
      return;
    }

    // Otherwise fetch from Firestore
    const fetchIdeas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'ideas'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setIdeas(data);
        setFilteredIdeas(data);
      } catch (err) {
        console.error('Error fetching ideas:', err);
      }
    };

    fetchIdeas();
  }, [ideasFromParent]);

  /* ===============================
     STEP 2: FILTER ONLY MY IDEAS
  =============================== */
  useEffect(() => {
    let result = [...ideas];

    if (onlyMyIdeas && user) {
      result = result.filter(idea => idea.userId === user.uid);
    }

    setFilteredIdeas(result);
  }, [ideas, onlyMyIdeas, user]);

  /* ===============================
     STEP 3: SEARCH LOGIC (UNCHANGED)
  =============================== */
  useEffect(() => {
    if (!searchQuery) {
      setFilteredIdeas(prev => prev);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filtered = ideas.filter(idea =>
      idea.title?.toLowerCase().includes(query) ||
      idea.description?.toLowerCase().includes(query) ||
      idea.category?.toLowerCase().includes(query) ||
      idea.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    setFilteredIdeas(filtered);
  }, [searchQuery, ideas]);

  return (
    <>
      <div className="space-y-4">
        {filteredIdeas.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            user={allowEdit ? user : null}
            onEdit={allowEdit ? () => {} :
            undefined}
          />
        ))}
      </div>
    </>
  );
};

export default IdeaList;