import JobController from '../src/controllers/jobController.js'; // Adjust path
import User from '../src/userSchema';
import Job from '../src/jobSchema';
import Application from '../src/applicationSchema';
import { AuditLogsModel } from '../src/models/audit.model.js';
const mockingoose = require("mockingoose");

jest.mock('../src/models/audit.model.js'); // Mock auditLogs
const auditLogsMock = new AuditLogsModel();

describe('JobController Tests', () => {
    const jobController = new JobController();
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {},
            params: {},
            query: {},
            user: { _id: '673d6e09e13634b4e8ab4bfc' },
            files: [],
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            render: jest.fn(),
            redirect: jest.fn(),
        };

        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('viewCreateJob', () => {
        it('should render create-job view', async () => {
            req.params.id = '673d6e09e13634b4e8ab4bfc';
            mockingoose(User).toReturn({ _id: 'userId123' }, 'findById');

            await jobController.viewCreateJob(req, res);

            expect(res.render).toHaveBeenCalledWith('create-job', {
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
                user: req.user,
                errMsg: null,
            });
        });
    });

    describe('createJob', () => {
        it('should create a new job and log the creation', async () => {
            req.body = {
                jobTitle: 'Test Job',
                location: 'Test Location',
                latitude: '10.123',
                longitude: '20.456',
                jobDescription: 'Test Description',
                tags: 'tag1, tag2',
                cost: '100',
                jobDate: '2024-11-21',
            };
            req.files = [{ filename: 'test.jpg', mimetype: 'image/jpeg' }];

            mockingoose(Job).toReturn({ save: jest.fn() }, 'save');

            await jobController.createJob(req, res);

            expect(res.render).toHaveBeenCalledWith('home', { user: req.user, errMsg: null });
        });

        it('should render error for invalid image format', async () => {
            req.body = {
                jobTitle: 'Test Job',
                location: 'Test Location',
                latitude: '10.123',
                longitude: '20.456',
                jobDescription: 'Test Description',
                tags: 'tag1, tag2',
                cost: '100',
                jobDate: '2024-11-21',
            };
            req.files = [{ filename: 'test.txt', mimetype: 'text/plain' }];

            await jobController.createJob(req, res);

            expect(res.render).toHaveBeenCalledWith('home', { user: req.user, errMsg: 'Invalid image format' });
        });
    });

    describe('viewFindJob', () => {
        it('should render find-jobs with available jobs', async () => {
            req.query.q = 'Test';
            mockingoose(Application).toReturn(['jobId1', 'jobId2'], 'find');
            mockingoose(Job).toReturn(
                [
                    { _id: 'jobId3', title: 'Test Job', tags: ['tag1'], userId: 'anotherUser' },
                ],
                'find'
            );

            await jobController.viewFindJob(req, res);

            expect(res.render).toHaveBeenCalledWith('find-jobs', {
                user: req.user,
                jobs: expect.any(Array),
                query: 'Test',
            });
        });
    });

    describe('deleteJob', () => {
        it('should delete a job and log the deletion', async () => {
            req.params.id = 'jobId123'; 
            req.user._id = 'userId123';

            // Mock Job.findById to return a job created by the user
            mockingoose(Job).toReturn({ _id: 'jobId123', userId: 'userId123', title: 'Test Job', }, 'findOne');
            mockingoose(Job).toReturn(null, 'deleteOne');

            await jobController.deleteJob(req, res);
            expect(res.redirect).toHaveBeenCalledWith('/job/my-jobs'); // Ensure redirection
        });

        it('should return 404 if the job is not found', async () => {
            req.params.id = 'jobId123';
            mockingoose(Job).toReturn(null, 'findById');

            await jobController.deleteJob(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Job not found' });
        });

        it('should return 403 if the user is not authorized', async () => {
            req.params.id = 'jobId123'; 
            req.user._id = 'userId123'; 
            mockingoose(Job).toReturn(
              {
                _id: 'jobId123',
                userId: 'anotherUserId',
                title: 'Test Job',
              },
              'findOne'
            );
          
            await jobController.deleteJob(req, res);
          
            // Assertions
            expect(res.status).toHaveBeenCalledWith(403); // Ensure the 403 status is returned
            expect(res.json).toHaveBeenCalledWith({ message: 'You are not authorized to delete this job' });
        });
    });

    describe('myJobs', () => {
        it('should render my-jobs with user-created jobs and application counts', async () => {
            mockingoose(Job).toReturn(
                [
                    { _id: 'jobId1', title: 'Job 1' },
                    { _id: 'jobId2', title: 'Job 2' },
                ],
                'find'
            );
            mockingoose(Application).toReturn(2, 'countDocuments'); // Simulate 2 applications per job

            await jobController.myJobs(req, res);

            expect(res.render).toHaveBeenCalledWith('my-jobs', {
                user: req.user,
                jobs: expect.any(Array),
                query: null,
            });
        });
    });

    describe('applyJob', () => {
        it('should apply for a job and redirect to jobs page', async () => {
            req.params.id = '673d6e09e13634b4e8ab4bfc';
            req.body.comment = 'I am interested';

            mockingoose(Application).toReturn({ save: jest.fn() }, 'save');

            await jobController.applyJob(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/jobs/');
        });
    });
});
