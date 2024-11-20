import TimesheetController from '../src/controllers/timesheetController.js'; // Adjust path
import Timesheet from '../src/timesheetSchema.js';
import { AuditLogsModel } from '../src/models/audit.model.js';
const mockingoose = require("mockingoose");

jest.mock('../src/models/audit.model.js'); // Mock auditLogs
const auditLogsMock = new AuditLogsModel();

describe('TimesheetController Tests', () => {
    const timesheetController = new TimesheetController();
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {},
            user: { _id: '673d6e09e13634b4e8ab4bfc' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('clockin', () => {
        it('should create a new timesheet and log the clock-in', async () => {
            // Setup request body
            req.body = {
                jobId: '673d6e09e13634b4e8ab4bfc',
                applicationId: '673d6e09e13634b4e8ab4bfc',
            };

            const saveMock = jest.fn();
            mockingoose(Timesheet).toReturn({ save: saveMock });
            await timesheetController.clockin(req, res);

            // Assertions
            expect(res.json).toHaveBeenCalledWith({ success: true }); // Check response
        });

        it('should return a 500 status on error', async () => {
            // Mock Timesheet.save to throw an error
            mockingoose(Timesheet).toReturn(new Error('Database save failed'), 'save');

            // Call the controller method
            await timesheetController.clockin(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500); // Check status
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Clock-in failed',
            });
        });
    });

    describe('clockout', () => {
        it('should update the timesheet and log the clock-out', async () => {
            // Setup request body
            req.body = {
                "jobId": '673d6e09e13634b4e8ab4bfc',
                "applicationId": '673d6e09e13634b4e8ab4bfc',
            };

            const mockUser = {
                _id: '673d6e09e13634b4e8ab4bfc',
                userId: '673d6e09e13634b4e8ab4bfc',
                jobId: '673d6e09e13634b4e8ab4bfc',
                applicationId: 'applicationId123',
                clockOutTime: new Date(),
                clockOutSet: true,
            };

            // Mock the database call
            mockingoose(Timesheet).toReturn(mockUser, 'findOneAndUpdate');

            // Call the controller method
            await timesheetController.clockout(req, res);

            // Assertions
            expect(res.json).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should return a 404 status if no active clock-in is found', async () => {
            // Mock Timesheet.findOneAndUpdate to return null
            mockingoose(Timesheet).toReturn(null, 'findOneAndUpdate');

            // Call the controller method
            await timesheetController.clockout(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(404); // Check status
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No active clock-in found for this job',
            });
        });

        it('should return a 500 status on error', async () => {
            // Mock Timesheet.findOneAndUpdate to throw an error
            mockingoose(Timesheet).toReturn(new Error('Database update failed'), 'findOneAndUpdate');

            // Call the controller method
            await timesheetController.clockout(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500); // Check status
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to clock out',
            });
        });
    });
});
