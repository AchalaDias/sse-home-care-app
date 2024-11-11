import User from "../userSchema.js";
import Job from '../jobSchema.js';

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
            res.redirect('/job/find-job');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}