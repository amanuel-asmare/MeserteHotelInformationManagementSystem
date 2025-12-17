const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async(options) => {
    console.log("Attempting to send email via Resend...");

    try {
        const data = await resend.emails.send({
            from: `"${process.env.FROM_NAME || 'Meseret Hotel'}" <${process.env.FROM_EMAIL}>`, // e.g., noreply@meserethotel.com
            to: [options.email],
            subject: options.subject,
            html: options.message,
        });

        console.log('Email sent via Resend:', data);
        return data;
    } catch (error) {
        console.error('Resend Error:', error);
        throw new Error(error.message || 'Email sending failed');
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