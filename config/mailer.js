import nodemailer from 'nodemailer';


const mailer = async () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.DEMO_EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });
};

const sendMail = async (email, resetLink) => {
    const transporter = await mailer();
    const mailOptions = {
        from: 'ssedemo14@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: RESET_PASSWORD_TEMPLATE(resetLink),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email could not be sent:', error);
    } finally {
        // Close the transporter to release resources
        transporter.close();
    }
};

const sendOtp = async (email, otp) => {
    const transporter = await mailer();
    const mailOptions = {
        from: 'ssedemo14@gmail.com',
        to: email,
        subject: 'OTP',
        html: OTP_EMAIL_TEMPLATE(otp),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email could not be sent:', error);
    } finally {
        // Close the transporter to release resources
        transporter.close();
    }
};

const sendCovidAlert = async (email) => {
    const transporter = await mailer();
    const mailOptions = {
        from: 'ssedemo14@gmail.com',
        to: email,
        subject: 'COVID Update',
        html: COVID_MESSAGE,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email could not be sent:', error);
    } finally {
        // Close the transporter to release resources
        transporter.close();
    }
};

export default { sendMail, sendOtp, sendCovidAlert };



const COVID_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COVID-19 Exposure Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #FF5733;
      color: #fff;
      text-align: center;
      padding: 10px 0;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
    }
    .footer {
      text-align: center;
      font-size: 0.9em;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>COVID-19 Exposure Notification</h1>
    </div>
    <div class="content">
      <p>Dear Recipient,</p>
      <p>
        You may have been exposed to COVID-19. A user who attended to a job has reported testing positive.
      </p>
      <p>
        Please follow the recommended guidelines:
      </p>
      <ul>
        <li>Self-monitor for symptoms over the next 14 days</li>
        <li>Get tested if symptoms develop</li>
        <li>Follow public health advice and local COVID-19 protocols</li>
      </ul>
      <p>
        For more information and support, visit the 
        <a href="https://www.who.int" target="_blank">WHO COVID-19 Information Page</a>.
      </p>
    </div>
    <div class="footer">
      <p>
        &copy; 2024 Your Organization. All rights reserved.
        <br />
        This is an automated message. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
`;


const OTP_EMAIL_TEMPLATE = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #007bff;
      color: #fff;
      text-align: center;
      padding: 10px 0;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .otp {
      font-size: 2em;
      font-weight: bold;
      color: #007bff;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 0.9em;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your OTP Code</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) is:</p>
      <div class="otp">${otp}</div>
      <p>Please use this code to complete your verification. This OTP is valid for the next 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>
        &copy; 2024 Your Organization. All rights reserved.
        <br />
        This is an automated message. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
`;


const RESET_PASSWORD_TEMPLATE = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #dc3545;
      color: #fff;
      text-align: center;
      padding: 10px 0;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .btn {
      display: inline-block;
      margin: 20px 0;
      padding: 10px 20px;
      font-size: 1.1em;
      color: #fff;
      background-color: #dc3545;
      text-decoration: none;
      border-radius: 5px;
    }
    .btn:hover {
      background-color: #c82333;
    }
    .footer {
      text-align: center;
      font-size: 0.9em;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Dear User,</p>
      <p>
        You requested to reset your password. Click the button below to proceed.
      </p>
      <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
      <p>
        If you didn’t request a password reset, please ignore this email. This link will expire in 30 minutes.
      </p>
    </div>
    <div class="footer">
      <p>
        &copy; 2024 Your Organization. All rights reserved.
        <br />
        This is an automated message. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
`;
