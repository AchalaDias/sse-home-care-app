import mongoose from 'mongoose';

const TimesheetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    clockInTime: { type: Date, required: true },
    clockInSet: { type: Boolean, required: true, default: false },
    clockOutTime: { type: Date, default: null },
    clockOutSet: { type: Boolean, required: true, default: false },
});

export default mongoose.model('Timesheet', TimesheetSchema);