# User Authentication Web Application

This is a user authentication web application that allows users to sign up, sign in, sign out, reset their password, and use Google for authentication. Additionally, it includes a bonus feature for handling forgotten passwords.

## Table of Contents

- Features
- Technologies Used
- Installation
- Project Structure
- Usage
- Implementation
- Security
- Bonus Feature
- Recaptcha
- License

## Features

- **Sign Up with Email**: Users can sign up with their email address and create a new account. The password is securely encrypted and stored in the database.
- **Sign In**: Registered users can sign in using their email and password. After signing in, they are redirected to a blank home page with options to sign out and reset their password.
- **Sign Out**: Users can log out of their accounts to securely end their session.
- **Reset Password**: After signing in, users can reset their password for added security.
- **Google Login/Signup (Social Authentication)**: Users can choose to sign up or log in using their Google account, leveraging social authentication.
- **Notifications**: The application displays notifications for unmatching passwords during sign up and incorrect passwords during sign in.
- **Recaptcha (Extra Points)**: For added security, reCAPTCHA is enabled on both the sign-up and login forms.

## Technologies Used

- Node.js
- Express.js
- Passport.js
- MongoDB (or another database of your choice)
- Ejs (for views template)
- bcrypt (for password encryption)
- Google OAuth for Social Authentication
- Nodemailer (for sending emails)
- Bootstrap (for frontend design)
- Noty (for notifications)
- reCAPTCHA (for spam protection)

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/yourusername/user-authentication-app.git
   ```

2. Install dependencies::

   ```
   cd user-authentication-app
   npm install
   ```

3. Set up your environment variables:

   - Create a .env file and configure it with the necessary variables such as your MongoDB connection string, Google OAuth credentials, email service settings, and reCAPTCHA keys.

4. Run the Application
   ```
   npm start
   ```
5. Visit the application in your web browser at http://localhost:3000.

# Project Structure

user-authentication-app/
├── node_modules/
├── src/
│ ├── views/
│ │ ├── layout.ejs
│ │ ├── home.ejs
│ │ ├── login.ejs
│ │ ├── register.ejs
│ │ ├── forgot-pass.ejs
│ │ ├── reset-password.ejs
│ │ └── ...
│ ├── controllers/
│ │ ├── authController.js
│ │ └── userController.js
│ ├── middlewares/
│ │ └── reCaptcha.js
│ ├── models/
│ │ └── user.model.js
│ ├── routes/
│ │ ├── auth.js
│ │ └── user.js
| └── userSchema.js
├── config/
│ ├── googleAuth.js
│ ├── mailer.js
│ ├── mongoose.js
│ └── passport.js
├── .env
├── package-lock.json
├── package.json
├── README.md
├── server.js
├── LICENSE

# Usage

- Visit the sign-up page and create a new account with your email.
- Sign in with your registered email and password.
- Utilize the Google sign-up or login option for social authentication.
- Reset your password for added security.
- Log out when you are done with your session.

# Implementation

The implementation of this web application involves several key components:

- **User Authentication with Passport.js**: Passport.js is used to manage user sessions and provide local and social authentication strategies.
- **Password Encryption**: User passwords are securely encrypted and stored in the database using bcrypt.
- **Google OAuth Authentication**: Users can sign up or log in using their Google account, leveraging OAuth2.0.
- **Notifications**: Notifications are displayed using Noty to alert users about any password mismatches or incorrect login attempts.
- **Forgot Password (Bonus Feature)**: Users can request a password reset link or receive a randomly generated password via email.
- **Recaptcha (Extra Points)**: reCAPTCHA is implemented on the sign-up and login forms to prevent spam and abuse.

# Security

- User passwords are securely hashed and stored in the database.
- Google OAuth provides secure social authentication.
- Email communication is encrypted.
- Recaptcha helps prevent spam and abuse.

# Bonus Feature

The bonus feature allows users to reset their forgotten password. This can be implemented in two ways:

- Random Password Generation: Users receive a randomly generated password via email.
- Password Reset Link (Preferred): Users receive a password reset link in their email, which expires after a certain time. This approach is more secure and user-friendly.

# Recaptcha

- To enhance security, reCAPTCHA is enabled on both the sign-up and login forms. This helps prevent spam and abuse by verifying that the user is not a robot.

# License

- This project is licensed under the MIT License.

- Feel free to customize, modify, and expand upon this web application to meet your specific requirements. Happy coding!
