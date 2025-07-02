import cron from 'node-cron';
import { reminderService } from './index';
import ReminderDataSource from "../datasources/reminder.datasource";

const reminderDataSource = new ReminderDataSource();

class CronService {
  private reminderService: typeof reminderService;

  constructor() {
    this.reminderService = reminderService;
    this.initializeJobs();
  }

  private initializeJobs() {
    // Run every minute to check and process reminders
    cron.schedule('* * * * *', async () => {
      try {
        console.log('Running reminder check...');
        await this.reminderService.processReminders();
      } catch (error) {
        console.error('Error processing reminders:', error);
      }
    });
  }
}

export default new CronService();