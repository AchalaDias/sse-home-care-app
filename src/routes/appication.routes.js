import express from 'express';
import AppicationController from '../controllers/applicationController.js';
import { checkAuthenticated } from '../../config/passport.js';

const applicationController = new AppicationController();

const UserRouter = express.Router();

// Application Routes
UserRouter.get('/', checkAuthenticated, applicationController.listJobApplications);
UserRouter.post('/:id', checkAuthenticated, applicationController.applyJob);

export default UserRouter;