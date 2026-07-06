const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseDetails,
  getCourseAccess,
  getPurchasedCourses,
} = require("../../controllers/student-controller/course-controller");
const verifyToken = require("../../middleware/auth-middleware");

router.get("/", verifyToken, getAllCourses);
router.get("/purchased", verifyToken, getPurchasedCourses);
router.get("/:id/access", verifyToken, getCourseAccess);
router.get("/:id", verifyToken, getCourseDetails);


module.exports = router;