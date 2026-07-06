const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  cancelOrder,
} = require("../../controllers/student-controller/order-controller");
const verifyToken = require("../../middleware/auth-middleware");

router.post("/create", verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);
router.post("/cancel", verifyToken, cancelOrder);

module.exports = router;