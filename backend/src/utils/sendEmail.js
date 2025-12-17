const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    console.log("Sending email via Gmail SMTP (465 SSL)");

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error("SMTP credentials missing");
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // ✅ REQUIRED for 465
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
        family: 4 // Force IPv4 (good for Render)
    });

    const message = {
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`, // ✅ Gmail-safe
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    try {
        await transporter.verify();
        console.log("SMTP verified");

        const info = await transporter.sendMail(message);
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("SMTP ERROR:", error);
        throw new Error("Email service unavailable");
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