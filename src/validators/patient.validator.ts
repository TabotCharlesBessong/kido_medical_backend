import * as yup from "yup";

const createPatientSchema = yup.object({
  gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
  age: yup.number().min(0).required(),
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
