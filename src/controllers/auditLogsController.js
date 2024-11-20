import { AuditLogsModel } from '../models/audit.model.js';

const auditModel = new AuditLogsModel();

export default class CovidController {
    view = async (req, res) => {
        try {
            const logs = await auditModel.find();
            return res.render('logs-admin', { user: req.user, logs });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

}