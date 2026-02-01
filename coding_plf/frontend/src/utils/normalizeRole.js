export const normalizeRole = (role = "") => {
  const r = role.toLowerCase().trim();

  if (["clubhead", "club head", "club-head"].includes(r)) {
    return "ClubHead";
  }

  if (["student"].includes(r)) {
    return "Student";
  }

  if (["college"].includes(r)) {
    return "College";
  }

  return "Unknown";
};