const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const getAllCourses = async (req, res) => {
  const { category, level, primaryLanguage, sortBy } = req.query;

  const filter = { isPublished: true };

  if (category) filter.category = { $in: category.split(",") };
  if (level) filter.level = { $in: level.split(",") };
  if (primaryLanguage) filter.primaryLanguage = { $in: primaryLanguage.split(",") };

  const sortMap = {
    "price-lowtohigh": { pricing: 1 },
    "price-hightolow": { pricing: -1 },
    "title-atoz": { title: 1 },
    "title-ztoa": { title: -1 },
  };

  const sortOption = sortMap[sortBy] || { createdAt: -1 };

  const courses = await Course.find(filter, {
    curriculum: 0,
    students: 0,
  }).sort(sortOption);

  return res.status(200).json({
    success: true,
    data: courses,
  });
};

const getCourseDetails = async (req, res) => {
  const course = await Course.findById(req.params.id, {
    students: 0,
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  const courseData = course.toObject();

  courseData.curriculum = courseData.curriculum.map((lecture) => {
    if (!lecture.freePreview) {
      return { ...lecture, videoUrl: null };
    }
    return lecture;
  });

  return res.status(200).json({
    success: true,
    data: courseData,
  });
};

const getCourseAccess = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  const studentCourses = await StudentCourses.findOne({ userId });

  const hasPurchased = studentCourses?.courses.some(
    (c) => c.courseId.toString() === courseId
  );

  if (!hasPurchased) {
    return res.status(403).json({
      success: false,
      message: "You have not purchased this course",
    });
  }

  const course = await Course.findById(courseId, {students: 0});

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: course,
  });
};

const getPurchasedCourses = async (req, res) => {
  const userId = req.user.id;

  const studentCourses = await StudentCourses.findOne({ userId });

  if (!studentCourses) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    data: studentCourses.courses,
  });
};

module.exports = { getAllCourses, getCourseDetails, getCourseAccess, getPurchasedCourses };