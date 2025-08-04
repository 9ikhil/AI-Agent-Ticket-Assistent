// {import express from "express";
// import {
//   userSignup,
//   userLogin,
//   logout,
//   getUser,
// } from "../controller/user.js";
// import {authentication} from "../middleware/auth.js";

// const router = express.Router();

// router.post("/signup", userSignup);
// router.post("/login", userLogin);
// router.get("/logout", logout);
// router.get("/user", authentication, getUser);

// export default router;
// }

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {
  userSignup,
  userLogin,
  logout,
  getUser,
  createAdmin,
  createModerator,
} from "../controller/user.js";
import {authentication} from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/logout", logout);

// Protected routes
router.get("/users", authentication, getUser);

// Admin-only routes
router.post("/create-admin", authentication, createAdmin);
router.post("/create-moderator", authentication, createModerator);

// First-time admin creation (remove this after creating first admin)
router.post("/create-first-admin", async (req, res) => {
  try {
    const { userName, email, password, skills = [] } = req.body;
    
    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "userName, email, and password are required fields"
      });
    }
    
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ 
        error: "Admin already exists",
        details: "Use the regular admin creation endpoint"
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        error: "User already exists",
        details: "A user with this email address already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      userName,
      skills,
      role: "admin"
    });

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      message: "First admin created successfully",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("First admin creation error:", error);
    res.status(500).json({ 
      error: "Failed to create first admin", 
      details: error.message 
    });
  }
});

router.post("/promote-to-admin", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required" 
      });
    }
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }
    
    res.json({ 
      success: true,
      message: `User ${email} promoted to admin`,
      user 
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to promote user", 
      details: error.message 
    });
  }
});

// Temporary route to promote user to moderator
router.post("/promote-to-moderator", async (req, res) => {

   

  try {
    // Check if req.user exists (authentication worked)
    if (!req.user) {
      return res.status(401).json({ 
        error: "Authentication failed",
        details: "User information not found. Please login again."
      });
    }

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Access denied",
        details: `Only administrators can promote users to admin. Your role: ${req.user.role}` })
      }
      
    const { email } = req.body;


    
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required" 
      });
    }
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: "moderator" },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }
    
    res.json({ 
      success: true,
      message: `User ${email} promoted to moderator`,
      user 
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to promote user", 
      details: error.message 
    });
  }
});

export default router;