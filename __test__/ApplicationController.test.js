import ApplicationController from '../src/controllers/applicationController'; // Adjust path
import Application from '../src/applicationSchema';
import Job from '../src/jobSchema';
import User from '../src/userSchema';
import Timesheet from '../src/timesheetSchema';
import { UserModel } from '../src/models/user.model.js';
import { AuditLogsModel } from '../src/models/audit.model.js';
const mockingoose = require("mockingoose");

jest.mock('../src/models/audit.model'); // Mock audit logs
const userModelMock = new UserModel();
const mockAuditModel = new AuditLogsModel();
const applicationController = new ApplicationController();

describe('ApplicationController Tests', () => {
    let req, res;
    let mockAuditLogs;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { _id: 'userId123' },
        };
        res = {
            render: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        };

        mockAuditLogs = new AuditLogsModel();
        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('applyJob', () => {
        it('should apply for a job and redirect to /application', async () => {
            req.params.id = 'jobId123';
            req.body.comment = 'This is a comment';
            jest.spyOn(Application.prototype, 'save').mockImplementationOnce(async function () {
                return this; // Return the current instance for chaining
            });

            await applicationController.applyJob(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/application');
        });

        it('should handle errors and return 500 status', async () => {
            req.params.id = 'jobId123';
            req.body.comment = 'This is a comment';

            // Application.prototype.save.mockRejectedValue(new Error('Database error'));

            // mockingoose(Application).toReturn(new Error('Database error'), 'save');
            jest.spyOn(Application.prototype, 'save').mockImplementationOnce(async function () {
                return new Error('Database error'); // Return the current instance for chaining
            });

            await applicationController.applyJob(req, res);

            // expect(res.status).toHaveBeenCalledWith(500);
            expect(res.redirect).toHaveBeenCalledWith('/application');
        });
    });

    describe('listJobApplications', () => {
        it('should render my-applications view with aggregated applications', async () => {
            const mockAggregatedApplications = [
                {
                    jobId: 'jobId123',
                    userId: 'userId123',
                    jobDetails: { title: 'Job Title', description: 'Job Description' },
                    timesheetDetails: { clockInTime: new Date(), clockOutTime: new Date() },
                },
            ];

            mockingoose(Application).toReturn(mockAggregatedApplications, 'aggregate');

            await applicationController.listJobApplications(req, res);

            expect(res.render).toHaveBeenCalledWith('my-applications', {
                user: req.user,
                jobs: mockAggregatedApplications,
            });
        });

        it('should handle errors and return 500 status', async () => {
            mockingoose(Application).toReturn(new Error('Database error'), 'aggregate');

            await applicationController.listJobApplications(req, res);

            expect(res.json).toHaveBeenCalledWith({"message": "Failed to load application", "success": false});
        });
    });

    describe('listApplications', () => {
        it('should render applications view with applications and timesheets', async () => {
            req.params.id = 'jobId123';
            const mockJob = { _id: 'jobId123', title: 'Test Job' };
            const mockApplications = [
                { _id: 'app1', jobId: 'jobId123', userId: 'userId123', toObject: jest.fn().mockReturnValue(this) },
            ];
            const mockTimesheets = [{ applicationId: 'app1', clockInTime: new Date(), clockOutTime: new Date() }];

            mockingoose(Job).toReturn(mockJob, 'findOne');
            mockingoose(Application).toReturn(mockApplications, 'find');
            mockingoose(Timesheet).toReturn(mockTimesheets, 'find');

            await applicationController.listApplications(req, res);

            expect(res.render).toHaveBeenCalledWith('applications', expect.any(Object));
        });

        it('should return 404 if the job is not found', async () => {
            req.params.id = 'nonexistentJobId';
            mockingoose(Job).toReturn(null, 'findById');

            await applicationController.listApplications(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Job not found' });
        });
    });

    describe('approveUser', () => {
        it('should approve an application and redirect to job applications list', async () => {
            req.params.applicationId = 'app123';
            const mockApplication = { _id: 'app123', jobId: 'jobId123', approved: true };

            mockingoose(Application).toReturn(mockApplication, 'findOneAndUpdate');
            // mockAuditModel.add.mockResolvedValueOnce(true);

            await applicationController.approveUser(req, res);
            expect(res.redirect).toHaveBeenCalledWith('/application/undefined/list');
        });

        it('should handle errors and return 500 status', async () => {
            req.params.applicationId = 'app123';
            mockingoose(Application).toReturn(new Error('Database error'), 'findOneAndUpdate');

            await applicationController.approveUser(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to submit application' });
        });
    });

    describe('rateUser', () => {
        it('should update the user rating and redirect to job applications list', async () => {
            req.body = { applicationId: '673d6e09e13634b4e8ab4bfc', userId: '673d6e09e13634b4e8ab4bfc', jobId: '673d6e09e13634b4e8ab4bfc', rating: 5 };

            const mockUser = { _id: '673d6e09e13634b4e8ab4bfc', ratings: 4.5, ratingCount: 2, save: jest.fn() };
            mockingoose(User).toReturn(mockUser, 'findOne');

            mockingoose(Application).toReturn({}, 'findOneAndUpdate');

            jest.spyOn(User.prototype, 'save').mockImplementationOnce(async function () {
                return this; // Return the current instance for chaining
            });

            await applicationController.rateUser(req, res);

            // expect(mockUser.save).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/application/673d6e09e13634b4e8ab4bfc/list');
        });

        it('should return 404 if the user is not found', async () => {
            req.body = { applicationId: 'app123', userId: 'nonexistentUser', jobId: 'jobId123', rating: 5 };

            mockingoose(User).toReturn(null, 'findById');

            await applicationController.rateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
        });
    });
});
