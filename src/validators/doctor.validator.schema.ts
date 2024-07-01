import * as yup from "yup";
import { Frequency } from "../interfaces/enum/doctor.enum";

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
  // pastHistory: yup.string().required(),
  diagnosticImpression: yup.string().required(),
  investigations: yup.string().required(),
  treatment: yup.string().required()
});

const PrescriptionSchema = yup.object().shape({
  instructions: yup.string().optional(),
  investigation: yup.string().optional(),
  medications: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("Name is required"),
        dosage: yup.string().required("Dosage is required"),
        frequency: yup
          .string()
          .oneOf(Object.values(Frequency))
          .required("Frequency is required"),
        duration: yup.number().required("Duration is required"),
      })
    )
    .min(1, "At least one medication is required"),
});

// const MedicationSchema = yup.object().shape({
//   name: yup.string().required(),
//   dosage: yup.string().required(),
//   frequency: yup.string().oneOf(Object.values(Frequency)).required(),
//   duration: yup.number().required(),
// });

const validationSchema = {
  doctorValidationSchema,
  timeSlotSchema,
  vitalSignSchema,
  consultationSchema,
  PrescriptionSchema,
  // MedicationSchema
}

export default validationSchema