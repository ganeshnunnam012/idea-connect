"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import IdeaCard from "./IdeaCard";

const IdeaList = ({
  searchQuery = "",
  ideasFromParent = [],
  user = null,
  onlyMyIdeas = false,
  allowEdit = false,
  selectedCategory = "GENERAL",
}) => {
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ===============================
  // FETCH IDEAS (HYBRID SYSTEM)
  // ===============================
  const fetchIdeas = async () => {
    try {
      setIsFiltering(true);

      let q;

      // CATEGORY ONLY
      if (
        selectedCategory &&
        selectedCategory !== "GENERAL" &&
        !debouncedSearch
      ) {
        q = query(
          collection(db, "ideas"),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          limit(20)
        );
      }

      // SEARCH ONLY
      else if (debouncedSearch && selectedCategory === "GENERAL") {
  
        q = query(
          collection(db, "ideas"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
      }

      // CATEGORY + SEARCH
      else if (selectedCategory && debouncedSearch) {

        q = query(
          collection(db, "ideas"),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          limit(20)
        );
      }

      // NO FILTER
      else {
        q = query(
          collection(db, "ideas"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);

      setHasMore(snapshot.docs.length === 20);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIdeas(data);

      let result = data;

// 🔎 SEARCH FILTER (SAFE LOCAL FILTER)
if (debouncedSearch && debouncedSearch.trim() !== "") {
  const q = debouncedSearch.toLowerCase().trim();

  result = result.filter((idea) =>
    idea.title?.toLowerCase().includes(q) ||
    idea.description?.toLowerCase().includes(q) ||
    idea.category?.toLowerCase().includes(q) ||
    idea.tags?.some(tag =>
      tag.toLowerCase().includes(q)
    )
  );
}

      // onlyMyIdeas local filter (safe)
      if (onlyMyIdeas && user) {
        result = result.filter((idea) => idea.userId === user.uid);
      }

      setFilteredIdeas(result);
    } catch (err) {
      console.error("Error fetching ideas:", err);
    } finally {
      setIsFiltering(false);
    }
  };

  // ===============================
  // LOAD MORE (PAGINATION)
  // ===============================
  const loadMoreIdeas = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      let q;

      // CATEGORY ONLY
      if (
        selectedCategory &&
        selectedCategory !== "GENERAL" &&
        !debouncedSearch
      ) {
        q = query(
          collection(db, "ideas"),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      // SEARCH ONLY
      else if (debouncedSearch && selectedCategory === "GENERAL") {

        q = query(
          collection(db, "ideas"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      // CATEGORY + SEARCH
      else if (selectedCategory && debouncedSearch) {

        q = query(
          collection(db, "ideas"),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      // NO FILTER
      else {
        q = query(
          collection(db, "ideas"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);

      const newIdeas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newLast = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(newLast);

      setHasMore(snapshot.docs.length === 20);

      const updatedIdeas = [...ideas, ...newIdeas];
      setIdeas(updatedIdeas);

      let result = updatedIdeas;

// 🔎 SEARCH FILTER
if (debouncedSearch && debouncedSearch.trim() !== "") {
  const q = debouncedSearch.toLowerCase().trim();

  result = result.filter((idea) =>
    idea.title?.toLowerCase().includes(q) ||
    idea.description?.toLowerCase().includes(q) ||
    idea.category?.toLowerCase().includes(q) ||
    idea.tags?.some(tag =>
      tag.toLowerCase().includes(q)
    )
  );
}
      if (onlyMyIdeas && user) {
        result = result.filter((idea) => idea.userId === user.uid);
      }

      setFilteredIdeas(result);
    } catch (error) {
      console.error("Error loading more ideas:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial + dependency reload
  useEffect(() => {
    if (ideasFromParent && ideasFromParent.length > 0) {
      setIdeas(ideasFromParent);
      setFilteredIdeas(ideasFromParent);
      return;
    }

    setLastDoc(null);
    setHasMore(true);
    fetchIdeas();
  }, [selectedCategory, debouncedSearch]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        hasMore &&
        !loadingMore
      ) {
        loadMoreIdeas();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastDoc, hasMore, loadingMore]);

  return (
    <div className="space-y-4">
      {isFiltering && (
        <div className="text-center py-6 text-gray-400 animate-pulse">
          Finding ideas in {selectedCategory}...
        </div>
      )}

      {!isFiltering && filteredIdeas.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No ideas found.
        </div>
      )}

      {!isFiltering &&
        filteredIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            user={allowEdit ? user : null}
            onEdit={allowEdit ? () => {} : undefined}
          />
        ))}

      {loadingMore && (
        <div className="text-center py-6 text-gray-400 animate-pulse">
          Loading more ideas...
        </div>
      )}

      {!hasMore && filteredIdeas.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          You've reached the end.
        </div>
      )}
    </div>
  );
};

export default IdeaList;