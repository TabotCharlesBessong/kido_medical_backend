import * as yup from "yup";

const createPatientSchema = yup.object({
  gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
  age: yup.number().min(0).required(),
});

const bookAppointmentSchema = yup.object({
  date: yup.date().required(),
  reason: yup.string().required(),
});

const validationSchema = {
  createPatientSchema,
  bookAppointmentSchema,
};

export default validationSchema;
