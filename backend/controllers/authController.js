const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/v1/auth/register  - creates STUDENT accounts only
async function register(req, res, next) {
  try {
    const { name, email, password, department } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message:
          "Valid name, email and password of 12 to 72 characters are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department:
        typeof department === "string" && department.trim()
          ? department.trim()
          : undefined,
      role: "student" // never taken from the request body
    });

    return res.status(201).json({
      message: "Registration successful",
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/auth/login  - students and admins
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        subject: String(user._id),
        expiresIn
      }
    );

    return res.json({
      message: "Login successful",
      token,
      tokenType: "Bearer",
      expiresIn,
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
