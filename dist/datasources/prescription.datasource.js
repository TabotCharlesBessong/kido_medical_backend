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
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
class PrescriptionDataSource {
    create(record, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescription_model_1.default.create(record, Object.assign({ returning: true }, options));
        });
    }
    fetchOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescription_model_1.default.findOne(Object.assign(Object.assign({}, query), { include: [{
                        association: 'medications',
                        required: false
                    }] }));
        });
    }
    fetchById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescription_model_1.default.findOne(Object.assign({ where: { id } }, options));
        });
    }
    updateOne(data, query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prescription_model_1.default.update(data, Object.assign(Object.assign({}, query), { returning: true }));
        });
    }
    deleteOne(searchBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prescription_model_1.default.destroy(searchBy);
        });
    }
    deleteMany(searchBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prescription_model_1.default.destroy({
                where: searchBy.where
            });
        });
    }
    fetchAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescription_model_1.default.findAll(Object.assign(Object.assign({}, query), { include: [{
                        association: 'medications',
                        required: false
                    }] }));
        });
    }
    // Optimized method to fetch prescriptions with pagination
    fetchPaginated() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, where = {}, transaction) {
            const offset = (page - 1) * limit;
            const [prescriptions, total] = yield Promise.all([
                prescription_model_1.default.findAll({
                    where,
                    limit,
                    offset,
                    include: [{
                            association: 'medications',
                            required: false
                        }],
                    transaction
                }),
                prescription_model_1.default.count({ where, transaction })
            ]);
            return { prescriptions, total };
        });
    }
    // Optimized method to fetch prescriptions by consultation with caching
    fetchByConsultation(consultationId, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescription_model_1.default.findAll({
                where: { consultationId },
                include: [{
                        association: 'medications',
                        required: false
                    }],
                transaction
            });
        });
    }
}
exports.default = PrescriptionDataSource;
