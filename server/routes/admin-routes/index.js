const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAnalytics,
} = require("../../controllers/admin-controller");
const verifyToken = require("../../middleware/auth-middleware");
const verifyAdmin = require("../../middleware/role-middleware").verifyAdmin;

router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.put("/users/:id/status", verifyToken, verifyAdmin, updateUserStatus);
router.delete("/users/:id", verifyToken, verifyAdmin, deleteUser);
router.get("/courses", verifyToken, verifyAdmin, getAllCourses);
router.delete("/courses/:id", verifyToken, verifyAdmin, deleteCourse);
router.get("/analytics", verifyToken, verifyAdmin, getAnalytics);

module.exports = router;