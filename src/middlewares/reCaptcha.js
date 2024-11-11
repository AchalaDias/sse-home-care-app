import request from 'request';

// Function to verify reCAPTCHA
function verifyRecaptcha(recaptchaResponse, callback) {
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    const formData = {
        secret: process.env.CAPTCHA_SECRET || "6Leup3oqAAAAABPvx8CSwE0caYG8-jaPcvPFg9sy",
        response: recaptchaResponse,
    };

    // Send a POST request to reCAPTCHA verification endpoint
    request.post({ url: verificationURL, form: formData }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const responseBody = JSON.parse(body);
            if (responseBody.success) {
                // reCAPTCHA verification succeeded
                callback(null, true);
            } else {
                // reCAPTCHA verification failed
                callback('reCAPTCHA verification failed', false);
            }
        } else {
            // Error occurred during verification
            callback('Error during reCAPTCHA verification', false);
        }
    });
}

export const verifyCaptcha = async (req, res, next) => {
    verifyRecaptcha(req.body['g-recaptcha-response'], (error, success) => {
        if (success) {
            next();
        } else {
            // Handle reCAPTCHA verification failure
            req.flash('reCAPTCHA verification failed')
            if (req.url.includes('register')) {
                return res.redirect('/auth/register');
            }
            res.redirect('/auth/login');
        }
    });
}
