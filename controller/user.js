import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inggest/client.js";

// export const userSignup = async (req, res) => {
//   const { userName, email, password, skills = [] } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       email,
//       password: hashedPassword,
//       userName,
//       skills,
//     });

//     await inngest.send({
//       name: "user/signup",
//       data: {
//         email,
//       },
//     });

//     const token = jwt.sign(
//       { _id: user._id.toString(), role: user.role },
//       process.env.JWT_SECRET
//     );

//     // Avoid sending the password hash in the response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(201).json({ user: userResponse, token });
//   } catch (error) {
//     res.status(500).json({ error: "signup failed", details: error.message });
//   }
// };

// export const userLogin = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "user not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "invalid credentials" });
//     // Generate JWT token
//     const token = jwt.sign(
//       { _id: user._id.toString(), role: user.role },
//       process.env.JWT_SECRET
//     );

//     // Avoid sending the password hash in the response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.json({ user: userResponse, token });
//   } catch (error) {
//     res.status(500).json({ error: "Login failed", details: error.message });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "Unauthorized" });
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) return res.status(401).json({ error: "Invalid token" });
//       // Invalidate the token logic here (e.g., store it in a blacklist)
//       res.json({ message: "Logged out successfully" });
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Logout failed", details: error.message });
//   }
// };

// export const getUser = async (req, res) => {
//   try {
//     if (req.user.role != "admin") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const users = await User.find().select("-password");
//     return res.json(users);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to fetch users", details: error.message });
//   }
// };



export const getUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Access denied",
        details: "Only administrators can access user list"
      });
    }

    const users = await User.find().select("-password");
    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      error: "Failed to fetch users", 
      details: "Internal server error"
    });
  }
};

export const userSignup = async (req, res) => {
  const { userName, email, password, skills = [] } = req.body;
  
  try {
    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "userName, email, and password are required fields"
      });
    }

    // Check if user already exists
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
    });

    // Send signup event to Inngest
    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET
    );

    // Avoid sending the password hash in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: "Duplicate entry",
        details: `A user with this ${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    res.status(500).json({ 
      error: "Signup failed", 
      details: "Internal server error"
    });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        error: "User not found",
        details: "No user found with this email address"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: "Invalid credentials",
        details: "Incorrect password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Add token expiration
    );

    // Avoid sending the password hash in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true,
      message: "Login successful",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Login failed", 
      details: "Internal server error"
    });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Unauthorized",
        details: "No valid authorization header found"
      });
    }

    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          error: "Invalid token",
          details: "Token verification failed"
        });
      }
      // In a production app, you'd want to add this token to a blacklist
      res.json({ 
        success: true,
        message: "Logged out successfully" 
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      error: "Logout failed", 
      details: "Internal server error"
    });
  }
};

export const createAdmin = async (req, res) => {
  const { userName, email, password, skills = [] } = req.body;
  
  try {
    // Only allow existing admins to create new admins
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Access denied",
        details: "Only administrators can create admin accounts"
        });
    }

    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "userName, email, and password are required fields"
      });
    }

    // Check if user already exists
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
      role: "admin" // Set role as admin
    });

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Avoid sending the password hash in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      message: "Admin created successfully",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: "Duplicate entry",
        details: `A user with this ${field} already exists`
      });
    }
    
    res.status(500).json({ 
      error: "Admin creation failed", 
      details: "Internal server error"
    });
  }
};

export const createModerator = async (req, res) => {
  const { userName, email, password, skills = [] } = req.body;
  
  try {
    // Only allow admins to create moderators
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ 
        error: "Access denied",
        details: "Only administrators can create moderator accounts"
      });
    }

    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        error: "All fields are required",
        details: "userName, email, and password are required fields"
      });
    }

    // Check if user already exists
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
      role: "moderator" // Set role as moderator
    });

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Avoid sending the password hash in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      message: "Moderator created successfully",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Moderator creation error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: "Duplicate entry",
        details: `A user with this ${field} already exists`
      });
    }
    
    res.status(500).json({ 
      error: "Moderator creation failed", 
      details: "Internal server error"
    });
  }
};