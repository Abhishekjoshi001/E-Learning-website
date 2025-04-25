import passport from "passport";
import OAuth2Strategy from "passport-google-oauth2";
import User from "../models/userModel.js"; // Adjust path if needed
import dotenv from "dotenv";
dotenv.config();

const clientid = process.env.GOOGLE_CLIENT_ID;
const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new OAuth2Strategy({
    clientID: clientid,
    clientSecret: clientsecret,
    callbackURL: "/api/auth/google/callback",
    scope: ["profile", "email"]
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                // If not, create new user with minimal required fields
                user = new User({
                    fullname: profile.displayName,
                    username: profile.emails[0].value.split('@')[0], // auto-assign username from email
                    email: profile.emails[0].value,
                    password: "google_oauth", // Placeholder (should not be used for login)
                    phonenumber: "0000000000", // Placeholder (you can update this later)
                    googleId: profile.id
                });

                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
