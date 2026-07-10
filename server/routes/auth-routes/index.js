const express = require("express");
const router = express.Router();
const { validateRegister, validateLogin } = require("../../middleware/validation-middleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} = require("../../controllers/auth-controller");
const verifyToken = require("../../middleware/auth-middleware");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", verifyToken, checkAuth);

module.exports = router;