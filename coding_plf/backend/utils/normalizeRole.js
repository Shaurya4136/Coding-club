const normalizeRole = (role = "") => {
  const roleMap = {
    "club head": "ClubHead",
    "clubhead": "ClubHead",
    "Club Head": "ClubHead",
    "ClubHead": "ClubHead",

    "student": "Student",
    "Student": "Student",

    "college": "College",
    "College": "College",
  };

  return roleMap[role.trim()] || null;
};

module.exports = normalizeRole;
