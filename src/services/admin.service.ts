import { DoctorService } from "./doctor.service";
import EmailService from "./email.service";
import { DoctorVerificationStatus } from "../interfaces/enum/doctor.enum";
import DoctorDataSource from "../datasources/doctor.datasource";
import UserService from "./user.services";
import { KycVerificationService } from "./kycVerfication.service";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";

class AdminService {
  private doctorService: DoctorService;
  private emailService: typeof EmailService;
  private userService: UserService;
  private kycVerificationService: KycVerificationService;

  constructor() {
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      new UserService()
    );
    this.emailService = EmailService;
    this.userService = new UserService();
    this.kycVerificationService = new KycVerificationService(
      new KycVerificationDataSource(),
      this.userService
    );
  }

  async getPendingDoctorVerifications() {
    return this.doctorService.getDoctorsByVerificationStatus(DoctorVerificationStatus.PENDING);
  }

  async getPendingKycVerifications() {
    return this.kycVerificationService.getAllKycVerificationRequests();
  }

  async verifyDoctor(email: string, status: DoctorVerificationStatus, notes?: string) {
    const doctor = await this.doctorService.getDoctorByEmail(email);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const doctorUser = await this.userService.getUserByField({ id: doctor.userId });
    if (!doctorUser) {
      throw new Error('Doctor user not found');
    }

    // Get KYC verification for this doctor
    const kycVerification = await this.kycVerificationService.getKycVerificationByUserId(doctor.userId);
    
    // If KYC is not approved, doctor cannot be approved
    if (status === DoctorVerificationStatus.APPROVED && kycVerification && kycVerification.status !== 'approved') {
      throw new Error('Doctor cannot be approved until KYC verification is completed');
    }

    await this.doctorService.verifyDoctor(email, status as 'APPROVED' | 'REJECTED', notes);

    // If doctor is approved and KYC exists, also approve KYC
    if (status === DoctorVerificationStatus.APPROVED && kycVerification) {
      await this.kycVerificationService.updateKycVerification(
        { where: { userId: doctor.userId } },
        { status: 'approved' }
      );
    }

    // Send verification status email
    if (status === DoctorVerificationStatus.APPROVED) {
      await this.emailService.sendDoctorVerificationApprovedEmail({
        doctorEmail: email,
        doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`
      });
    } else if (status === DoctorVerificationStatus.REJECTED) {
      await this.emailService.sendDoctorVerificationRejectedEmail({
        doctorEmail: email,
        doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
        reason: notes || 'No reason provided'
      });
    }

    return doctor;
  }

  async verifyKyc(userId: string, status: 'approved' | 'rejected', reason?: string) {
    const kycVerification = await this.kycVerificationService.getKycVerificationByUserId(userId);
    if (!kycVerification) {
      throw new Error('KYC verification request not found');
    }

    await this.kycVerificationService.updateKycVerification(
      { where: { userId } },
      { status, reason }
    );

    // Get doctor and user details for email
    const doctor = await this.doctorService.getDoctorByUserId(userId);
    const user = await this.userService.getUserByField({ id: userId });
    
    if (user) {
      if (status === 'approved') {
        // Send KYC approval email
        await this.emailService.sendKycApprovalEmail({
          doctorEmail: user.email,
          doctorName: `${user.firstname} ${user.lastname}`
        });
      } else {
        // Send KYC rejection email
        await this.emailService.sendKycRejectionEmail({
          doctorEmail: user.email,
          doctorName: `${user.firstname} ${user.lastname}`,
          reason: reason || 'No reason provided'
        });
      }
    }

    return kycVerification;
  }

  async getDoctorVerificationDetails(doctorId: string) {
    const doctor = await this.doctorService.getDoctorByField({ where: { id: doctorId } });
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Get KYC verification details
    const kycVerification = await this.kycVerificationService.getKycVerificationByUserId(doctor.userId);

    return {
      ...doctor,
      documents: doctor.documents,
      verificationStatus: doctor.verificationStatus,
      verificationNotes: doctor.verificationNotes,
      verifiedAt: doctor.verifiedAt,
      kycVerification
    };
  }
}

export default AdminService; 