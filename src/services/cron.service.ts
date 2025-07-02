import cron from 'node-cron';
import ReminderService from './reminder.service';
import ReminderDataSource from "../datasources/reminder.datasource";

const reminderDataSource = new ReminderDataSource();

class CronService {
  private reminderService: ReminderService;

  constructor() {
    this.reminderService = new ReminderService(reminderDataSource);
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