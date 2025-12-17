const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    console.log("Attempting to send email via SMTP...");

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP Credentials missing in Environment Variables");
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // Use 587 for STARTTLS (recommended)
        secure: false, // false for port 587 (STARTTLS)
        auth: {
            user: process.env.SMTP_EMAIL.trim(),
            pass: process.env.SMTP_PASSWORD.trim() // Must be a 16-digit Gmail App Password
        },
        tls: {
            rejectUnauthorized: false // Helps with cloud cert issues
        },
        // Critical for Render.com (prevents IPv6 hang)
        family: 4,
        // Add timeouts to avoid indefinite hangs
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
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