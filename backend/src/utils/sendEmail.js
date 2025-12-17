// utils/sendEmail.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async(options) => {
    console.log("Attempting to send email via Resend API...");

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY missing in Environment Variables");
    }

    try {
        const data = await resend.emails.send({
            from: 'Meseret Hotel <onboarding@resend.dev>', // Test sender (emails go to your Resend dashboard)
            to: [options.email], // Real recipient
            subject: options.subject,
            html: options.message
        });

        console.log('Email sent via Resend API:', data);
        return data;
    } catch (error) {
        console.error("Resend API Error Details:", error);
        // Resend returns structured errors
        throw new Error(error.message || 'Failed to send email');
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