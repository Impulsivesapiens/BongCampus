const express = require("express");
const router = express.Router();
const {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  addLecture,
  deleteLecture,
  getUploadSignature,
  deleteStagedUpload,
} = require("../../controllers/instructor-controller");
const verifyToken = require("../../middleware/auth-middleware");
const { verifyInstructor } = require("../../middleware/role-middleware");

router.get("/courses", verifyToken, verifyInstructor, getInstructorCourses);
router.post("/courses", verifyToken, verifyInstructor, createCourse);
router.put("/courses/:id", verifyToken, verifyInstructor, updateCourse);
router.delete("/courses/:id", verifyToken, verifyInstructor, deleteCourse);
router.put("/courses/:id/publish", verifyToken, verifyInstructor, togglePublish);
router.post("/courses/:id/curriculum", verifyToken, verifyInstructor, addLecture);
router.delete("/courses/:id/curriculum/:lectureId", verifyToken, verifyInstructor, deleteLecture);
router.post("/upload/signature", verifyToken, verifyInstructor, getUploadSignature);
router.delete("/upload", verifyToken, verifyInstructor, deleteStagedUpload);

module.exports = router;