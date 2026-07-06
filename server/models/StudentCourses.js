const mongoose = require("mongoose");

const StudentCoursesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        title: { type: String },
        instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        instructorName: { type: String },
        thumbnail: { type: String },
        courseStatus: { type: String, enum: ["purchased"], default: "purchased" },
      },
    ],
  },
  { timestamps: true }
);

StudentCoursesSchema.index({ userId: 1 });

module.exports = mongoose.model("StudentCourses", StudentCoursesSchema);