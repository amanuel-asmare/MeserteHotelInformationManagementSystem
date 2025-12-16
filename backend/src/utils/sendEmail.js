const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    // DEBUG: Check if variables exist (Do not log the actual password for security)
    console.log("Attempting to send email...");
    console.log("SMTP Host:", process.env.SMTP_HOST);
    console.log("SMTP User:", process.env.SMTP_EMAIL);

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP Credentials missing in Environment Variables");
    }

    // FOR REAL ENVIRONMENT: Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Hardcoded for Gmail to ensure it works
        port: 587,
        secure: false, // Must be false for port 587
        auth: {
            user: process.env.SMTP_EMAIL.trim(), // .trim() removes hidden spaces
            pass: process.env.SMTP_PASSWORD.trim() // .trim() removes hidden spaces
        },
        tls: {
            rejectUnauthorized: false // Helps with Render/Cloud network restrictions
        }
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error(error.message);
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