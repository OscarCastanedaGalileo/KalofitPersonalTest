const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, Profile } = require("../models");
const { requireAuth } = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

// All routes require auth first
router.use(requireAuth);

// GET /api/users/me - Get current user (no admin required)
router.get("/me", async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      paranoid: false,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Error fetching current user" });
  }
});

// Then apply admin middleware to all other routes
router.use(requireAdmin);

// GET /api/users - List all users (excluding soft deleted)
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isConfirmed', 'createdAt', 'updatedAt'],
      paranoid: false, // Include soft deleted for admin view
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// GET /api/users/:id - Get specific user
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'isConfirmed', 'createdAt', 'updatedAt'],
      paranoid: false,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// POST /api/users - Create new user
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role = 'basic' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      hashPassword: hashedPassword,
      role,
      isConfirmed: true, // Admin created users are confirmed
    });

    // Create profile for the new user
    await Profile.create({
      userId: newUser.id,
      dailyWaterGoal: 3000, // Default water goal
    });

    // Return without password
    const { hashPassword, ...userResponse } = newUser.toJSON();
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// PUT /api/users/:id - Update user (name, email, role, isConfirmed)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isConfirmed } = req.body;

    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    await user.update({ name, email, role, isConfirmed });

    const { hashPassword, ...userResponse } = user.toJSON();
    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user" });
  }
});

// PUT /api/users/:id/change-password - Change user password
router.put("/:id/change-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ hashPassword: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Error changing password" });
  }
});

// DELETE /api/users/:id - Soft delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy(); // Soft delete
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// POST /api/users/:id/restore - Restore soft deleted user
router.post("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.deletedAt) {
      return res.status(400).json({ error: "User is not deleted" });
    }

    await user.restore();
    res.json({ message: "User restored successfully" });
  } catch (error) {
    console.error("Error restoring user:", error);
    res.status(500).json({ error: "Error restoring user" });
  }
});

module.exports = router;
