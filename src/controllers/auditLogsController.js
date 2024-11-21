import { AuditLogsModel } from '../models/audit.model.js';

const auditModel = new AuditLogsModel();

export default class AuditController {
    view = async (req, res) => {
        try {
            const logs = await auditModel.find();
            return res.render('logs-admin', { user: req.user, logs, query: '' });
        } catch (error) {
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

    search = async (req, res) => {
        try {
            const query = req.query.q || '';
            const logs = await auditModel.search(query)
            return res.render('logs-admin', { user: req.user, logs, query });
        } catch (error) {
            res.status(500).json({ success: false, message: "Clock-in failed" });
        }
    }

}