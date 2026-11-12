const mongoose = require("mongoose");
const LearningProgress = require("../models/LearningProgress");
const CourseContent = require("../models/CourseContent");

// GET /api/v1/progress  - the logged-in student's progress in every course
const getMyProgress = async (req, res, next) => {
  try {
    const progress = await LearningProgress.find({ student: req.user.id })
      .populate("course", "courseName courseCode")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: progress.length, data: progress });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/progress/:courseId
const getCourseProgress = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const progress = await LearningProgress.findOne({
      student: req.user.id,
      course: req.params.courseId
    }).lean();

    res.status(200).json({
      success: true,
      data: progress || {
        course: req.params.courseId,
        completedLessons: [],
        totalLessons: 0,
        progressPercentage: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/progress/:courseId/lessons/:lessonId  - mark a lesson complete
const markLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(lessonId)) {
      return res.status(400).json({ success: false, message: "Invalid course or lesson ID" });
    }

    const content = await CourseContent.findOne({ course: courseId }).lean();
    if (!content) {
      return res.status(404).json({ success: false, message: "Course content not found" });
    }

    const lessonIds = content.modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => String(lesson._id))
    );

    if (!lessonIds.includes(lessonId)) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { student: req.user.id, course: courseId },
      {
        $addToSet: { completedLessons: lessonId },
        $set: { totalLessons: lessonIds.length }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const completed = progress.completedLessons.filter((id) =>
      lessonIds.includes(id)
    ).length;

    progress.progressPercentage = lessonIds.length
      ? Math.round((completed / lessonIds.length) * 100)
      : 0;
    await progress.save();

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProgress, getCourseProgress, markLessonComplete };
