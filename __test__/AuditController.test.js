import AuditController from '../src/controllers/auditLogsController.js'; // Adjust the path
import { AuditLogsModel } from '../src/models/audit.model.js';

jest.mock('../src/models/audit.model'); // Mock the AuditLogsModel
const mockAuditModel = new AuditLogsModel();
const auditController = new AuditController();
describe('AuditController Tests', () => {
    let req, res;
    beforeEach(() => {
        // Mock request and response objects
        req = {
            user: { _id: 'userId123' },
            query: {},
        };
        res = {
            render: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        // jest.clearAllMocks();
    });

    describe('view', () => {
        it('should render logs-admin view with audit logs', async () => {
            const mockLogs = [
                { _id: 'log1', action: 'User login', timestamp: new Date() },
                { _id: 'log2', action: 'Password reset', timestamp: new Date() },
            ];

            // Mock auditModel.find to return mock logs
            mockAuditModel.find.mockResolvedValue(mockLogs);

            await auditController.view(req, res);

            // Assertions
            expect(res.render).toHaveBeenCalledWith('logs-admin', expect.any(Object));
        });

        it('should handle errors and return a 500 status', async () => {
            // Mock auditModel.find to throw an error
            AuditLogsModel.prototype.find.mockRejectedValue(new Error('Database error'));
            await auditController.view(req, res);

            // Assertions
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Clock-in failed' });
        });
    });

    describe('search', () => {
        it('should search audit logs based on a query', async () => {
            req.query.q = 'User login';
            const mockLogs = [
                { _id: 'log1', action: 'User login', timestamp: new Date() },
            ];

            // Mock auditModel.search to return filtered logs
            mockAuditModel.search.mockResolvedValue(mockLogs);

            await auditController.search(req, res);

            // Assertions
            expect(res.render).toHaveBeenCalledWith('logs-admin', expect.any(Object));
        });

        it('should handle errors and return a 500 status', async () => {
            req.query.q = 'User login';

            // Mock auditModel.search to throw an error
            AuditLogsModel.prototype.search.mockRejectedValue(new Error('Database error'));

            await auditController.search(req, res);

            // Assertions
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Clock-in failed' });
        });
    });
});
