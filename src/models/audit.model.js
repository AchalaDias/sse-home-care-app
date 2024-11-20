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
}