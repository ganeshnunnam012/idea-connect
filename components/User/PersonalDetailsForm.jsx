'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function PersonalDetailsForm({
  userData,
  onSaved,
  onClose,
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: userData?.phone || '',
    email: userData?.email || '',
    linkedin: userData?.linkedin || '',
    website: userData?.website || '',
    location: userData?.location || '',
    role: userData?.role || '',
    preferredContact: userData?.preferredContact || 'email',
  });

  /* ---------------- VALIDATION ---------------- */
  const isValidPhone =
    !form.phone || /^[0-9]{10,15}$/.test(form.phone);

  const isValidEmail =
    !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const isValidURL = (url) =>
    !url || url.startsWith('http://') || url.startsWith('https://');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ---------------- SAVE ---------------- */
  const normalizeURL = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const handleSave = async () => {
  if (!isValidPhone) {
    toast.error('Invalid phone number');
    return;
  }

  if (!isValidEmail) {
    toast.error('Invalid email address');
    return;
  }

  // Normalize URLs
  const normalizedLinkedIn = normalizeURL(form.linkedin);
  const normalizedWebsite = normalizeURL(form.website);

  // Validate only if value exists
  if (
    (normalizedLinkedIn && !isValidURL(normalizedLinkedIn)) ||
    (normalizedWebsite && !isValidURL(normalizedWebsite))
  ) {
    toast.error('Links must be valid URLs');
    return;
  }

  try {
    setSaving(true);

    await updateDoc(doc(db, 'users', userData.uid), {
      phone: form.phone || null,
      email: form.email || null,
      linkedin: normalizedLinkedIn || null,
      website: normalizedWebsite || null,
      location: form.location || null,
      role: form.role || null,
      preferredContact: form.preferredContact,
    });

    toast.success('Contact details saved');
    onSaved({
      ...form,
      linkedin: normalizedLinkedIn,
      website: normalizedWebsite,
    });
  } catch (err) {
    console.error(err);
    toast.error('Failed to save details');
  } finally {
    setSaving(false);
  }
};

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-6 max-w-md bg-blue-900/20 border border-blue-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">
        Edit Contact Details
      </h3>

      <div className="space-y-3 text-sm">
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="10–15 digits"
        />

        <Input
          label="Public Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@email.com"
        />

        <Input
          label="LinkedIn"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/username"
        />

        <Input
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
        />

        <Input
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="City, Country"
        />

        <Input
          label="Role / Title"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Developer, Student, Founder"
        />

        <div>
          <label className="block mb-1 text-gray-300">
            Preferred Contact
          </label>
          <select
            name="preferredContact"
            value={form.preferredContact}
            onChange={handleChange}
            className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <button
          onClick={onClose}
          className="text-sm underline text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1"
      />
    </div>
  );
}