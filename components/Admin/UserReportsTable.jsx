"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const WARNING_THRESHOLD = 7; // change anytime

export default function UserReportsTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 🔴 REAL-TIME LISTENER ON REPORTS
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      async (reportsSnap) => {
        // 1️⃣ Fetch all users
        const usersSnap = await getDocs(collection(db, "users"));
        const usersMap = {};

        usersSnap.forEach((doc) => {
          usersMap[doc.id] = {
            id: doc.id,
            ...doc.data(),
            reportCount: 0,
          };
        });

        // 2️⃣ Count reports per user
        reportsSnap.forEach((doc) => {
          const report = doc.data();
          const reportedUserId = report.reportedUserId;

          if (usersMap[reportedUserId]) {
            usersMap[reportedUserId].reportCount += 1;
          }
        });

        // 3️⃣ Only users with reports + sort by highest first
        const result = Object.values(usersMap)
          .filter((user) => user.reportCount > 0)
          .sort((a, b) => b.reportCount - a.reportCount);

        setUsers(result);
      }
    );

    return () => unsubscribe();
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-3 text-black">
        Users With Reports
      </h2>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 text-black font-bold">
              User
            </th>
            <th className="border p-2 text-black font-bold">
              Email
            </th>
            <th className="border p-2 text-black font-bold text-center">
              Reports
            </th>
            <th className="border p-2 text-black font-bold text-center">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">
                {user.displayName || "Unknown"}
              </td>

              <td className="border p-2">
                {user.email}
              </td>

              <td className="border p-2 text-center font-bold">
                <div className="flex items-center justify-center gap-2">
                  <span>{user.reportCount}</span>

                  {user.reportCount >= WARNING_THRESHOLD &&
                    !user.isBanned && (
                      <span className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                        ⚠ Warning
                      </span>
                    )}
                </div>
              </td>

              <td className="border p-2 text-center">
                {user.isBanned ? (
                  <span className="text-red-600 font-semibold">
                    🚫 Banned
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">
                    ✅ Active
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}