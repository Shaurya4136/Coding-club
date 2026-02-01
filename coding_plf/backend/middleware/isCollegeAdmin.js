const isCollegeAdmin = (req, res, next) => {
  if (req.user.role !== "College") {
    return res.status(403).json({ message: "College access only" });
  }
  next();
};

module.exports = isCollegeAdmin;