"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationService = void 0;
class KycVerificationService {
    constructor(kycDataSource, userService) {
        this.kycDataSource = kycDataSource;
        this.userService = userService;
    }
    async kycVerificationRequest(record) {
        const doctorUser = await this.userService.getUserByField({
            id: record.userId,
        });
        if (!doctorUser) {
            throw new Error("Doctor user not found");
        }
        const kycRequest = await this.kycDataSource.create(record);
        return kycRequest;
    }
    async getKycVerificationByUserId(id) {
        const query = {
            where: { userId: id },
        };
        return this.kycDataSource.fetchOne(query);
    }
    async getAllKycVerificationRequests() {
        const query = { where: {}, raw: true };
        return this.kycDataSource.fetchAll(query);
    }
    async updateKycVerification(searchBy, data) {
        await this.kycDataSource.updateOne(searchBy, data);
    }
}
exports.KycVerificationService = KycVerificationService;
