import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from "../src/userSchema.js";
import otpGenerator from 'otp-generator';
import Mail from './mailer.js';

function initialize(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
                await User.findOneAndUpdate(
                    { email: email },
                    { otp: otp }
                );
                console.log(otp)
                Mail.sendOtp(email, otp)
                return done(null, user);
            }
            else return done(null, false, { message: 'Incorrect password' })
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    })
}

export const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}
export const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}
export default initialize;
