// import jwt from "jsonwebtoken";

// export const authentication = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const decodes = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decodes; 
//     // This makes the user data available to 
//     // subsequent middleware functions or route handlers in the request-response cycle.
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };


//////////////////////////////////////*----*----

import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Unauthorized",
        details: "No valid authorization header found"
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: "Unauthorized",
        details: "No token provided"
      });
    }

    console.log("Verifying token..."); // Debug log
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded); // Debug log
    
    // Optionally fetch full user data from database
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        details: "User not found"
      });
    }
    
    // Add clean user data without circular references
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      userName: user.userName,
      email: user.email,
      skills: user.skills
    };
    
    console.log("User authenticated:", req.user._id); // Debug log
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Invalid token",
        details: "Token is malformed"
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expired",
        details: "Please login again"
      });
    }
    
    return res.status(401).json({ 
      error: "Authentication failed",
      details: err.message
    });
  }
};