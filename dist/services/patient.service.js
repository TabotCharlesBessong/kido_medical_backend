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
class PatientService {
    constructor(patientDataSource) {
        this.patientDataSource = patientDataSource;
    }
    createPatient(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientDataSource.create(data);
        });
    }
    getPatientById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientDataSource.fetchOne({ where: { userId } });
        });
    }
    updatePatient(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.patientDataSource.updateOne({ where: { id } }, data);
            return yield this.getPatientById(id);
        });
    }
    getAllPatients() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.patientDataSource.fetchAll({ where: {} });
        });
    }
    deletePatient(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.patientDataSource.deleteOne({ where: { id } });
        });
    }
}
exports.default = PatientService;
