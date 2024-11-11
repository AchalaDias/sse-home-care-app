import express from 'express';
import passport from 'passport';

// File imports
import AuthController from '../controllers/authController.js';
import { checkAuthenticated, checkNotAuthenticated } from '../../config/passport.js';
import { verifyCaptcha } from '../middlewares/reCaptcha.js';
import verifyGoogle from '../../config/googleAuth.js';

const authController = new AuthController();

const AuthRouter = express.Router();
// loading google auth configuration
verifyGoogle(passport);

// Auth Routes
AuthRouter.get('/register', checkNotAuthenticated, (req, res) => { return res.render('register', { user: null }); })
AuthRouter.post('/register', checkNotAuthenticated, verifyCaptcha, authController.register);
AuthRouter.get('/login', checkNotAuthenticated, (req, res) => { return res.render('login', { user: null }); })
AuthRouter.post('/login', checkNotAuthenticated, verifyCaptcha, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

AuthRouter.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
AuthRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

AuthRouter.get('/forgot-password', (req, res) => { res.render('forgot-pass'); })
AuthRouter.post('/forgot-password', authController.forgot_password);
AuthRouter.get('/logout', checkAuthenticated, authController.logout);

export default AuthRouter;