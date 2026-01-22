"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ReportsStats from "@/components/Admin/ReportsStats";
import ReportsTable from "@/components/Admin/ReportsTable";
import UserReportsTable from "@/components/Admin/UserReportsTable";

export default function AdminReportsPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reports Dashboard</h1>
        <UserReportsTable />
        <ReportsStats />
        <ReportsTable />
      </div>
    </ProtectedRoute>
  );
}