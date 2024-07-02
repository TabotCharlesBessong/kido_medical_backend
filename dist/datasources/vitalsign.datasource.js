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
const vitalsign_model_1 = __importDefault(require("../models/vitalsign.model"));
class VitalSignDataSource {
    create(record, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vitalsign_model_1.default.create(record, Object.assign({ returning: true }, options));
        });
    }
    fetchOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vitalsign_model_1.default.findOne(query);
        });
    }
    fetchById(VitalSignId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vitalsign_model_1.default.findOne({
                where: { id: VitalSignId },
            });
        });
    }
    updateOne(data, query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vitalsign_model_1.default.update(data, Object.assign(Object.assign({}, query), { returning: true }));
        });
    }
    fetchAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vitalsign_model_1.default.findAll(query);
        });
    }
    deleteOne(searchBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vitalsign_model_1.default.destroy(searchBy);
        });
    }
}
exports.default = VitalSignDataSource;
