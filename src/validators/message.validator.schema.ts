import * as yup from "yup";

const createMessageSchema = yup.object().shape({
  receiverId: yup.string().uuid().required("Receiver ID is required"),
  content: yup.string().required("Message content is required"),
});

const validationSchema = {
  createMessageSchema,
};

export default validationSchema; 