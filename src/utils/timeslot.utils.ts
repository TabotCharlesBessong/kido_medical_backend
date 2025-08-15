export class TimeSlotUtils {
  /**
   * Convert input to Date object safely
   */
  static toDate(input: any): Date {
    if (input instanceof Date) {
      return input;
    }
    if (typeof input === 'string') {
      return new Date(input);
    }
    throw new Error('Invalid date format');
  }

  /**
   * Check if the date is greater than or equal to today
   */
  static isDateValid(date: any): boolean {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const inputDate = this.toDate(date);
      inputDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      return inputDate >= today;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if start time is at least 30 minutes greater than present time
   */
  static isStartTimeValid(startTime: any): boolean {
    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const inputStartTime = this.toDate(startTime);
      
      // For dates far in the future (like 2025), they should be valid
      // Only check the 30-minute rule for dates within the next few hours
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (inputStartTime > oneDayFromNow) {
        // If the date is more than 1 day in the future, it's automatically valid
        return true;
      }
      
      return inputStartTime >= thirtyMinutesFromNow;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if end time is at least 30 minutes greater than start time
   */
  static isEndTimeValid(startTime: any, endTime: any): boolean {
    try {
      const inputStartTime = this.toDate(startTime);
      const inputEndTime = this.toDate(endTime);
      const thirtyMinutesAfterStart = new Date(inputStartTime.getTime() + 30 * 60 * 1000);
      
      return inputEndTime >= thirtyMinutesAfterStart;
    } catch (error) {
      return false;
    }
  }

  /**
   * Comprehensive validation for timeslot creation
   */
  static validateTimeSlot(startTime: any, endTime: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const inputStartTime = this.toDate(startTime);
      const inputEndTime = this.toDate(endTime);

      // Check if date is valid (today or future)
      if (!this.isDateValid(inputStartTime)) {
        errors.push("Start date must be today or a future date");
      }

      // Check if start time is at least 30 minutes from now
      if (!this.isStartTimeValid(inputStartTime)) {
        errors.push("Start time must be at least 30 minutes from the current time");
      }

      // Check if end time is at least 30 minutes after start time
      if (!this.isEndTimeValid(inputStartTime, inputEndTime)) {
        errors.push("End time must be at least 30 minutes after start time");
      }

      // Check if start time is before end time
      if (inputStartTime >= inputEndTime) {
        errors.push("Start time must be before end time");
      }
    } catch (error) {
      errors.push("Invalid date format provided");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format date for display
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
} 