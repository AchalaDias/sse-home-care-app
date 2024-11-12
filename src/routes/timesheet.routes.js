import express from 'express';
import TimesheetController from '../controllers/timesheetController.js';
import { checkAuthenticated } from '../../config/passport.js';

const timesheetController = new TimesheetController();

const UserRouter = express.Router();

// Application Routes
UserRouter.post('/clockin', checkAuthenticated, timesheetController.clockin);
UserRouter.post('/clockout', checkAuthenticated, timesheetController.clockout);

export default UserRouter;