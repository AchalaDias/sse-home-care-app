import CovidController from '../src/controllers/covidController.js'; // Adjust the path
import Covid from '../src/covidSchema.js';
import User from '../src/userSchema.js';
import Timesheet from '../src/timesheetSchema.js';
import sendMail from '../config/mailer.js';
import { AuditLogsModel } from '../src/models/audit.model.js';
const mockingoose = require("mockingoose");

jest.mock('../config/mailer.js'); // Mock the mailer
jest.mock('../src/models/audit.model.js'); // Mock the audit logs model
const auditLogsMock = new AuditLogsModel();

describe('CovidController Tests', () => {
    const covidController = new CovidController();
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {},
            params: {},
            query: {},
            user: { _id: 'userId123' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            render: jest.fn(),
        };

        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('view', () => {
        it('should render the covid view with notifications', async () => {
            const mockNotifications = [
                { _id: 'notification1', userId: "id01", message: 'You may have been exposed to COVID-19' },
                { _id: 'notification2', userId: "id02", message: 'Please isolate for 14 days' },
            ];

            // Mock Covid.find to return mock notifications
            mockingoose(Covid).toReturn(mockNotifications, 'find');

            await covidController.view(req, res);

            expect(res.render).toHaveBeenCalledWith('covid', {
                user: req.user,
                notifications: expect.any(Array),
            });
        });

        it('should handle errors and return a 500 status', async () => {
            // Mock Covid.find to throw an error
            mockingoose(Covid).toReturn(new Error('Database error'), 'find');

            await covidController.view(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Clock-in failed' });
        });
    });

    describe('updateCovidDate', () => {
        // it('should update COVID-positive date and send notifications', async () => {
        //     req.body = { covidPositiveDate: '2024-11-01' };
        //     req.params.id = 'jobId123';
        //     req.user._id = 'userId123';

        //     // Mock User.findByIdAndUpdate to simulate updating the user's COVID-positive date
        //     mockingoose(User).toReturn({ _id: 'userId123', covidPositiveDate: '2024-11-01' }, 'findOneAndUpdate');

        //     // Mock Timesheet.find to return timesheets with job information
        //     mockingoose(Timesheet).toReturn(
        //         [
        //             { _id: 'timesheet1', jobId: { userId: 'userId124', title: 'Job 1' } },
        //             { _id: 'timesheet2', jobId: { userId: 'userId125', title: 'Job 2' } },
        //         ],
        //         'find'
        //     );

        //     // Mock User.find to return users with emails
        //     mockingoose(User).toReturn(
        //         [
        //             { _id: 'userId124', email: 'user124@example.com', name: 'User 124' },
        //             { _id: 'userId125', email: 'user125@example.com', name: 'User 125' },
        //         ],
        //         'find'
        //     );

        //     // Mock Covid.save for notifications
        //     mockingoose(Covid).toReturn({ _id: 'covidNotification1' }, 'save');

        //     await covidController.updateCovidDate(req, res);

        //     // Assertions
        //     //   expect(sendMail.sendCovidAlert).toHaveBeenCalledTimes(2); // Ensure emails are sent
        //     //   expect(sendMail.sendCovidAlert).toHaveBeenCalledWith('user124@example.com'); // Email sent to user124
        //     //   expect(sendMail.sendCovidAlert).toHaveBeenCalledWith('user125@example.com'); // Email sent to user125

        //     //   expect(auditLogsMock.add).toHaveBeenCalledWith(
        //     //     'userId123',
        //     //     'Covid sataus updated'
        //     //   ); // Ensure audit log is added

        //     expect(res.json).toHaveBeenCalledWith({ success: true }); // Ensure success response
        // });

        it('should handle errors and return a 500 status', async () => {
            req.body = { covidPositiveDate: '2024-11-01' };

            // Mock User.findByIdAndUpdate to throw an error
            mockingoose(User).toReturn(new Error('Database error'), 'findOneAndUpdate');

            await covidController.updateCovidDate(req, res);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(500); // Ensure 500 status
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Clock-in failed' }); // Ensure error response
        });
    });
});
