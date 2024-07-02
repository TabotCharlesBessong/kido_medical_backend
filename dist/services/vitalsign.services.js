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
const vitalsign_datasource_1 = __importDefault(require("../datasources/vitalsign.datasource"));
class VitalSignService {
    constructor() {
        this.vitalsignDataSource = new vitalsign_datasource_1.default();
    }
    recordVitalSigns(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.vitalsignDataSource.create(record);
        });
    }
    getVitalSignsById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.vitalsignDataSource.fetchOne({
                where: { id: appointmentId },
            });
        });
    }
    updateVitalSigns(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id } };
            yield this.vitalsignDataSource.updateOne(data, filter);
        });
    }
    getVitalSigns() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.vitalsignDataSource.fetchAll(query);
        });
    }
    deleteVitalSigns(vitalId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.vitalsignDataSource.deleteOne({ where: { id: vitalId } });
        });
    }
}
exports.default = VitalSignService;
