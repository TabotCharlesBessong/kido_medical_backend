"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const index_1 = require("./index");
const reminder_datasource_1 = __importDefault(require("../datasources/reminder.datasource"));
const reminderDataSource = new reminder_datasource_1.default();
class CronService {
    constructor() {
        this.reminderService = index_1.reminderService;
        this.initializeJobs();
    }
    initializeJobs() {
        node_cron_1.default.schedule('* * * * *', async () => {
            try {
                console.log('Running reminder check...');
                await this.reminderService.processReminders();
            }
            catch (error) {
                console.error('Error processing reminders:', error);
            }
        });
    }
}
exports.default = new CronService();
