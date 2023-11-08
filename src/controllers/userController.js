import { ObjectId } from "mongodb";
import User from "../userSchema.js";
import bcrypt from 'bcrypt';

export default class UserController {
    getResetForm = async (req, res) => {
        const { token } = req.params;
        try {
            const user = User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                // Token is invalid or has expired
                return res.render('forgot-pass', { errorMsg: 'Password reset link has been expired!' });
            }
            // Display a password reset form
            res.render('reset-password', { token });
        } catch (error) {
            console.log('Something went wrong', error);
        }
    }

    postReset = async (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                // Token is invalid or has expired
                return res.render('forgot-pass', { errorMsg: 'Password reset link has been expired!' });
            }
            // Update the user's password using the instance
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            return res.redirect('/auth/login');
        } catch (error) {
            console.log('Something went wrong', error);
            // Handle the error appropriately
            return res.status(500).send('An error occurred during password reset.');
        }
    }


    reset = async (req, res) => {
        const id = req.params.id;
        const { password, newPassword } = req.body;
        try {
            const user = await User.findById(id);
            const isValidPass = await bcrypt.compare(password, user.password);
            if (!isValidPass) {
                return res.render('home', { user, errMsg: 'Incorrect User Password' });
            }
            const hashedPass = await bcrypt.hash(newPassword, 10);
            await User.updateOne({ _id: new ObjectId(id) }, { $set: { password: hashedPass } });
            return res.render('home', { user, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }
}