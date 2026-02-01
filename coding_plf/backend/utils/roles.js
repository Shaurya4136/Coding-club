const normalizeRole = (role = "") =>
  role.toLowerCase().replace(/\s+/g, "");

const isClubHead = (role) =>
  normalizeRole(role) === "clubhead";

const isCollege = (role) =>
  normalizeRole(role) === "college";

module.exports = { isClubHead, isCollege };