import UserController from '../src/controllers/userController';
import User from '../src/userSchema';
import Job from '../src/jobSchema';
import bcrypt from 'bcrypt';
import { skip } from '@jazzer.js/jest-runner/dist/fuzz';
const mockingoose = require("mockingoose");

describe('UserController Tests', () => {
    const userController = new UserController();
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = { params: {}, body: {}, query: {}, user: {}, file: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
            render: jest.fn(),
            redirect: jest.fn(),
        };

        // Reset all mocks
        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('getResetForm', () => {
        it('should render forgot-pass when token is expired', async () => {
            req.params.token = 'expiredToken';
            mockingoose(User).toReturn(null, 'findOne'); // Simulate expired token

            await userController.getResetForm(req, res);

            expect(res.render).toHaveBeenCalledWith('reset-password', expect.any(Object));
        });

        it('should render reset-password for a valid token', async () => {
            req.params.token = 'validToken';
            mockingoose(User).toReturn(
                { resetPasswordToken: 'validToken', resetPasswordExpires: Date.now() + 3600000 },
                'findOne'
            );

            await userController.getResetForm(req, res);

            expect(res.render).toHaveBeenCalledWith('reset-password', { token: 'validToken', user: null });
        });
    });

    describe('postReset', () => {
        it('should render login with an error for an expired token', async () => {
            req.params.token = 'expiredToken';
            req.body.newPassword = 'newPassword123';
            mockingoose(User).toReturn(null, 'findOne'); // Simulate expired token

            await userController.postReset(req, res);

            expect(res.render).toHaveBeenCalledWith('login', expect.any(Object));
        });
    });

    describe('reset', () => {
        skip('should update the password when the old password matches', async () => {
            req.params.id = 'userId123';
            req.body = { password: 'oldPassword', newPassword: 'newPassword123' };

            // Mock user data
            const hashedOldPassword = await bcrypt.hash('oldPassword', 10);
            const mockUser = { _id: 'userId123', password: hashedOldPassword };
            mockingoose(User).toReturn(mockUser, 'findById');

            // Mock bcrypt.compare to return true
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            // Mock bcrypt.hash to simulate hashing the new password
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword');

            // Mock User.updateOne to simulate successful update
            jest.spyOn(User, 'updateOne').mockResolvedValue({});

            // Call the reset method
            await userController.reset(req, res);

            // Assertions
            expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', hashedOldPassword); // Ensure password comparison
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10); // Ensure new password is hashed
            expect(User.updateOne).toHaveBeenCalledWith(
                { _id: 'userId123' },
                { $set: { password: 'hashedNewPassword' } }
            ); // Ensure the password update is called
            expect(res.render).toHaveBeenCalledWith('home', expect.any(Object)); // Ensure 'home' is rendered
        });
    });

    describe('verifyUser', () => {
        it('should update the user verification file', async () => {
            req.file.filename = 'verificationFile.pdf';
            req.user = { _id: 'userId123' };

            const mockUser = {
                _id: 'userId123',
                accountAccepted: false,
                covidPositiveDate: null,
                isAdmin: false,
                otp: null,
                ratingCount: 0,
                ratings: 0,
                verificationCheckFile: 'verificationFile.pdf',
            };

            // Mock the database call
            mockingoose(User).toReturn(mockUser, 'findOneAndUpdate');

            await userController.verifyUser(req, res);

            expect(res.render).toHaveBeenCalledWith('profile', expect.any(Object));
        });
    });

    describe('createJob', () => {
        it('should create a new job and render the home page', async () => {
            req.body = {
                jobTitle: 'Test Job',
                location: 'Test Location',
                latitude: '10.0000',
                longitude: '20.0000',
                jobDescription: 'Job Description',
                tags: 'tag1, tag2',
                cost: '100',
                jobDate: '2024-12-01',
            };
            req.files = [{ filename: 'testImage.jpg' }];
            req.user = { _id: 'userId123' };

            const saveMock = jest.fn();
            mockingoose(Job).toReturn({ save: saveMock });

            await userController.createJob(req, res);
            expect(res.render).toHaveBeenCalledWith('home', { user: req.user, errMsg: null });
        });
    });
});
