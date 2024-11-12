import { UserModel } from '../models/user.model.js';
import Job from '../jobSchema.js';
import Application from '../applicationSchema.js';
import Timesheet from '../timesheetSchema.js';
import User from '../userSchema.js';
import sendMail from '../../config/mailer.js';

const userModel = new UserModel();

export default class TimesheetController {
    clockin = async (req, res) => {
        try {
            const { jobId, applicationId } = req.body;

            // Create a new timesheet entry for clock in
            const timesheet = new Timesheet({
                userId: req.user._id,
                jobId: jobId,
                applicationId: applicationId,
                clockInTime: new Date(),
                clockInSet: true
            });

            await timesheet.save();
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

    clockout = async (req, res) => {
        try {
            const userId = req.user._id;

            const { jobId, applicationId } = req.body;
    
            // Find the active timesheet entry and update with clock out time
            const timesheet = await Timesheet.findOneAndUpdate(
                { applicationId: applicationId, jobId: jobId, },
                { clockOutTime: new Date(), clockOutSet: true }
            );
    
            if (!timesheet) {
                return res.status(404).json({ success: false, message: "No active clock-in found for this job" });
            }
    
            res.json({ success: true, message: "Clocked out successfully", timesheet });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to clock out" });
        }
    }
}