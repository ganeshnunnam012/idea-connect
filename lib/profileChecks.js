export function hasPersonalDetails(userData) {
  if (!userData) return false;

  const { phone, linkedin, website } = userData;

  return Boolean(
    phone?.trim() ||
    linkedin?.trim() ||
    website?.trim()
  );
}