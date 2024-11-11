import Application from '../applicationSchema.js';

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
            res.redirect(`/application`); // Redirect back to the job details page
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
                    $project: { // Select specific fields to return
                        jobId: 1,
                        amount: 1,
                        comment: 1,
                        approved: 1,
                        createdAt: 1,
                        jobDetails: {
                            title: 1,
                            description: 1,
                            location: 1,
                            cost: 1,
                            images: 1,
                            createdAt: 1
                        }
                    }
                }
            ]);
            console.log(applicationsWithJobs)
            return res.render('applications', { user: req.user, jobs: applicationsWithJobs });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to load application');
        }
    }
}