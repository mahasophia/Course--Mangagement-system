
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    },
    resourceUrl: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 1
    }
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 1
    },
    lessons: [lessonSchema]
});

const courseContentSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            unique: true
        },
        modules: [moduleSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("CourseContent", courseContentSchema);
