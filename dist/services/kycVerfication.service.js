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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationService = void 0;
class KycVerificationService {
    constructor(kycDataSource, userService) {
        this.kycDataSource = kycDataSource;
        this.userService = userService;
    }
    kycVerificationRequest(record) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get doctor's user details
            const doctorUser = yield this.userService.getUserByField({
                id: record.userId,
            });
            if (!doctorUser) {
                throw new Error("Doctor user not found");
            }
            const kycRequest = yield this.kycDataSource.create(record);
            return kycRequest;
        });
    }
    getKycVerificationByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                where: { userId: id },
            };
            return this.kycDataSource.fetchOne(query);
        });
    }
    getAllKycVerificationRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.kycDataSource.fetchAll(query);
        });
    }
    updateKycVerification(searchBy, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.kycDataSource.updateOne(searchBy, data);
        });
    }
}
exports.KycVerificationService = KycVerificationService;
