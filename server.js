// Module imports
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import flash from 'express-flash';
// File Imports
import connectTodb from './config/mongoose.js';
import AuthRouter from './src/routes/auth.routes.js';
import initialize, { checkAuthenticated } from './config/passport.js';
import UserRouter from './src/routes/user.routes.js';
import JobRouter from './src/routes/job.routes.js';
import expressEjsLayouts from 'express-ejs-layouts';

// Initialization
initialize(passport);

// Instantiate express app
const app = express();

// Middleware to parse json data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
// Configure express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());

// Configure ejs view engine & its path
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src', 'views'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(expressEjsLayouts);

// Setting up routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render('home', { user: req.user, errMsg: null })
})
app.use('/auth', AuthRouter);
app.use('/user', UserRouter);
app.use('/job', JobRouter);

// listen to express server
app.listen(8080, () => {
    connectTodb();
    console.log('Server is running on http://localhost:8080');
})