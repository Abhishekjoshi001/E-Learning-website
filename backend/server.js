import express from "express";
import dotenv from "dotenv";
import connectToMongodb from "./config/connectdb.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import passport from "passport";
import session from 'express-session';
import "./controllers/googleAuthController.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./config/passportConfig.js";
import morgan from "morgan";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/apiLimiter.js"
// import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();



app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
}));
app.use(helmet()); // Security headers
app.use(express.json()); // Parsing JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(morgan('dev')); // Logging

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
app.use('/api', apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/courses", courseRoutes);
// app.use('/api/payment', paymentRoutes);

// app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("<h1>Hello world<h1>");
});

app.listen(PORT, () => {
  connectToMongodb();
  console.log(`Server is running on ${PORT}`); //Connecting to server on port number as defined
});
