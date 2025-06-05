import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
    path: "/",
  });

  if (process.env.NODE_ENV === "development") {
    console.log("JWT token set in cookie for user:", userId);
  }

  return token;
};

export default generateTokenAndSetCookie;
