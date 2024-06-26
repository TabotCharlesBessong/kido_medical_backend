import * as yup from "yup";

const doctorValidationSchema = yup.object({
  specialization: yup.string().trim().required(),
  documents: yup.mixed().required(),
});

// const timeSlotSchema = yup.object({
//   startTime: yup.date().required(),
//   endTime: yup.date().required(),
//   isAvailable: yup.boolean().default(true),
// });

const timeSlotSchema = yup.object({
  startTime: yup
    .string()
    .required()
    .test(
      "valid-time-format",
      "Invalid time format. Expected format: HH:MI:SS",
      (value) => {
        if (!value) return true; // Allow empty value
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
        return timeRegex.test(value);
      }
    ),
  endTime: yup
    .string()
    .required()
    .test(
      "valid-time-format",
      "Invalid time format. Expected format: HH:MI:SS",
      (value) => {
        if (!value) return true; // Allow empty value
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
        return timeRegex.test(value);
      }
    ),
  isAvailable: yup.boolean().default(true),
});

// const timeSlotSchema = yup.object({
//   startTime: yup
//     .string()
//     .required()
//     .matches(
//       /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Regular expression for HH:MM format
//       "startTime must be in the format HH:MM"
//     ),
//   endTime: yup
//     .string()
//     .required()
//     .matches(
//       /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Regular expression for HH:MM format
//       "endTime must be in the format HH:MM"
//     ),
//   isAvailable: yup.boolean().default(true),
// });

const validationSchema = {
  doctorValidationSchema,
  timeSlotSchema
}

export default validationSchema