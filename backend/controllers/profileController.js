const User = require("../models/User");

// GET /api/v1/profile
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.sub)
      .select("name email department role createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/profile   - a user can only ever edit THEIR OWN profile (id comes from the JWT)
async function updateProfile(req, res, next) {
  try {
    const { name, department } = req.body || {};

    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({
        message: "Valid name is required"
      });
    }

    const updates = { name: name.trim() };

    if (department !== undefined) {
      if (typeof department !== "string" || department.trim().length > 100) {
        return res.status(400).json({ message: "Invalid department" });
      }
      updates.department = department.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name email department role");

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
