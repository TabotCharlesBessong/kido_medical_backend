"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kycverification_model_1 = __importDefault(require("../models/kycverification.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class KycVerificationDataSource {
    async create(record) {
        return await kycverification_model_1.default.create(record);
    }
    async fetchOne(query) {
        return await kycverification_model_1.default.findOne({
            ...query,
            include: [
                {
                    model: user_model_1.default,
                    as: "user",
                },
            ],
        });
    }
    async updateOne(searchBy, data) {
        await kycverification_model_1.default.update(data, searchBy);
    }
    async fetchAll(query) {
        return await kycverification_model_1.default.findAll({
            ...query,
            include: [
                {
                    model: user_model_1.default,
                    as: "user",
                },
            ],
        });
    }
}
exports.default = KycVerificationDataSource;
