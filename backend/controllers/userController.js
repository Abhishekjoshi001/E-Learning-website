import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const updateProfile = async (req, res) => {
  try {
    const { fullname, currentpassword, newpassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password if new password is provided
    if (currentpassword && newpassword) {
      const isPasswordCorrect = await bcrypt.compare(currentpassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Incorrect current password" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newpassword, salt);
    }

    // Update allowed fields only
    if (fullname) user.fullname = fullname;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        username: updatedUser.username,
        phonenumber: updatedUser.phonenumber, // cant edit
        email: updatedUser.email,             // cant edit
      }
    });

  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
