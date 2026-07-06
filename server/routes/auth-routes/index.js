const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} = require("../../controllers/auth-controller");
const verifyToken = require("../../middleware/auth-middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", verifyToken, checkAuth);

module.exports = router;