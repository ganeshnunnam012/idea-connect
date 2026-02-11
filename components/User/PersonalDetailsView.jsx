'use client';

import { Phone, Mail, Link2, Globe, MapPin, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function PersonalDetailsView({ userData, isOwner, onEdit }) {
  const { user: currentUser } = useAuth();

  if (!userData) return null;

  const isVerifiedViewer =
  isOwner || (currentUser && currentUser.emailVerified);

if (!isVerifiedViewer) {
  return (
    <div className="mt-6 max-w-md bg-amber-50 border border-amber-400 rounded-lg p-4 text-sm text-amber-800">
      🔒 Verify your email to view contact details.
    </div>
  );
}

  const {
    phone,
    email,
    linkedin,
    website,
    location,
    role,
    preferredContact,
  } = userData;

  // If absolutely nothing exists, show nothing
  if (!phone && !email && !linkedin && !website && !location && !role) {
    return null;
  }

  return (
    <div className="mt-6 max-w-md bg-blue-900/30 border border-blue-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Contact Details</h3>

      <div className="space-y-2 text-sm">

        {/* Phone */}
        {phone && (
          <p className="flex items-center gap-2">
            <Phone size={14} />
            {phone}
          </p>
        )}

        {/* Public Email */}
        {email && (
          <p className="flex items-center gap-2">
            <Mail size={14} />
            {email}
          </p>
        )}

        {/* LinkedIn */}
        {linkedin && (
          <p className="flex items-center gap-2">
            <Link2 size={14} />
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              LinkedIn
            </a>
          </p>
        )}

        {/* Website */}
        {website && (
          <p className="flex items-center gap-2">
            <Globe size={14} />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Website
            </a>
          </p>
        )}

        {/* Location */}
        {location && (
          <p className="flex items-center gap-2">
            <MapPin size={14} />
            {location}
          </p>
        )}

        {/* Role / Title */}
        {role && (
          <p className="flex items-center gap-2">
            <User size={14} />
            {role}
          </p>
        )}

        {/* Preferred Contact */}
        {preferredContact && (
          <p className="text-xs text-gray-400 mt-2">
            Preferred contact: <span className="capitalize">{preferredContact}</span>
          </p>
        )}
      </div>

      {/* Edit button */}
      {isOwner && (
        <button
          onClick={onEdit}
          className="mt-3 text-sm underline text-blue-400 hover:text-blue-300"
        >
          Edit
        </button>
      )}
    </div>
  );
}