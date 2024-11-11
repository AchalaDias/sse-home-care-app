import nodemailer from 'nodemailer';

const sendMail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'gmail',
        auth: {
            user: process.env.DEMO_EMAIL,
            pass: process.env.EMAIL_PASSWORD,

        },
    });

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

export default sendMail;
