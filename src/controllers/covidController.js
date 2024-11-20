import { UserModel } from '../models/user.model.js';
import Job from '../jobSchema.js';
import Application from '../applicationSchema.js';
import Timesheet from '../timesheetSchema.js';
import User from '../userSchema.js';
import Covid from '../covidSchema.js';
import sendMail from '../../config/mailer.js';



export default class CovidController {
    view = async (req, res) => {
        try {
            const notifications = await Covid.find({ userId: req.user._id });
            console.log(notifications)
            return res.render('covid', { user: req.user, notifications: [{ createdAt: "2024-10-12", message: "sdfs" }] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

    updateCovidDate = async (req, res) => {
        try {
            const { covidPositiveDate } = req.body;
            const userId = req.user._id;

            console.log(covidPositiveDate)
            // Update user's COVID-positive date
            await User.findByIdAndUpdate(userId, { covidPositiveDate: new Date(covidPositiveDate) });

            const covid = new Covid({
                userId: req.user._id,
                message: "You may have been exposed to COVID-19. A user who attended to a job on has reported testing positive."
            });
            await covid.save()
            // Trigger timesheet check for the past 14 days
            // await checkAndNotifyContacts(userId, new Date(covidPositiveDate));
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

}