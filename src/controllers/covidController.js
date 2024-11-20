import { UserModel } from '../models/user.model.js';
import User from '../userSchema.js';
import Covid from '../covidSchema.js';
import sendMail from '../../config/mailer.js';
import { AuditLogsModel } from '../models/audit.model.js';
import Timesheet from '../timesheetSchema.js';

const auditLogs = new AuditLogsModel();

const COVID_MESSAGE = "You may have been exposed to COVID-19. A user who attended to a job on has reported testing positive.";

export default class CovidController {
    view = async (req, res) => {
        try {
            const notifications = await Covid.find({ userId: req.user._id });
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

            // Update user's COVID-positive date
            await User.findByIdAndUpdate(userId, { covidPositiveDate: new Date(covidPositiveDate) });

            const covid = new Covid({
                userId: req.user._id,
                message: COVID_MESSAGE
            });
            await covid.save()
            auditLogs.add(userId, "Covid sataus updated");

            // Trigger timesheet check for the past 14 days

            // Calculate the date range
            const startDate = new Date(covidPositiveDate);
            const endDate = new Date(covidPositiveDate);
            endDate.setDate(endDate.getDate() - 14);

            const timesheets = await Timesheet.find({
                userId: userId,
            })
                .populate({
                    path: 'jobId',
                    select: 'title userId',
                })
                .exec();

            // Extract unique userIds from the job
            const userIds = [...new Set(timesheets.map((ts) => ts.jobId.userId))];

            // Fetch user details (emails) from the User collection
            const users = await User.find({ _id: { $in: userIds } }).select('email name');

            // Send emails to the fetched users
            users.map((user) => sendMail.sendCovidAlert(user.email, COVID_MESSAGE));

            // await checkAndNotifyContacts(userId, new Date(covidPositiveDate));
            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

}