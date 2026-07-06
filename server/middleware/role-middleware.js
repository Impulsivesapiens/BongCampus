const verifyInstructor = (req, res, next) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Instructors only.",
    });
  }
  next();
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};

module.exports = { verifyInstructor, verifyAdmin };