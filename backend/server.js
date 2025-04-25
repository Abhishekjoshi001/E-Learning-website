import express from "express";
import dotenv from "dotenv";
import connectToMongodb from "./db/connectdb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passport from "passport";
import session from 'express-session';
import "./controllers/googleAuthController.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./middlewares/passportConfig.js";


const PORT = process.env.PORT || 8000;
const app = express();

dotenv.config();


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));
app.use(express.json()); // Parsing JSON
app.use(cookieParser()); // Parse cookies

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Changed to false for better security
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("<h1>Hello world<h1>");
});

app.listen(PORT, () => {
  connectToMongodb();
  console.log(`Server is running on ${PORT}`); //Connecting to server on port number as defined
});
