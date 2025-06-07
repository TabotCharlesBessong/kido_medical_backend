export interface IEmailService {
  sendVerificationMail(to: string, code: string): Promise<any>;
  sendForgotPasswordMail(to: string, code: string): Promise<any>;
  sendAppointmentBookingEmail(params: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    reason: string;
    time: string;
    appointmentId: string;
  }): Promise<any>;
  sendAppointmentStatusEmail(params: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    reason: string;
    time: string;
    status: 'PENDING' | 'APPROVED' | 'CANCELED';
  }): Promise<any>;
  sendPrescriptionEmail(params: {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    instructions: string;
    medications: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
    date: string;
  }): Promise<any>;
  sendVerificationStatusEmail(params: {
    doctorEmail: string;
    doctorName: string;
    isVerified: boolean;
    verificationNotes?: string;
  }): Promise<any>;
  sendDoctorVerificationRequestEmail(params: {
    adminEmail: string;
    doctorName: string;
    doctorEmail: string;
    specialization: string;
    experience: number;
    documentUrl: string;
    documentType: 'image' | 'pdf';
  }): Promise<any>;
} 