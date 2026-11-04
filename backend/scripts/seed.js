// Usage: npm run seed
// Creates the first ADMIN account (public registration only creates students)
// and inserts the sample courses if the courses collection is empty.
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Course = require("../models/Course");
const sampleCourses = require("../data/courses");

async function seed() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Admin").trim();

  if (!email || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env"
    );
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin"
    });
    console.log(`Admin created: ${email}`);
  }

  if ((await Course.countDocuments()) === 0) {
    await Course.insertMany(sampleCourses);
    console.log(`Inserted ${sampleCourses.length} sample courses`);
  } else {
    console.log("Courses already exist - skipping sample courses");
  }
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
