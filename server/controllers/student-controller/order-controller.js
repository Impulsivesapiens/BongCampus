const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const mongoose = require("mongoose");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: course.pricing * 100, // Razorpay expects paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  const newOrder = new Order({
    userId,
    userName: req.user.userName,
    userEmail: req.user.userEmail,
    courseId: course._id,
    courseTitle: course.title,
    coursePricing: course.pricing,
    instructorId: course.instructorId,
    razorpayOrderId: razorpayOrder.id,
  });

  await newOrder.save();

  return res.status(201).json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      courseName: course.title,
    },
  });
};

const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed. Invalid signature.",
    });
  }

  // find the order
  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const course = await Course.findById(order.courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  // mongodb transaction — all three writes or none
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. update order
    await Order.findByIdAndUpdate(
      order._id,
      {
        orderStatus: "confirmed",
        paymentStatus: "captured",
        razorpayPaymentId,
      },
      { session }
    );

    // 2. push student into course
    await Course.findByIdAndUpdate(
      order.courseId,
      {
        $push: {
          students: {
            studentId: order.userId,
            studentName: order.userName,
            studentEmail: order.userEmail,
            paidAmount: order.coursePricing, // from DB, never client
          },
        },
      },
      { session }
    );

    // 3. push course into StudentCourses
    await StudentCourses.findOneAndUpdate(
      { userId: order.userId },
      {
        $push: {
          courses: {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: course.instructorName,
            thumbnail: course.thumbnail,
            courseStatus: "purchased",
          },
        },
      },
      { upsert: true, session } // create document if student has no purchases yet
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment verified and enrollment confirmed",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction failed:", error, "PaymentId:", razorpayPaymentId);

    return res.status(500).json({
      success: false,
      message: "Enrollment failed. Please contact support.",
    });
  }
};

const cancelOrder = async (req, res) => {
  const { razorpayOrderId } = req.body;

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, orderStatus: "pending" },
    { orderStatus: "failed", paymentStatus: "failed" },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found or already processed",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order cancelled",
  });
};

module.exports = { createOrder, verifyPayment, cancelOrder };