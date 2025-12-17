const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    console.log("Attempting to send email via Resend SMTP...");

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY missing in Environment Variables");
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true, // true for port 465 (SSL)
        auth: {
            user: 'resend', // Fixed username for Resend SMTP
            pass: process.env.RESEND_API_KEY // Your Resend API key
        }
    });

    const message = {
        from: `"${process.env.FROM_NAME || 'Meseret Hotel'}" <noreply@your-verified-domain.com>`, // See note below
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    try {
        await transporter.verify();
        console.log("SMTP Connection Verified");
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error("Nodemailer Error Details:", error);
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