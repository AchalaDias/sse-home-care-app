import { ObjectId } from "mongodb";
import User from "../userSchema.js";
import bcrypt from 'bcrypt';
import Job from '../jobSchema.js';
import { AuditLogsModel } from '../models/audit.model.js';

const auditLogs = new AuditLogsModel();

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

    profile = async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findById(id);
            console.log(user)
            return res.render('profile', { user: req.user, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }

    verifyUser = async (req, res) => {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.user._id },
                { verificationCheckFile: req.file.filename },
            );
            return res.render('profile', { user, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }

    viewCreateJob = async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findById(id);
            return res.render('create-job', { googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, user: req.user, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }


    createJob = async (req, res) => {
        try {
            // Extract form data
            const { jobTitle, location, latitude, longitude, jobDescription, tags, cost, jobDate } = req.body;

            // Store image URLs
            const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

            // Convert tags to array (split by commas)
            const tagsArray = tags.split(',').map((tag) => tag.trim());

            // Create a new job document
            const job = new Job({
                title: jobTitle,
                userId: req.user._id,
                location,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: jobDescription,
                images: imageUrls,
                tags: tagsArray,
                cost: parseFloat(cost),
                jobDate: jobDate
            });

            // Save the job in MongoDB
            await job.save();

            return res.render('home', { user: req.user, errMsg: null });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create job' });
        }
    }


    viewFindJob = async (req, res) => {
        try {
            const query = req.query.q || ''; // Get search query from the URL parameter
            const jobs = await Job.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } },
                ],
            });

            return res.render('find-jobs', { user: req.user, jobs, query });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

    searchJob = async (req, res) => {
        try {
            const query = req.query.q || '';
            const isNumeric = !isNaN(query);
            const jobs = await Job.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } },
                    ...(isNumeric ? [{ cost: query }] : []),
                ],
            }).sort({ createdAt: -1 });

            return res.render('find-jobs', { user: req.user, jobs, query });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

    users = async (req, res) => {
        const id = req.params.id;
        try {
            const users = await User.find({
                isAdmin: false
            });
            return res.render('users-admin', { user: req.user, users, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }

    approve = async (req, res) => {
        try {
            const { userId } = req.body;

            console.log(userId)
            
            await User.findByIdAndUpdate(userId, { accountAccepted: true  });
            const users = await User.find({
                isAdmin: false
            });
            console.log(users)
            return res.render('users-admin', { user: req.user, users, errMsg: null });
        } catch (error) {
            console.log(error);
        }
    }
}