import * as yup from "yup";
import { Religion } from "../interfaces/enum/patient.enum";

const createPatientSchema = yup.object({
  gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
  age: yup.number().min(0).required(),
  address1: yup.string().optional(),
  address2: yup.string().optional(),
  occupation: yup.string().optional(),
  phoneNumber: yup.string().optional(),
  tribe: yup.string().optional(),
  religion: yup.mixed<Religion>()
    .oneOf(Object.values(Religion), "Invalid religion")
    .optional(),
});

const bookAppointmentSchema = yup.object({
  date: yup.date().required(),
  reason: yup.string().required(),
  // patientId: yup.string().uuid().required(),
  doctorId: yup.string().uuid().required(),
  timeslotId: yup.string().uuid().required(),
});

const validationSchema = {
  createPatientSchema,
  bookAppointmentSchema,
};

export default validationSchema;
