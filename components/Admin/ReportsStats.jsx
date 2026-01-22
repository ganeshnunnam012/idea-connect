"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReportsStats() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    bannedUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const reportsRef = collection(db, "reports");
    const usersRef = collection(db, "users");

    let reportsCache = [];
    let usersCache = [];

    const updateStats = () => {
      const totalReports = reportsCache.length;
      const pendingReports = reportsCache.filter(r => !r.reviewed).length;
      const bannedUsers = usersCache.filter(u => u.isBanned).length;
      const activeUsers = usersCache.length - bannedUsers;

      setStats({
        totalReports,
        pendingReports,
        bannedUsers,
        activeUsers,
      });
    };

    const unsubReports = onSnapshot(reportsRef, (snap) => {
      reportsCache = snap.docs.map(d => d.data());
      updateStats();
    });

    const unsubUsers = onSnapshot(usersRef, (snap) => {
      usersCache = snap.docs.map(d => d.data());
      updateStats();
    });

    return () => {
      unsubReports();
      unsubUsers();
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat title="Total Reports" value={stats.totalReports} />
      <Stat title="Pending Reports" value={stats.pendingReports} />
      <Stat title="Banned Users" value={stats.bannedUsers} />
      <Stat title="Active Users" value={stats.activeUsers} />
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded p-4 shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}