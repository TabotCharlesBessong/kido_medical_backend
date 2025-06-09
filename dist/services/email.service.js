"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brevo_1 = require("@getbrevo/brevo");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const brevoApiKey = process.env.BREVO_API_KEY;
const frontendUrl = process.env.FRONTEND_URL;
const apiUrl = process.env.API_URL;
if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
}
const sender = {
    name: 'Kido Medical',
    email: 'ebezebeatrice@gmail.com'
};
// Load email templates
const emailTemplate = path_1.default.join(__dirname, '..', 'template', 'email.html');
const appointmentBookingTemplate = path_1.default.join(__dirname, '..', 'template', 'appointment-booking.html');
const appointmentStatusTemplate = path_1.default.join(__dirname, '..', 'template', 'appointment-status.html');
const prescriptionTemplate = path_1.default.join(__dirname, '..', 'template', 'prescription.html');
const verificationStatusTemplate = path_1.default.join(__dirname, '..', 'template', 'verification-status.html');
const doctorVerificationRequestTemplate = path_1.default.join(__dirname, '..', 'template', 'doctor-verification-request.html');
const templates = {
    default: fs_1.default.readFileSync(emailTemplate, 'utf8'),
    appointmentBooking: fs_1.default.readFileSync(appointmentBookingTemplate, 'utf8'),
    appointmentStatus: fs_1.default.readFileSync(appointmentStatusTemplate, 'utf8'),
    prescription: fs_1.default.readFileSync(prescriptionTemplate, 'utf8'),
    verificationStatus: fs_1.default.readFileSync(verificationStatusTemplate, 'utf8'),
    doctorVerificationRequest: fs_1.default.readFileSync(doctorVerificationRequestTemplate, 'utf8'),
    'doctor-verification-approved': fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'template', 'doctor-verification-approved.html'), 'utf8'),
    'doctor-verification-rejected': fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'template', 'doctor-verification-rejected.html'), 'utf8')
};
class EmailService {
    constructor() {
        this.apiInstance = new brevo_1.TransactionalEmailsApi();
        this.apiInstance.setApiKey(brevo_1.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);
    }
    replaceTemplateConstant(template, key, data) {
        const regex = new RegExp(key, 'g');
        return template.replace(regex, data);
    }
    sendEmail(to, subject, htmlContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sendSmtpEmail = {
                    sender,
                    to: [{ email: to }],
                    subject,
                    htmlContent
                };
                const result = yield this.apiInstance.sendTransacEmail(sendSmtpEmail);
                console.log(`Email sent successfully to ${to}`);
                return result;
            }
            catch (error) {
                console.error('Failed to send email:', error);
                throw error;
            }
        });
    }
    sendVerificationMail(to, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Verify Account';
            const message = `Your email verification code is <b>${code}</b>`;
            return this.sendMail(to, subject, message);
        });
    }
    sendForgotPasswordMail(to, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Forgot Password';
            const message = `Your password reset code is <b>${code}</b>`;
            return this.sendMail(to, subject, message);
        });
    }
    sendMail(to, subject, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appName = process.env.APPNAME || 'Kido Medical';
                const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
                const name = to.split('@')[0];
                let html = this.replaceTemplateConstant(templates.default, '#APP_NAME#', appName);
                html = this.replaceTemplateConstant(html, '#NAME#', name);
                html = this.replaceTemplateConstant(html, '#MESSAGE#', message);
                html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
                return this.sendEmail(to, subject, html);
            }
            catch (error) {
                console.error('Failed to send email:', error);
                throw error;
            }
        });
    }
    sendAppointmentBookingEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ patientEmail, patientName, doctorName, reason, time, appointmentId }) {
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
            }
            catch (error) {
                console.error('Failed to send appointment booking email:', error);
                throw error;
            }
        });
    }
    sendAppointmentStatusEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ patientEmail, patientName, doctorName, reason, time, status }) {
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
            }
            catch (error) {
                console.error('Failed to send appointment status email:', error);
                throw error;
            }
        });
    }
    sendPrescriptionEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ patientEmail, patientName, doctorName, instructions, medications, date }) {
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
            }
            catch (error) {
                console.error('Failed to send prescription email:', error);
                throw error;
            }
        });
    }
    sendVerificationStatusEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ doctorEmail, doctorName, status, verificationNotes }) {
            try {
                const appName = process.env.APPNAME || 'Kido Medical';
                const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
                const statusText = status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
                const statusClass = status === 'APPROVED' ? 'status-approved' : 'status-canceled';
                let html = this.replaceTemplateConstant(templates.verificationStatus, '#APP_NAME#', appName);
                html = this.replaceTemplateConstant(html, '#NAME#', doctorName);
                html = this.replaceTemplateConstant(html, '#STATUS#', statusText);
                html = this.replaceTemplateConstant(html, '#STATUS_CLASS#', statusClass);
                html = this.replaceTemplateConstant(html, '#NOTES#', verificationNotes || 'No additional notes provided.');
                html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
                return this.sendEmail(doctorEmail, `Account ${statusText}`, html);
            }
            catch (error) {
                console.error('Failed to send verification status email:', error);
                throw error;
            }
        });
    }
    sendDoctorVerificationRequestEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ adminEmail, doctorName, doctorEmail, specialization, experience, documentUrl, documentType }) {
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
            }
            catch (error) {
                console.error('Failed to send doctor verification request email:', error);
                throw error;
            }
        });
    }
    sendDoctorVerificationApprovedEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const appName = process.env.APPNAME || 'Kido Medical';
            const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
            let html = this.replaceTemplateConstant(templates['doctor-verification-approved'], '#DOCTOR_NAME#', data.doctorName);
            html = this.replaceTemplateConstant(html, '#APP_NAME#', appName);
            html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
            yield this.sendEmail(data.doctorEmail, 'Doctor Verification Approved', html);
        });
    }
    sendDoctorVerificationRejectedEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const appName = process.env.APPNAME || 'Kido Medical';
            const supportMail = process.env.VERIFICATION_EMAIL || 'charlesbessongtabot@gmail.com';
            let html = this.replaceTemplateConstant(templates['doctor-verification-rejected'], '#DOCTOR_NAME#', data.doctorName);
            html = this.replaceTemplateConstant(html, '#APP_NAME#', appName);
            html = this.replaceTemplateConstant(html, '#SUPPORT_MAIL#', supportMail);
            html = this.replaceTemplateConstant(html, '#REJECTION_REASON#', data.reason);
            yield this.sendEmail(data.doctorEmail, 'Doctor Verification Rejected', html);
        });
    }
}
exports.default = new EmailService();
