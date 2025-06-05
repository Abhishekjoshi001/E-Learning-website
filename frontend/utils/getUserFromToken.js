// utils/getUserFromToken.js
export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // e.g., { id, email, role, exp }
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
