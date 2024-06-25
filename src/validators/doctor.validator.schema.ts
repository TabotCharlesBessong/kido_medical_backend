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

const vitalSignSchema = yup.object().shape({
  weight: yup.number().required().positive(),
  height: yup.number().required().positive(),
  bloodPressure: yup.string().required(),
  pulse: yup.number().required().positive(),
  respiratoryRate: yup.number().required().positive(),
  temperature: yup.number().required().positive(),
});

const consultationSchema = yup.object().shape({
  // id: yup.string().required(),
  // patientId: yup.string().required(),
  // doctorId: yup.string().required(),
  // appointmentId: yup.string().required(),
  presentingComplaints: yup.string().required(),
  pastHistory: yup.string().required(),
  diagnosticImpression: yup.string().required(),
  investigations: yup.string().required(),
  treatment: yup.string().required()
});

const validationSchema = {
  doctorValidationSchema,
  timeSlotSchema,
  vitalSignSchema,
  consultationSchema
}

export default validationSchema