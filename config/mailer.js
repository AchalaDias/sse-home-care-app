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
        html: `Click this <a href="${resetLink}">link</a> to reset your password.`,
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
        html: `This is your one time password ${otp}`,
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

const sendCovidAlert = async (email, message) => {
    const transporter = await mailer();
    const mailOptions = {
        from: 'ssedemo14@gmail.com',
        to: email,
        subject: 'OTP',
        html: message,
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

export default { sendMail, sendOtp };
