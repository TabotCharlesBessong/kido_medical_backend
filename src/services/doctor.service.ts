import { IDoctor, IDoctorCreationBody, IDoctorDataSource, IFindDoctorQuery } from "../interfaces/doctor.interface";
import { IEmailService } from "../interfaces/email.interface";
import UserService from "./user.services";
import { UserTypes } from "../enums/user.types";
import { DoctorVerificationStatus } from "../interfaces/enum/doctor.enum";
import { KycVerificationService } from "./kycVerfication.service";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";

export class DoctorService {
  private doctorDataSource: IDoctorDataSource;
  private emailService: IEmailService;
  private userService: UserService;
  private kycVerificationService: KycVerificationService;

  constructor(
    doctorDataSource: IDoctorDataSource,
    emailService: IEmailService,
    userService: UserService,
    kycVerificationService: KycVerificationService
  ) {
    this.doctorDataSource = doctorDataSource;
    this.emailService = emailService;
    this.userService = userService;
    this.kycVerificationService = kycVerificationService;
  }

  async createDoctor(record: IDoctorCreationBody): Promise<IDoctor> {
    // Remove isVerified from record if present
    const { isVerified, ...cleanRecord } = record as any;
    const doctor = await this.doctorDataSource.create(cleanRecord);
    
    // Get doctor's user details
    const doctorUser = await this.userService.getUserByField({ id: record.userId });
    if (!doctorUser) {
      throw new Error("Doctor user not found");
    }

    // Get admin user
    const adminUser = await this.userService.getUserByField({ 
      email: "charlesbessongtabot@gmail.com" 
    });
    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Send verification request to admin
    await this.emailService.sendDoctorVerificationRequestEmail({
      adminEmail: adminUser.email,
      doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
      doctorEmail: doctorUser.email,
      specialization: record.specialization,
      experience: record.experience || 0,
      documentUrl: record.documents || "",
      documentType: record.documents?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
    });

    return doctor;
  }

  async getDoctorByUserId(id: string): Promise<IDoctor | null> {
    const query = { where: { userId: id }, raw: true, returning: true };
    return this.doctorDataSource.fetchOne(query);
  }

  async getDoctorByField(query: IFindDoctorQuery): Promise<IDoctor | null> {
    return this.doctorDataSource.fetchOne(query);
  }

  async getDoctors(): Promise<IDoctor[]> {
    const query = { where: {}, raw: true };
    return this.doctorDataSource.fetchAll(query);
  }

  async updateDoctorVerification(
    doctorId: string,
    updateData: {
      verificationStatus: string;
      verificationNotes?: string;
      verifiedAt?: Date | null;
    }
  ): Promise<IDoctor | null> {
    const filter = { where: { id: doctorId } };
    await this.doctorDataSource.updateOne(filter, {
      verificationStatus: updateData.verificationStatus,
      verificationNotes: updateData.verificationNotes,
      verifiedAt: updateData.verifiedAt
    });
    return this.getDoctorByField({ where: { id: doctorId } });
  }

  async updateDoctor(id: string, data: Partial<IDoctor>): Promise<void> {
    await this.doctorDataSource.updateOne({ where: { id } }, data);
  }

  async verifyDoctor(email: string, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<void> {
    // Get doctor by email
    const doctorUser = await this.userService.getUserByField({ email });
    if (!doctorUser) {
      throw new Error("Doctor not found");
    }

    const doctor = await this.getDoctorByField({ where: { userId: doctorUser.id } });
    if (!doctor) {
      throw new Error("Doctor profile not found");
    }

    // Check KYC verification status if trying to approve
    if (status === 'APPROVED') {
      const kycVerification = await this.kycVerificationService.getKycVerificationByUserId(doctorUser.id);
      if (kycVerification && kycVerification.status !== 'approved') {
        throw new Error("Doctor cannot be approved until KYC verification is completed");
      }
    }

    // Update verification status
    await this.updateDoctor(doctor.id, {
      verificationStatus: status,
      verificationNotes: notes,
      verifiedAt: status === 'APPROVED' ? new Date() : null
    });

    // Send verification status email to doctor
    await this.emailService.sendVerificationStatusEmail({
      doctorEmail: doctorUser.email,
      doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
      status,
      verificationNotes: notes
    });
  }

  async getDoctorByEmail(email: string): Promise<IDoctor | null> {
    const user = await this.userService.getUserByField({ email });
    if (!user) {
      return null;
    }
    return this.getDoctorByField({ where: { userId: user.id } });
  }

  async getDoctorsByVerificationStatus(status: DoctorVerificationStatus): Promise<IDoctor[]> {
    const query = { 
      where: { verificationStatus: status },
      raw: true 
    };
    return this.doctorDataSource.fetchAll(query);
  }
}