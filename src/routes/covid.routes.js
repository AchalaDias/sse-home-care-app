import express from 'express';
import CovidController from '../controllers/covidController.js';
import { checkAuthenticated } from '../../config/passport.js';

const covidontroller = new CovidController();

const UserRouter = express.Router();

// Application Routes
UserRouter.get('/', checkAuthenticated, covidontroller.view);
UserRouter.post('/update-covid-status', checkAuthenticated, covidontroller.updateCovidDate);

export default UserRouter;