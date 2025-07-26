require('dotenv').config();
const nodemailer = require('nodemailer');

// Get environment variables
const brevoApiKey = process.env.MAIL_PASSWORD;
const brevoUser = process.env.MAIL_USER;

if (!brevoApiKey) {
  console.error('BREVO_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!brevoUser) {
  console.error("MAIL_USER is not set in environment variables");
  process.exit(1);
}

// Create transport
const brevoTransport = nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: brevoUser, // This should be your Brevo login email
    pass: brevoApiKey, // This should be your SMTP key, not API key
  },
});

// Verify connection configuration
brevoTransport.verify(function(error, success) {
  if (error) {
    console.log('Server connection failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Sender information
const sender = {
  name: "Kido Medical",
  email: "ebezebeatrice@gmail.com",
};

// Test email function
async function sendTestEmail() {
  try {
    const result = await brevoTransport.sendMail({
      from: {
        name: sender.name,
        address: sender.email
      },
      to: "charlesbessongtabot@gmail.com", // Using the verification email from .env
      subject: "Test Email",
      html: "<p>This is a test email from Kido Medical.</p>"
    });

    console.log('Email sent successfully!');
    console.log(result);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Run the test
sendTestEmail()
  .then(() => console.log('Test completed successfully'))
  .catch(err => console.error('Test failed:', err));