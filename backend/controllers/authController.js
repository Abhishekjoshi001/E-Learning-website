import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

// ----------------- REGISTER -----------------
export const register = async (req, res) => {
    console.log("Request body:", req.body);
    try {
        const { fullname, username, password, confirmpassword, phonenumber, email } = req.body;

        // Validation
        if (!fullname|| !username || !password || !confirmpassword || !phonenumber || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const user_name = await User.findOne({ username });
        if (user_name) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const user_email = await User.findOne({ email });
        if (user_email) {
            return res.status(409).json({ error: "Account already exists for this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            password: hashedpassword,
            phonenumber,
            email
        });

        await newUser.save();

        generateTokenAndSetCookie(res, newUser._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                phonenumber: newUser.phonenumber,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Error in Register controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// ----------------- LOGIN -----------------
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        const ispasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !ispasswordCorrect) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                phone: user.phonenumber,
                gender: user.gender,
                role: user.role,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error("Error in Login controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// ----------------- LOGOUT -----------------
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0, httpOnly: true });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in Logout controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// ----------------- FORGOT PASSWORD -----------------
// export const forgotpassword = async (req, res) => {
//     try {
//         const { username, phonenumber,newpassword } = req.body;

//         if (!username || !phonenumber || !newpassword || !answer) {
//             return res.status(400).json({ error: "All fields are required" });
//         }

//         const user = await User.findOne({ username, phonenumber, answer });

//         if (!user) {
//             return res.status(404).json({ error: "Incorrect username, phone number, or answer" });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedpassword = await bcrypt.hash(newpassword, salt);

//         await User.findByIdAndUpdate(user._id, { password: hashedpassword });

//         res.status(200).json({ success: true, message: "Password changed successfully" });

//     } catch (error) {
//         console.error("Error in Forgot Password controller:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };
