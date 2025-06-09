import { DoctorService } from "./doctor.service";
import EmailService from "./email.service";
import { DoctorVerificationStatus } from "../interfaces/enum/doctor.enum";
import DoctorDataSource from "../datasources/doctor.datasource";
import UserService from "./user.services";

class AdminService {
  private doctorService: DoctorService;
  private emailService: typeof EmailService;
  private userService: UserService;

  constructor() {
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      new UserService()
    );
    this.emailService = EmailService;
    this.userService = new UserService();
  }

  async getPendingDoctorVerifications() {
    return this.doctorService.getDoctorsByVerificationStatus(DoctorVerificationStatus.PENDING);
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

    await this.doctorService.verifyDoctor(email, status as 'APPROVED' | 'REJECTED', notes);

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

  async getDoctorVerificationDetails(doctorId: string) {
    const doctor = await this.doctorService.getDoctorByField({ where: { id: doctorId } });
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return {
      ...doctor,
      documents: doctor.documents,
      verificationStatus: doctor.verificationStatus,
      verificationNotes: doctor.verificationNotes,
      verifiedAt: doctor.verifiedAt
    };
  }
}

export default AdminService; 