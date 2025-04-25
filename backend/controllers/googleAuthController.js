export const loginSuccess = async (req, res) => {
  if (req.user) {
      res.status(200).json({ message: "User login", user: req.user });
  } else {
      res.status(400).json({ message: "Not Authorized" });
  }
};