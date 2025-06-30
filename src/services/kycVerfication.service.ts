import {
  IFindKycVerificationQuery,
  IKycVerificationCreationBody,
  IKycVerification,
  IKycVerificationDataSource,
  IKycVerificationModel,
} from "../interfaces/kycverification.interface";
import UserService from "./user.services";

export class KycVerificationService {
  private kycDataSource: IKycVerificationDataSource;
  private userService: UserService;

  constructor(
    kycDataSource: IKycVerificationDataSource,
    userService: UserService
  ) {
    this.kycDataSource = kycDataSource;
    this.userService = userService;
  }

  async kycVerificationRequest(
    record: IKycVerificationCreationBody
  ): Promise<IKycVerification> {
    // Get doctor's user details
    const doctorUser = await this.userService.getUserByField({
      id: record.userId,
    });
    if (!doctorUser) {
      throw new Error("Doctor user not found");
    }

    const kycRequest = await this.kycDataSource.create(record);

    return kycRequest;
  }

  async getKycVerificationByUserId(
    id: string
  ): Promise<IKycVerification | null> {
    const query: IFindKycVerificationQuery = {
      where: { userId: id },
    };
    return this.kycDataSource.fetchOne(query);
  }

  async getAllKycVerificationRequests(): Promise<IKycVerification[]> {
    const query = { where: {}, raw: true };
    return this.kycDataSource.fetchAll(query);
  }

  async updateKycVerification(
    searchBy: IFindKycVerificationQuery,
    data: Partial<IKycVerification>
  ): Promise<void> {
    await this.kycDataSource.updateOne(searchBy, data);
  }
}
