"use client";

import { useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ReportUserModal({
  reportedUserId,
  reporterId,
  onClose,
  onReported,
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    if (!reportedUserId || !reporterId) {
      toast.error("Invalid report request");
      return;
    }

    try {
      setSubmitting(true);

      // 🔒 One-report-per-user rule
      const reportId = `${reportedUserId}_${reporterId}`;
      const reportRef = doc(db, "reports", reportId);

      const existingReport = await getDoc(reportRef);
      if (existingReport.exists()) {
        toast.error("You already reported this user");
        return;
      }

      // 📝 Create report
      await setDoc(reportRef, {
        reportedUserId,
        reportedBy: reporterId,
        reason,
        createdAt: serverTimestamp(),
      });

    
      toast.success("Report submitted");

      // 🔁 Inform parent if needed
      if (onReported) onReported();

      // ❌ Close modal
      onClose();
    } catch (err) {
      console.error("Report submit error:", err);
      toast.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-[#0f172a] p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Report User
        </h3>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded bg-black border border-gray-700 text-white"
        >
          <option value="">Select reason</option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="fake_account">Fake account</option>
          <option value="hate_speech">Hate speech</option>
          <option value="other">Other</option>
        </select>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 underline"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-red-600 px-4 py-2 text-sm rounded text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}