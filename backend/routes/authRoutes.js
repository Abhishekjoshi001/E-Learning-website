import express from "express"
import { login, logout, register } from "../controllers/authController.js"
import passport from 'passport';
import { loginSuccess} from "../controllers/googleAuthController.js";

const router = express.Router()

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:8000/",
    failureRedirect: "http://localhost:8000/login"
}));

router.get("/Glogin", loginSuccess);

router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)
// router.post("/forgotpassword",forgotpassword)

export default router