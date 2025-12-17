const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    console.log("Attempting to send email via SMTP (Port 587/IPv4)...");

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP Credentials missing in Environment Variables");
    }

    // FOR REAL ENVIRONMENT: Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Must be false for Port 587 (STARTTLS)
        auth: {
            user: process.env.SMTP_EMAIL.trim(),
            pass: process.env.SMTP_PASSWORD.trim()
        },
        tls: {
            // Fixes issues with cloud server certificates
            rejectUnauthorized: false
        },
        // CRITICAL FIX FOR RENDER TIMEOUTS:
        // Render sometimes fails to resolve Gmail via IPv6, causing a hang.
        // We force IPv4 here.
        family: 4
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