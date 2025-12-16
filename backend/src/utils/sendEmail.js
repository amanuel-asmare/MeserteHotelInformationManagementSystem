const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    // DEBUG LOGS
    console.log("Attempting to send email...");
    console.log("SMTP Host: smtp.gmail.com");
    // Mask email for security in logs
    console.log("SMTP User:", process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.substring(0, 3) + '***' : 'MISSING');

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP Credentials missing in Environment Variables");
    }

    // FOR REAL ENVIRONMENT: Gmail SMTP Configuration
    // Use standard SMTP transport without pooling for better reliability on serverless/cloud functions
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL.trim(),
            pass: process.env.SMTP_PASSWORD.trim()
        },
        tls: {
            // Necessary for some cloud providers to accept the certificate
            rejectUnauthorized: false
        }
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    try {
        // Verify connection before sending
        await transporter.verify();
        console.log("SMTP Connection Verified");

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Error Details:", error);
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