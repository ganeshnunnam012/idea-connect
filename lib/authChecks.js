export function canViewPersonalDetails(currentUser) {
  // 🚫 IMPORTANT:
  // If auth state is not ready yet, DO NOT block
  if (currentUser === undefined) {
    return true; // auth still initializing
  }

  // ❌ User is truly logged out
  if (!currentUser) {
    return false;
  }

  const isGoogleUser = currentUser.providerData?.some(
    (p) => p.providerId === "google.com"
  );

  // ✅ Google users are always verified
  if (isGoogleUser) {
    return true;
  }

  // ✅ Email/password users must be verified
  return currentUser.emailVerified === true;
}