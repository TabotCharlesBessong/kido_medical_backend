import * as yup from "yup";

const doctorValidationSchema = yup.object({
  specialization: yup.string().trim().required(),
  documents: yup.mixed().required(),
});

const validationSchema = {
  doctorValidationSchema
}

export default validationSchema