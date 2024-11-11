import express from 'express';
import UserController from '../controllers/userController.js';
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

const userController = new UserController();

const UserRouter = express.Router();

// Auth Routes

UserRouter.get('/reset-password/:token', userController.getResetForm);
UserRouter.post('/reset-password/:token', userController.postReset);

UserRouter.post('/user-reset-pass/:id', checkAuthenticated, userController.reset);

UserRouter.get('/profile',checkAuthenticated, userController.profile);
UserRouter.get('/create-job', checkAuthenticated, userController.viewCreateJob);
UserRouter.post('/create-job', upload.array('images', 10), checkAuthenticated, userController.createJob);

UserRouter.get('/find-job', checkAuthenticated, userController.viewFindJob);
UserRouter.get('/search-jobs', checkAuthenticated, userController.searchJob);


export default UserRouter;