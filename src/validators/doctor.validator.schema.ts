import * as yup from "yup";

const doctorValidationSchema = yup.object({
  userId: yup.string().uuid().required(),
  specialization: yup.string().trim().required(),
  // verificationStatus: yup.string().trim().required(),
  documents: yup.mixed().required(),
});

const validationSchema = {
  doctorValidationSchema
}

export default validationSchema