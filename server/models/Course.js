const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String },
  public_id: { type: String },
  freePreview: { type: Boolean, default: false },
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    primaryLanguage: { type: String },
    thumbnail: { type: String },
    thumbnail_public_id: { type: String },
    pricing: { type: Number, required: true },
    objectives: { type: String },
    welcomeMessage: { type: String },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: { type: String },
    isPublished: { type: Boolean, default: false },
    curriculum: [LectureSchema],
    students: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        studentName: { type: String },
        studentEmail: { type: String },
        paidAmount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

CourseSchema.index({ instructorId: 1 });

module.exports = mongoose.model("Course", CourseSchema);