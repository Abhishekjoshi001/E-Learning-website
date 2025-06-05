import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const auth = async (req, res, next) => {
  try {
    let token;

    // Debug logging
    console.log("🔍 Auth Debug Info:");
    console.log("Authorization header:", req.headers.authorization);
    console.log("Cookies:", req.cookies);
    console.log("JWT cookie:", req.cookies?.jwt);

    // 1️⃣ Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token found in Authorization header");
    }
    // 2️⃣ Check for token in cookies (fallback)
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
      console.log("Token found in cookies");
    }

    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    // Debug token format
    console.log("Token length:", token.length);
    console.log("Token starts with:", token.substring(0, 20) + "...");
    
    // Check if token has proper JWT format (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log("Invalid JWT format - parts:", tokenParts.length);
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", { id: decoded.id, exp: decoded.exp });

    if (!decoded) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    // Find user and attach to request object
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error.name, error.message);
    
    // More specific error handling
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token format or signature" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: "Token not active yet" });
    } else {
      return res.status(401).json({ message: "Token verification failed" });
    }
  }
};

//Middleware to check if the user is instructor
export const instructor = (req, res, next) => {
  if (req.user && req.user.role === 'instructor') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an instructor'
    });
  }
};

//Middleware to check if the user is an admin
//Must be used after the protect middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};