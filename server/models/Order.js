const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String },
    userEmail: { type: String },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "razorpay" },
    paymentStatus: {
      type: String,
      enum: ["initiated", "captured", "failed"],
      default: "initiated",
    },
    orderDate: { type: Date, default: Date.now },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseTitle: { type: String },
    coursePricing: { type: Number },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ razorpayOrderId: 1 });
OrderSchema.index(
  { orderDate: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { orderStatus: "pending" },
  }
);

module.exports = mongoose.model("Order", OrderSchema);