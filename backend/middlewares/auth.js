import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const auth = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // 2️⃣ Check for token in cookies (fallback)
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided, access denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    // Find user and attach to request object
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(401).json({ message: "Invalid token, access denied" });
  }
};

//Middleware to check if the used=r in admin

export const instructor = (req, res, next) => {
  if (req.user && req.user.role === 'instructor' || req.user.role === 'admin') {
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
