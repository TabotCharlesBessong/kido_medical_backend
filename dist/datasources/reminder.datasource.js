"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reminder_model_1 = __importDefault(require("../models/reminder.model"));
class ReminderDataSource {
    async create(record) {
        return await reminder_model_1.default.create(record);
    }
    async fetchOne(query) {
        return await reminder_model_1.default.findOne(query);
    }
    async updateOne(searchBy, data) {
        await reminder_model_1.default.update(data, searchBy);
    }
    async fetchAll(query) {
        return await reminder_model_1.default.findAll(query);
    }
    async deleteOne(searchBy) {
        await reminder_model_1.default.destroy(searchBy);
    }
}
exports.default = ReminderDataSource;
