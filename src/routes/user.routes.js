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



export default UserRouter;