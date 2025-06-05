const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// console.log(process.env.MAILTRAP_USER)

const emailTemplate = path.join(`${__dirname}`, "..", "template/email.html");
const template = fs.readFileSync(emailTemplate, "utf8");

class EmailService {
  constructor() {}

  static async sendForgotPasswordMail(to: string, code: string) {
    const subject = "Forgot Password";
    const message = `Your email verification code is <b>${code}</b>`;
    return this.sendMail(to, subject, message);
  }

  static async sendVerificationMail(to: string, code: string) {
    const subject = "Verify Account";
    const message = `Your email verification code is <b>${code}</b>`;
    return this.sendMail(to, subject, message);
  }

  private static replaceTemplateConstant(
    _template: string,
    key: string,
    data: string
  ) {
    const regex = new RegExp(key, "g");
    return _template.replace(regex, data);
  }

  private static async sendMail(to: string, subject: string, message: string) {
    try {
      const appName = process.env.APPNAME || "Kido Medical";
      const supportMail = process.env.VERIFICATION_EMAIL || "charlesbessongtabot@gmail.com";
      const name = to.split("@")[0];
      let html = this.replaceTemplateConstant(template, "#APP_NAME#", appName);
      html = this.replaceTemplateConstant(html, "#NAME#", name);
      html = this.replaceTemplateConstant(html, "#MESSAGE#", message);
      html = this.replaceTemplateConstant(html, "#SUPPORT_MAIL#", supportMail);
      
      const mailUser = "a9953a79a6707c";
      const mailPass = "78b7106da0be5f";
      
      // if (!mailUser || !mailPass) {
      //   console.warn('Email credentials not configured. Email sending will be skipped.');
      //   throw new Error('Email service not configured');
      // }
      
      // // Check if we should use Gmail or Mailtrap
      // const isGmail = mailUser.includes('@gmail.com');
      // const transportConfig = isGmail ? 
      //   {
      //     service: "gmail",
      //     auth: { user: mailUser, pass: mailPass }
      //   } : 
      //   {
      //     host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
      //     port: parseInt(process.env.MAILTRAP_PORT || "2525"),
      //     auth: { user: mailUser, pass: mailPass }
      //   };
      
      const transport = nodemailer.createTransport({
        service:"gmail",
        auth:{
          user:mailUser,
          pass:mailPass
        }
      });

      const mailOptions = {
        from: mailUser,
        to,
        subject,
        text: message,
        html: html,
      };

      console.log(`Attempting to send email to ${to} using Mailtrap`);
      const infoMail = await transport.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${infoMail.response}`);
      return infoMail;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export default EmailService;
