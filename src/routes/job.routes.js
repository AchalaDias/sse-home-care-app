import express from 'express';
import JobController from '../controllers/jobController.js';
import { checkAuthenticated } from '../../config/passport.js';
import path from 'path';

// Import your multer setup
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

const jobController = new JobController();

const UserRouter = express.Router();

// Job Routes
UserRouter.get('/create-job', checkAuthenticated, jobController.viewCreateJob);
UserRouter.post('/create-job', upload.array('images', 10), checkAuthenticated, jobController.createJob);

UserRouter.get('/find-job', checkAuthenticated, jobController.viewFindJob);
UserRouter.get('/search-jobs', checkAuthenticated, jobController.searchJob);

UserRouter.get('/delete-job/:id', checkAuthenticated, jobController.deleteJob);
UserRouter.get('/my-jobs', checkAuthenticated, jobController.myJobs);


export default UserRouter;