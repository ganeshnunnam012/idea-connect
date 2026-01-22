'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

import IdeaCard from '@/components/Idea/IdeaCard';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import PersonalDetailsView from '@/components/User/PersonalDetailsView';
import PersonalDetailsForm from '@/components/User/PersonalDetailsForm';
import ReportUserModal from '@/components/User/ReportUserModal';

import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function PublicUserProfile() {
  const { userId } = useParams();

  const { user: currentUser } = useAuth();

  const [userData, setUserData] = useState(null); // null = loading, false = not found
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!userId || typeof userId !== 'string') return;

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        /* -------- USER INFO -------- */
        const userSnap = await getDoc(doc(db, 'users', userId));

        if (!userSnap.exists()) {
          if (isMounted) setUserData(false);
          return;
        }

        if (isMounted) {
          setUserData({
            uid: userId,
            ...userSnap.data(),
          });
        }

        /* -------- USER IDEAS -------- */
        const ideasQuery = query(
          collection(db, 'ideas'),
          where('userId', '==', userId)
        );

        const ideasSnap = await getDocs(ideasQuery);

        if (isMounted) {
          setIdeas(
            ideasSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      } catch (error) {
        console.error('Public profile error:', error);
        toast.error('Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading profile...
      </p>
    );
  }

  /* ================= USER NOT FOUND ================= */
  if (userData === false) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          User profile not available
        </h2>
        <p className="text-gray-500 mt-2">
          This user does not exist or has been removed.
        </p>
      </main>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* ================= PROFILE HEADER ================= */}
      <ProfileHeader
        userData={userData}
        isOwner={currentUser?.uid === userData.uid}
        onNameClick={() =>
          setShowDetailsForm((prev) => !prev)
        }
        onReport={() => setShowReportModal(true)}
      />

      {/* ================= DETAILS VIEW / FORM ================= */}
      {showDetailsForm && userData && (
        <PersonalDetailsView
          userData={userData}
          isOwner={false}
        />
      )}

      {/* ================= USER IDEAS ================= */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Ideas by {userData.displayName || 'User'}
        </h2>

        {ideas.length === 0 ? (
          <p className="text-gray-500">
            No ideas posted yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                user={null}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= REPORT MODAL ================= */}
      {showReportModal &&
        currentUser &&
        currentUser.uid !== userData.uid &&
        !hasReported && (
          <ReportUserModal
            reportedUserId={userData.uid}
            reporterId={currentUser.uid}
            onClose={() => setShowReportModal(false)}
            onReported={() => {
              setHasReported(true);
              setShowReportModal(false);
            }}
          />
        )}
    </main>
  );
}