// src/utils/sendEmail.js
const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing!');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async(options) => {
    console.log('Sending email via Resend HTTPS API to:', options.email);

    try {
        const { data, error } = await resend.emails.send({
            // from: 'Meseret Hotel <onboarding@resend.dev>',
            FROM: 'Meseret Hotel<meserethotel.mooo.com>',
            to: ['amanuelasmare18@gmail.com'], // Force to your email only
            // to: [options.email],  // Comment this out
            subject: options.subject + ' [TEST]',
            html: options.message + '<p><strong>This is a test – recipient was: ' + options.email + '</strong></p>',
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error(error.message || 'Failed to send email');
        }

        console.log('Email successfully sent via Resend! ID:', data.id);
        return data;
    } catch (err) {
        console.error('Resend Send Error:', err);
        throw new Error(err.message || 'Failed to send email');
    }
};

module.exports = sendEmail;

/*const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    // FOR REAL ENVIRONMENT: Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // smtp.gmail.com
        port: process.env.SMTP_PORT, // 587
        secure: false, // Must be false for port 587 (uses STARTTLS)
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD // The 16-digit App Password
        },
        tls: {
            // This prevents errors if running on localhost/non-secure networks
            rejectUnauthorized: false
        }
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`, // Gmail overrides the "from", so use the authenticated email
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;*/