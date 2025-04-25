import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (res, userId) => {
  // Generate a JWT token
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // Set the cookie with the generated token
  res.cookie("jwt", token, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production (HTTPS)
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days expiration
    sameSite: "strict", // Strict same-site policy to prevent CSRF
  });

  return token; // ✅ Return the token so it can be sent in the response
};

export default generateTokenAndSetCookie;
