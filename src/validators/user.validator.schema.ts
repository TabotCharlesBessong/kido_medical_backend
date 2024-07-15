import * as yup from "yup"

const registrationSchema = yup.object({
  firstname:yup.string().lowercase().trim().required(),
  lastname:yup.string().lowercase().trim().required(),
  email:yup.string().email().lowercase().trim().required(),
  password:yup.string().min(6).trim().required()
})

const loginSchema = yup.object({
  email: yup.string().email().lowercase().trim().required(),
  password: yup.string().min(6).trim().required(),
});

const forgotPasswordSchema = yup.object({
  email: yup.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = yup.object({
  code: yup.string().trim().required(),
  email: yup.string().email().lowercase().trim().required(),
  password: yup.string().min(6).trim().required(),
});

const createMessageSchema = yup.object().shape({
  // senderId: yup.string().uuid().required(),
  receiverId: yup.string().uuid().required(),
  content: yup.string().required(),
});

const verifyAccountSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  code: yup.string().required("Code is required"),
});

const validationSchema = {
  registrationSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createMessageSchema,
  verifyAccountSchema
}

export default validationSchema