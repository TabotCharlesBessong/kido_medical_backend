import * as yup from "yup";

const timeSlotSchema = yup.object({
  startTime: yup.date().required(),
  endTime: yup.date().required(),
  // isAvailable: yup.boolean().default(true),
});

const validationSchema = {
  timeSlotSchema
}

export default validationSchema
