import * as yup from "yup";

const timeSlotSchema = yup.object({
  startTime: yup
    .mixed()
    .required("Start time is required")
    .test("valid-date", "Invalid date format", (value: any) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test("future-date", "Start date must be today or a future date", (value: any) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      inputDate.setHours(0, 0, 0, 0);
      return inputDate >= today;
    })
    .test("minimum-time", "Start time must be at least 30 minutes from now", (value: any) => {
      if (!value) return false;
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const inputDate = new Date(value);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // For dates far in the future (like 2025), they should be valid
      if (inputDate > oneDayFromNow) {
        return true;
      }
      
      return inputDate >= thirtyMinutesFromNow;
    }),
  endTime: yup
    .mixed()
    .required("End time is required")
    .test("valid-date", "Invalid date format", (value: any) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test("after-start", "End time must be after start time", function(value: any) {
      const { startTime } = this.parent;
      if (!value || !startTime) return false;
      return new Date(value) > new Date(startTime);
    })
    .test("minimum-duration", "End time must be at least 30 minutes after start time", function(value: any) {
      const { startTime } = this.parent;
      if (!value || !startTime) return false;
      const start = new Date(startTime);
      const end = new Date(value);
      const thirtyMinutesAfterStart = new Date(start.getTime() + 30 * 60 * 1000);
      return end >= thirtyMinutesAfterStart;
    }),
  isAvailable: yup.boolean().default(true),
});

const validationSchema = {
  timeSlotSchema
}

export default validationSchema
