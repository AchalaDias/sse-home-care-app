import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "../src/userSchema.js";

const verifyGoogle = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '571467288820-o5tuof6beqm104lhenpram3k5e34aq76.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
        callbackURL: "http://localhost:8080/auth/google/callback",
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, cb) => {
            try {
                // Find or create the user based on the Google profile
                const user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return cb(null, user);
                } else {
                    // Create a new user with the Google profile information
                    const newUser = new User({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value, // Assuming you want to use the first email
                        password: Math.random().toString(20).slice(2),
                    });

                    await newUser.save();
                    return cb(null, newUser);
                }
            } catch (err) {
                return cb(err);
            }
        }));

    passport.serializeUser(function (user, done) {
        // Store the user's ID in the session
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            // Retrieve the user from the session using the ID
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}

export default verifyGoogle;
