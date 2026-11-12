
const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseContent = require("../models/CourseContent");

// GET course content
const getCourseContent = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const content = await CourseContent.findOne({
            course: courseId
        }).lean();

        return res.status(200).json({
            success: true,
            data: content || { course: courseId, modules: [] }
        });
    } catch (error) {
        next(error);
    }
};

// ADD a new module
const addModule = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { title, description, order } = req.body;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Module title is required"
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        let content = await CourseContent.findOne({ course: courseId });

        if (!content) {
            content = new CourseContent({
                course: courseId,
                modules: []
            });
        }

        content.modules.push({
            title: title.trim(),
            description: typeof description === "string" ? description.trim() : "",
            order: Number.isInteger(Number(order)) && Number(order) > 0
                ? Number(order)
                : content.modules.length + 1,
            lessons: []
        });

        await content.save();

        return res.status(201).json({
            success: true,
            message: "Module added successfully",
            data: content.modules[content.modules.length - 1]
        });
    } catch (error) {
        next(error);
    }
};

// ADD a lesson inside a module
const addLesson = async (req, res, next) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, description, videoUrl, resourceUrl, order } = req.body;

        if (
            !mongoose.isValidObjectId(courseId) ||
            !mongoose.isValidObjectId(moduleId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid course or module ID"
            });
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Lesson title is required"
            });
        }

        const content = await CourseContent.findOne({
            course: courseId
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Course content not found"
            });
        }

        const module = content.modules.id(moduleId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found"
            });
        }

        module.lessons.push({
            title: title.trim(),
            description: typeof description === "string" ? description.trim() : "",
            videoUrl: typeof videoUrl === "string" ? videoUrl.trim() : "",
            resourceUrl: typeof resourceUrl === "string" ? resourceUrl.trim() : "",
            order: Number.isInteger(Number(order)) && Number(order) > 0
                ? Number(order)
                : module.lessons.length + 1
        });

        await content.save();

        return res.status(201).json({
            success: true,
            message: "Lesson added successfully",
            data: module.lessons[module.lessons.length - 1]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCourseContent,
    addModule,
    addLesson
};
