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
const medication_datasource_1 = __importDefault(require("../datasources/medication.datasource"));
const prescription_datasource_1 = __importDefault(require("../datasources/prescription.datasource"));
class PrescriptionService {
    constructor() {
        this.prescriptionDataSource = new prescription_datasource_1.default();
        this.medicationDataSource = new medication_datasource_1.default();
    }
    createPrescription(prescriptionData, medications) {
        return __awaiter(this, void 0, void 0, function* () {
            const prescription = yield this.prescriptionDataSource.create(prescriptionData);
            for (const medication of medications) {
                medication.prescriptionId = prescription.id;
                yield this.medicationDataSource.create(medication);
            }
            return prescription;
        });
    }
    getPrescriptionById(prescriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prescriptionDataSource.fetchOne({
                where: { id: prescriptionId },
            });
        });
    }
    updatePrescription(id, data, medications) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id } };
            yield this.prescriptionDataSource.updateOne(data, filter);
            for (const medication of medications) {
                medication.prescriptionId = id;
                yield this.medicationDataSource.create(medication);
            }
        });
    }
    getPrescriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.prescriptionDataSource.fetchAll(query);
        });
    }
    deletePrescription(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prescriptionDataSource.deleteOne({ where: { id: postId } });
        });
    }
}
exports.default = PrescriptionService;
