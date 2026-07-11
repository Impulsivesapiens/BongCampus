const Course = require("../../models/Course");
const cloudinary = require("../../helpers/cloudinary");
const StudentCourses = require("../../models/StudentCourses");

const getInstructorCourses = async (req, res) => {
  const instructorId = req.user.id;

  const courses = await Course.find({ instructorId }, { students: 0 });

  return res.status(200).json({
    success: true,
    data: courses,
  });
};

const createCourse = async (req, res) => {
  const {
    title,
    subtitle,
    description,
    category,
    level,
    primaryLanguage,
    thumbnail,
    thumbnail_public_id,
    pricing,
    objectives,
    welcomeMessage,
  } = req.body;

  const newCourse = new Course({
    title,
    subtitle,
    description,
    category,
    level,
    primaryLanguage,
    thumbnail,
    thumbnail_public_id,
    pricing,
    objectives,
    welcomeMessage,
    instructorId: req.user.id,
    instructorName: req.user.userName,
    isPublished: false,
    curriculum: [],
    students: [],
  });

  await newCourse.save();

  return res.status(201).json({
    success: true,
    data: newCourse,
  });
};

const updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const instructorId = req.user.id;

  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found or unauthorized",
    });
  }

  // delete old thumbnail from cloudinary if a new one is being uploaded
  if (req.body.thumbnail && course.thumbnail_public_id) {
    await cloudinary.uploader.destroy(course.thumbnail_public_id);
  }

  const allowedFields = [
    "title",
    "subtitle",
    "description",
    "category",
    "level",
    "primaryLanguage",
    "thumbnail",
    "thumbnail_public_id",
    "pricing",
    "objectives",
    "welcomeMessage",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      course[field] = req.body[field];
    }
  });

  await course.save();

  return res.status(200).json({
    success: true,
    data: course,
  });
};

const deleteCourse = async (req, res) => {
  const courseId = req.params.id;
  const instructorId = req.user.id;

  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found or unauthorized",
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

  await Course.findByIdAndDelete(courseId);

  return res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
};

const togglePublish = async (req, res) => {
  const courseId = req.params.id;
  const instructorId = req.user.id;

  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found or unauthorized",
    });
  }

  course.isPublished = !course.isPublished;
  await course.save();

  return res.status(200).json({
    success: true,
    data: { isPublished: course.isPublished },
  });
};

const addLecture = async (req, res) => {
  const courseId = req.params.id;
  const instructorId = req.user.id;
  const { title, videoUrl, public_id, freePreview } = req.body;

  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found or unauthorized",
    });
  }

  course.curriculum.push({ title, videoUrl, public_id, freePreview });
  await course.save();

  return res.status(201).json({
    success: true,
    data: course.curriculum,
  });
};

const deleteLecture = async (req, res) => {
  const { id: courseId, lectureId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found or unauthorized",
    });
  }

  const lecture = course.curriculum.id(lectureId);

  if (!lecture) {
    return res.status(404).json({
      success: false,
      message: "Lecture not found",
    });
  }

  if (lecture.public_id) {
    await cloudinary.uploader.destroy(lecture.public_id, {
      resource_type: "video",
    });
  }

  course.curriculum.pull({ _id: lectureId });
  await course.save();

  return res.status(200).json({
    success: true,
    data: course.curriculum,
  });
};

const getUploadSignature = async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return res.status(200).json({
    success: true,
    data: {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
};

const deleteStagedUpload = async (req, res) => {
  const { public_id, resource_type } = req.body;

  if (!public_id) {
    return res.status(400).json({
      success: false,
      message: "public_id is required",
    });
  }

  await cloudinary.uploader.destroy(public_id, {
    resource_type: resource_type || "video",
  });

  return res.status(200).json({
    success: true,
    message: "Upload deleted successfully",
  });
};

module.exports = {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  addLecture,
  deleteLecture,
  getUploadSignature,
  deleteStagesUpload,
};