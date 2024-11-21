import AuthController from '../src/controllers/authController.js'; // Adjust path
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../src/userSchema';
import { UserModel } from '../src/models/user.model.js';
import sendMail from '../config/mailer.js';
import { AuditLogsModel } from '../src/models/audit.model.js';
const mockingoose = require("mockingoose");

jest.mock('../config/mailer.js'); // Mock the mailer
jest.mock('../src/models/audit.model.js'); // Mock audit logs
jest.mock('../src/models/user.model.js'); // Mock user model
const auditLogsMock = new AuditLogsModel();
const userModelMock = new UserModel();

describe('AuthController Tests', () => {
    const authController = new AuthController();
    let req, res;

    beforeEach(() => {
        // Mock request and response objects
        req = {
            body: {},
            params: {},
            query: {},
            user: { _id: '673d6e09e13634b4e8ab4bfc' },
            logout: jest.fn(),
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            render: jest.fn(),
            redirect: jest.fn(),
            clearCookie: jest.fn(),
        };

        jest.clearAllMocks();
        mockingoose.resetAll();
    });

    describe('register', () => {
        it('should register a user and redirect to login', async () => {
            req.body = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            userModelMock.add.mockResolvedValueOnce(true);
            await authController.register(req, res);
            expect(res.redirect).toHaveBeenCalledWith('/auth/login');
        });
    });

    describe('login', () => {
        it('should login the user with valid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };

            const mockUser = { _id: 'userId123', email: 'test@example.com', password: 'hashedPassword123' };
            userModelMock.verify.mockResolvedValue(mockUser);

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true); // Mock password comparison

            await authController.login(req, res);
            expect(res.render).toHaveBeenCalledWith('login', expect.any(Object));
        });

        it('should render error for invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'wrongPassword' };

            userModelMock.verify.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.render).toHaveBeenCalledWith('login', { errorMsg: 'Incorrect Credentials.' });
        });
    });

    describe('verifyOtp', () => {
        it('should verify OTP and render home on success', async () => {
            req.body = { otp: '123456', userId: 'userId123' };

            const mockUser = { _id: 'userId123', email: 'test@example.com', otp: '123456' };
            UserModel.prototype.verifyOtp.mockResolvedValue(mockUser);

            await authController.verifyOtp(req, res);
            expect(res.render).toHaveBeenCalledWith('home', expect.any(Object));
        });

        it('should render error for invalid OTP', async () => {
            req.body = { otp: 'wrongOtp', userId: 'userId123' };
            UserModel.prototype.verifyOtp.mockResolvedValue(null);

            await authController.verifyOtp(req, res);

            expect(res.render).toHaveBeenCalledWith('otp', { userId: 'userId123', user: null, errorMsg: 'Incorrect OTP.' });
        });
    });

    describe('logout', () => {
        it('should logout the user and redirect to login', async () => {
            req.logout.mockImplementation((callback) => callback());

            await authController.logout(req, res);

            expect(req.logout).toHaveBeenCalled();
            expect(res.clearCookie).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/auth/login');
        });
    });

    describe('forgot_password', () => {
        it('should send password reset email for a valid user', async () => {
            req.body = { email: 'test@example.com' };

            const mockUser = { _id: '673d6e09e13634b4e8ab4bfc', email: 'test@example.com', resetPasswordToken: null, resetPasswordExpires: null, save: jest.fn() };
            mockingoose(User).toReturn(mockUser, 'findOne');
            jest.spyOn(User.prototype, 'save').mockImplementationOnce(async function () {
                return this; // Return the current instance for chaining
            });

            await authController.forgot_password(req, res);
            expect(res.render).toHaveBeenCalledWith('login', {
                user: null,
                successMsg: 'Password reset link has been successfully sent to your email address',
            });
        });

        it('should render error if the user is not found', async () => {
            req.body = { email: 'nonexistent@example.com' };

            mockingoose(User).toReturn(null, 'findOne');

            await authController.forgot_password(req, res);

            expect(res.render).toHaveBeenCalledWith('forgot-pass', { errorMsg: 'Email not found' });
        });
    });

    describe('createAdmin', () => {
        it('should create an admin user and return success', async () => {
            req.body = { username: 'admin', email: 'admin@example.com', password: 'admin123' };

            userModelMock.add.mockResolvedValueOnce(true);

            await authController.createAdmin(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });
});
