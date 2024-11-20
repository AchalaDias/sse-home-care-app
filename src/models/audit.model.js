import AuditLogs from "../auditSchema.js";

export class AuditLogsModel {

    async add(uid, logs) {
        try {
            const log = new AuditLogs({
                userId: uid,
                log: logs,
            });
            await log.save();
            return true;
        } catch (error) {
            console.log(error);
        }
    }

    async find() {
        try {
            const logs = await AuditLogs.find({});
            return logs;
        } catch (error) {
            console.log(error);
        }
    }

    async search(query) {
        try {
            const logs = await AuditLogs.find({
                $or: [
                    { log: { $regex: query, $options: 'i' } }
                ],
            }).sort({ createdAt: -1 });
            return logs;
        } catch (error) {
            console.log(error);
        }
    }
}