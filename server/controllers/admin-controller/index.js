const User = require("../../models/User");
const Course = require("../../models/Course");
const Order = require("../../models/Order");
const StudentCourses = require("../../models/StudentCourses");
const cloudinary = require("../../helpers/cloudinary");

const getAllUsers = async (req, res) => {
  const { role, status } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter, { password: 0 });

  return res.status(200).json({
    success: true,
    data: users,
  });
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["active", "pending", "suspended"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, projection: { password: 0 } }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.role === "instructor") {
    const courses = await Course.find({ instructorId: id });

    const deletePromises = [];

    for (const course of courses) {
      course.curriculum
        .filter((l) => l.public_id)
        .forEach((l) =>
          deletePromises.push(
            cloudinary.uploader.destroy(l.public_id, { resource_type: "video" })
          )
        );

      if (course.thumbnail_public_id) {
        deletePromises.push(cloudinary.uploader.destroy(course.thumbnail_public_id));
      }
    }

    await Promise.all(deletePromises);

    const courseIds = courses.map((c) => c._id);
    await StudentCourses.updateMany(
      {},
      { $pull: { courses: { courseId: { $in: courseIds } } } }
    );

    await Course.deleteMany({ instructorId: id });
  }

  await User.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};

const getAllCourses = async (req, res) => {
  const courses = await Course.find({}, { students: 0, curriculum: 0 });

  return res.status(200).json({
    success: true,
    data: courses,
  });
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  const deletePromises = course.curriculum
    .filter((lecture) => lecture.public_id)
    .map((lecture) =>
      cloudinary.uploader.destroy(lecture.public_id, { resource_type: "video" })
    );

  if (course.thumbnail_public_id) {
    deletePromises.push(cloudinary.uploader.destroy(course.thumbnail_public_id));
  }

  await Promise.all(deletePromises);

  await StudentCourses.updateMany(
    {},
    { $pull: { courses: { courseId: course._id } } }
  );

  await Course.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
};

const getAnalytics = async (req, res) => {
  const [totalUsers, totalInstructors, totalCourses, orders] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "instructor" }),
    Course.countDocuments(),
    Order.find({ orderStatus: "confirmed" }, { coursePricing: 1 }),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.coursePricing, 0);
  const totalOrders = orders.length;

  return res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalInstructors,
      totalCourses,
      totalOrders,
      totalRevenue,
    },
  });
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAnalytics,
};