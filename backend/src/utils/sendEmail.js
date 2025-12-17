const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    console.log("Attempting to send email via Gmail Service...");

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP Credentials missing in Environment Variables");
    }

    // USE 'service: gmail' which handles the port/host logic automatically
    // BUT force family: 4 to prevent IPv6 timeouts on Render
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL.trim(),
            pass: process.env.SMTP_PASSWORD.trim()
        },
        // CRITICAL FIX FOR RENDER: Force IPv4
        family: 4,
        // Additional settings to prevent hangs
        logger: true, // Logs SMTP traffic to console for debugging
        debug: true // Logs SMTP traffic to console for debugging
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