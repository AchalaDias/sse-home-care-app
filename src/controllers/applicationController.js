import Application from '../applicationSchema.js';
import Job from '../jobSchema.js';
import User from "../userSchema.js";

export default class ApplicationController {

    applyJob = async (req, res) => {
        try {
            const jobId = req.params.id;
            const { comment } = req.body;
            const userId = req.user._id; // Assuming `req.user` contains the logged-in user's info

            const apply = new Application({
                jobId,
                userId,
                comment
            });

            await apply.save();
            res.redirect(`/application`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to submit application');
        }
    }

    listJobApplications = async (req, res) => {
        try {

            const userId = req.user._id;
            const applicationsWithJobs = await Application.aggregate([
                {
                    $match: { userId: userId }
                },
                {
                    $lookup: { // Join with the Job collection
                        from: 'jobs',
                        localField: 'jobId',
                        foreignField: '_id',
                        as: 'jobDetails'
                    }
                },
                {
                    $unwind: '$jobDetails'
                },
                {
                    $lookup: { // Join with the Timesheet collection
                        from: 'timesheets',
                        localField: '_id', // Assuming timesheet has a field that references the application ID
                        foreignField: 'applicationId', // This should be the field in Timesheet that holds the application ID
                        as: 'timesheetDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$timesheetDetails',
                        preserveNullAndEmptyArrays: true // Keep applications without timesheets
                    }
                },
                {
                    $project: { // Select specific fields to return
                        jobId: 1,
                        amount: 1,
                        comment: 1,
                        userId: 1,
                        approved: 1,
                        createdAt: 1,
                        jobDetails: {
                            title: 1,
                            description: 1,
                            location: 1,
                            longitude: 1,
                            latitude: 1,
                            cost: 1,
                            images: 1,
                            jobDate: 1,
                            createdAt: 1
                        },
                        timesheetDetails: {
                            clockInTime: 1,
                            clockInSet: 1,
                            clockOutTime: 1,
                            clockOutSet: 1,
                            userId: 1,
                            jobId: 1,
                            createdAt: 1
                        }
                    }
                }
            ]);
            console.log(applicationsWithJobs)
            return res.render('my-applications', { user: req.user, jobs: applicationsWithJobs });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to load application');
        }
    }

    listApplications = async (req, res) => {
        try {
            const jobId = req.params.id;

            // Fetch the job details (optional)
            const job = await Job.findById(jobId);
            if (!job) return res.status(404).send('Job not found');

            // Fetch applications for this job
            const applications = await Application.find({ jobId }).populate('userId', 'username ratings');

            res.render('applications', { job, applications, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to submit application');
        }
    }


    approveUser = async (req, res) => {
        try {
            try {
                const applicationId = req.params.applicationId;

                // Update the application status to approved
                const job = await Application.findByIdAndUpdate(applicationId, { approved: true });
                res.redirect(`/application/${job.jobId}/list`);
            } catch (error) {
                console.error(error);
                res.status(500).send('Failed to approve application');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to submit application');
        }
    }

    rateUser = async (req, res) => {
        try {
            const { applicationId, userId, jobId, rating } = req.body;

            console.log(rating)
    
            // Fetch the user and update their rating
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
    
            // Calculate new average rating
            user.ratings = (user.ratings * user.ratingCount + parseInt(rating)) / (user.ratingCount + 1);
            user.ratingCount = user.ratingCount + 1;
    
            await user.save();
            await Application.findByIdAndUpdate(applicationId, { ratingSubmitted: true });
            res.redirect(`/application/${jobId}/list`);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to submit rating' });
        }
    }

}