import * as yup from "yup";

export const kycVerificationSchema = yup.object().shape({
  userId: yup.string().required("User ID is required"),
  documentType: yup.string().required("Document type is required"),
  documentUrl: yup
    .string()
    .url("Document URL must be a valid URL")
    .notRequired(),
  specialistDocumentUrl: yup
    .string()
    .url("Specialist Document URL must be a valid URL")
    .notRequired(),
  status: yup
    .mixed<"pending" | "approved" | "rejected">()
    .oneOf(["pending", "approved", "rejected"])
    .notRequired(),
  reason: yup.string().notRequired(),
});
