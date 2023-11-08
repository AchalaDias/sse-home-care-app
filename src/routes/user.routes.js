import express from 'express';
import UserController from '../controllers/userController.js';
import { checkAuthenticated } from '../../config/passport.js';

const userController = new UserController();

const UserRouter = express.Router();

// Auth Routes

UserRouter.get('/reset-password/:token', userController.getResetForm);
UserRouter.post('/reset-password/:token', userController.postReset);

UserRouter.post('/user-reset-pass/:id', checkAuthenticated, userController.reset);
export default UserRouter;