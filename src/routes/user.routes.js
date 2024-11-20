import express from 'express';
import UserController from '../controllers/userController.js';
import AuditLogsController from '../controllers/auditLogsController.js';
import { checkAuthenticated } from '../../config/passport.js';
import path from 'path';

// Import your multer setup
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// const upload = multer({ storage: storage });

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Accept only PDF files
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed!"), false);
      }
    },
  });

const userController = new UserController();
const auditLogsController = new AuditLogsController();

const UserRouter = express.Router();

// Auth Routes

UserRouter.get('/reset-password/:token', userController.getResetForm);
UserRouter.post('/reset-password/:token', userController.postReset);

UserRouter.post('/user-reset-pass/:id', checkAuthenticated, userController.reset);

UserRouter.get('/profile',checkAuthenticated, userController.profile);
UserRouter.post('/verification',checkAuthenticated, upload.single("pdfFile"), userController.verifyUser);

UserRouter.get('/users',checkAuthenticated, userController.users);
UserRouter.post('/approve',checkAuthenticated, userController.approve);
UserRouter.get('/logs',checkAuthenticated, auditLogsController.view);
UserRouter.get('/logs/search',checkAuthenticated, auditLogsController.search);

export default UserRouter;