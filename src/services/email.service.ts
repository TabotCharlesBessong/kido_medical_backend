import { TransactionalEmailsApi, Configuration, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { IEmailService } from '../interfaces/email.interface';

dotenv.config();

const brevoApiKey = process.env.BREVO_API_KEY as string;
const frontendUrl = process.env.FRONTEND_URL as string;
const apiUrl = process.env.API_URL as string;

if (!brevoApiKey) {
  throw new Error('BREVO_API_KEY is not set in environment variables');
}

const sender = {
  name: 'Kido Medical',
  email: 'ebezebeatrice@gmail.com'
};

// Load email templates
const emailTemplate = path.join(__dirname, '..', 'template', 'email.html');
const appointmentBookingTemplate = path.join(__dirname, '..', 'template', 'appointment-booking.html');
const appointmentStatusTemplate = path.join(__dirname, '..', 'template', 'appointment-status.html');
const prescriptionTemplate = path.join(__dirname, '..', 'template', 'prescription.html');
const verificationStatusTemplate = path.join(__dirname, '..', 'template', 'verification-status.html');
const doctorVerificationRequestTemplate = path.join(__dirname, '..', 'template', 'doctor-verification-request.html');

const templates = {
  default: fs.readFileSync(emailTemplate, 'utf8'),
  appointmentBooking: fs.readFileSync(appointmentBookingTemplate, 'utf8'),
  appointmentStatus: fs.readFileSync(appointmentStatusTemplate, 'utf8'),
  prescription: fs.readFileSync(prescriptionTemplate, 'utf8'),
  verificationStatus: fs.readFileSync(verificationStatusTemplate, 'utf8'),
  doctorVerificationRequest: fs.readFileSync(doctorVerificationRequestTemplate, 'utf8'),
  'doctor-verification-approved': fs.readFileSync(path.join(__dirname, '..', 'template', 'doctor-verification-approved.html'), 'utf8'),
  'doctor-verification-rejected': fs.readFileSync(path.join(__dirname, '..', 'template', 'doctor-verification-rejected.html'), 'utf8')
};

class EmailService implements IEmailService {
  private apiInstance: TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new TransactionalEmailsApi();
    this.apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);
  }

  private replaceTemplateConstant(template: string, key: string, data: string) {
    const regex = new RegExp(key, 'g');
    return template.replace(regex, data);
  }

  private async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      const sendSmtpEmail = {
        sender,
        to: [{ email: to }],
        subject,
        htmlContent
      };

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendVerificationMail(to: string, code: string) {
    const subject = 'Verify Account';
    const message = `Your email verification code is <b>${code}</b>`;
    return this.sendMail(to, subject, message);
  }

  async sendForgotPasswordMail(to: string, code: string) {
    const subject = 'Forgot Password';
    const message = `Your password reset code is <b>${code}</b>`;
    return this.sendMail(to, subject, message);
  }

  private async sendMail(to: string, subject: string, message: string) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
      const name = to.split('@')[0];
      
      let html = this.replaceTemplateConstant(templates.default, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#NAME#', name);
      html = this.replaceTemplateConstant(html, '#MESSAGE#', message);
      html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
      
      return this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendAppointmentBookingEmail({
    patientEmail,
    patientName,
    doctorName,
    reason,
    time,
    appointmentId
  }: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    reason: string;
    time: string;
    appointmentId: string;
  }) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
      const approveUrl = `${apiUrl}/appointments/${appointmentId}/approve`;
      const cancelUrl = `${apiUrl}/appointments/${appointmentId}/cancel`;

      let html = this.replaceTemplateConstant(templates.appointmentBooking, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#PATIENT_NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#DOCTOR_NAME#', doctorName);
      html = this.replaceTemplateConstant(html, '#REASON#', reason);
      html = this.replaceTemplateConstant(html, '#TIME#', time);
      html = this.replaceTemplateConstant(html, '#APPROVE_URL#', approveUrl);
      html = this.replaceTemplateConstant(html, '#CANCEL_URL#', cancelUrl);
      html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);

      return this.sendEmail(patientEmail, 'Appointment Booking Confirmation', html);
    } catch (error) {
      console.error('Failed to send appointment booking email:', error);
      throw error;
    }
  }

  async sendAppointmentStatusEmail({
    patientEmail,
    patientName,
    doctorName,
    reason,
    time,
    status
  }: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    reason: string;
    time: string;
    status: 'PENDING' | 'APPROVED' | 'CANCELED';
  }) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
      const statusClass = status === 'APPROVED' ? 'status-approved' : 
                         status === 'PENDING' ? 'status-pending' : 
                         'status-canceled';

      let html = this.replaceTemplateConstant(templates.appointmentStatus, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#PATIENT_NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#DOCTOR_NAME#', doctorName);
      html = this.replaceTemplateConstant(html, '#REASON#', reason);
      html = this.replaceTemplateConstant(html, '#TIME#', time);
      html = this.replaceTemplateConstant(html, '#STATUS#', status);
      html = this.replaceTemplateConstant(html, '#STATUS_CLASS#', statusClass);
      html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);

      return this.sendEmail(patientEmail, `Appointment ${status}`, html);
    } catch (error) {
      console.error('Failed to send appointment status email:', error);
      throw error;
    }
  }

  async sendPrescriptionEmail({
    patientEmail,
    patientName,
    doctorName,
    instructions,
    medications,
    date
  }: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    instructions: string;
    medications: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
    date: string;
  }) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';

      // Generate medication cards HTML
      const medicationsHtml = medications.map(med => `
        <div class="medication-card">
          <h4>${med.name}</h4>
          <p><strong>Dosage:</strong> ${med.dosage}</p>
          <p><strong>Frequency:</strong> ${med.frequency}</p>
          <p><strong>Duration:</strong> ${med.duration}</p>
          ${med.notes ? `<p><strong>Notes:</strong> ${med.notes}</p>` : ''}
        </div>
      `).join('');

      let html = this.replaceTemplateConstant(templates.prescription, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#PATIENT_NAME#', patientName);
      html = this.replaceTemplateConstant(html, '#DOCTOR_NAME#', doctorName);
      html = this.replaceTemplateConstant(html, '#DATE#', date);
      html = this.replaceTemplateConstant(html, '#INSTRUCTIONS#', instructions);
      html = this.replaceTemplateConstant(html, '#MEDICATIONS#', medicationsHtml);
      html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);

      return this.sendEmail(patientEmail, 'Your Prescription', html);
    } catch (error) {
      console.error('Failed to send prescription email:', error);
      throw error;
    }
  }

  async sendVerificationStatusEmail({
    doctorEmail,
    doctorName,
    isVerified,
    verificationNotes
  }: {
    doctorEmail: string;
    doctorName: string;
    isVerified: boolean;
    verificationNotes?: string;
  }) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
      const status = isVerified ? 'VERIFIED' : 'REJECTED';
      const statusClass = isVerified ? 'status-approved' : 'status-canceled';

      let html = this.replaceTemplateConstant(templates.verificationStatus, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#NAME#', doctorName);
      html = this.replaceTemplateConstant(html, '#STATUS#', status);
      html = this.replaceTemplateConstant(html, '#STATUS_CLASS#', statusClass);
      html = this.replaceTemplateConstant(html, '#NOTES#', verificationNotes || 'No additional notes provided.');
      html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);

      return this.sendEmail(doctorEmail, `Account ${status}`, html);
    } catch (error) {
      console.error('Failed to send verification status email:', error);
      throw error;
    }
  }

  async sendDoctorVerificationRequestEmail({
    adminEmail,
    doctorName,
    doctorEmail,
    specialization,
    experience,
    documentUrl,
    documentType
  }: {
    adminEmail: string;
    doctorName: string;
    doctorEmail: string;
    specialization: string;
    experience: number;
    documentUrl: string;
    documentType: 'image' | 'pdf';
  }) {
    try {
      const appName = process.env.APPNAME || 'Kido Medical';
      const approveUrl = `${apiUrl}/doctors/verify/approve?email=${doctorEmail}`;
      const declineUrl = `${apiUrl}/doctors/verify/decline?email=${doctorEmail}`;

      let html = this.replaceTemplateConstant(templates.doctorVerificationRequest, '#APP_NAME#', appName);
      html = this.replaceTemplateConstant(html, '#DOCTOR_NAME#', doctorName);
      html = this.replaceTemplateConstant(html, '#DOCTOR_EMAIL#', doctorEmail);
      html = this.replaceTemplateConstant(html, '#SPECIALIZATION#', specialization);
      html = this.replaceTemplateConstant(html, '#EXPERIENCE#', experience.toString());
      html = this.replaceTemplateConstant(html, '#DOCUMENT_URL#', documentUrl);
      html = this.replaceTemplateConstant(html, '#APPROVE_URL#', approveUrl);
      html = this.replaceTemplateConstant(html, '#DECLINE_URL#', declineUrl);

      // Add document preview based on type
      const documentPreview = documentType === 'image' 
        ? `<img src="${documentUrl}" alt="Doctor's Document" class="document-preview">`
        : '<p>PDF document submitted. Please download to view.</p>';
      html = this.replaceTemplateConstant(html, '#DOCUMENT_PREVIEW#', documentPreview);

      return this.sendEmail(adminEmail, 'New Doctor Verification Request', html);
    } catch (error) {
      console.error('Failed to send doctor verification request email:', error);
      throw error;
    }
  }

  async sendDoctorVerificationApprovedEmail(data: {
    doctorEmail: string;
    doctorName: string;
  }) {
    const appName = process.env.APPNAME || 'Kido Medical';
    const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
    let html = this.replaceTemplateConstant(templates['doctor-verification-approved'], '#DOCTOR_NAME#', data.doctorName);
    html = this.replaceTemplateConstant(html, '#APP_NAME#', appName);
    html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
    await this.sendEmail(data.doctorEmail, 'Doctor Verification Approved', html);
  }

  async sendDoctorVerificationRejectedEmail(data: {
    doctorEmail: string;
    doctorName: string;
    reason: string;
  }) {
    const appName = process.env.APPNAME || 'Kido Medical';
    const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
    let html = this.replaceTemplateConstant(templates['doctor-verification-rejected'], '#DOCTOR_NAME#', data.doctorName);
    html = this.replaceTemplateConstant(html, '#APP_NAME#', appName);
    html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
    html = this.replaceTemplateConstant(html, '#REJECTION_REASON#', data.reason);
    await this.sendEmail(data.doctorEmail, 'Doctor Verification Rejected', html);
  }
}

export default new EmailService();
