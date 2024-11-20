import mongoose from 'mongoose';

const AuditLogsSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    log: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }, 
});

export default mongoose.model('AuditLogs', AuditLogsSchema);