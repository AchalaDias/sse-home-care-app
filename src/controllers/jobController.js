import User from "../userSchema.js";
import Job from '../jobSchema.js';
import Application from '../applicationSchema.js';

export default class JobController {
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

            req.files.forEach((file) => {
                if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
                    return res.render('home', { user: req.user, errMsg: "Invalid image format" });
                }
            });

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
            const userId = req.user._id;
            const appliedJobs = await Application.find({ userId }).distinct('jobId');
            const jobs = await Job.find({
                _id: { $nin: appliedJobs },
                userId: { $ne: userId },
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } },
                ],
            }).sort({ createdAt: -1 });

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

    deleteJob = async (req, res) => {
        try {
            const job = await Job.findById(req.params.id);

            // Check if job exists and user is the creator
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            if (job.userId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to delete this job' });
            }

            await job.deleteOne();
            res.redirect('/job/my-jobs');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    myJobs = async (req, res) => {
        try {
            const query = req.query.q || null;
            const userId = req.user._id;
            let jobs = []
            if (query) {
                jobs = await Job.find({
                    $and: [
                        { userId: userId }, // Check for jobs created by the logged-in user
                        {
                            $or: [
                                { title: { $regex: query, $options: 'i' } }, // Search in title
                                { tags: { $regex: query, $options: 'i' } }  // Search in tags
                            ],
                        }
                    ],
                }).sort({ createdAt: -1 });
            } else {
                jobs = await Job.find({ userId: userId }).sort({ createdAt: -1 });
            }

            // Get application counts for each job
            const jobsWithApplicationCounts = await Promise.all(jobs.map(async (job) => {
                const applicationCount = await Application.countDocuments({ jobId: job._id });
                return {
                    ...job.toObject(), // Convert Mongoose document to plain object
                    applicationCount,   // Add applicationCount property
            };
        }));
        console.log(jobsWithApplicationCounts);
        return res.render('my-jobs', { user: req.user, jobs: jobsWithApplicationCounts, query });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    viewJob = async (req, res) => {
        try {
            const jobId = req.params.id;
    
            // Fetch job details
            const job = await Job.findById(jobId);
    
            // // Fetch associated bids
            // const bids = await Bid.find({ jobId }).populate('userId', 'name'); // Populate user name if desired
    
            return res.render('view-job', { user: req.user, job });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

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
            res.redirect(`/jobs/`); // Redirect back to the job details page
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to submit application');
        }
    }

    listJobApplications = async (req, res) => {
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
            res.redirect(`/jobs/`); // Redirect back to the job details page
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to submit application');
        }
    }
}