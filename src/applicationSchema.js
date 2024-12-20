import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timesheets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Timesheet' }], 
    comment: { type: String }, 
    approved: { type: Boolean, default: false },
    ratingSubmitted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', ApplicationSchema);