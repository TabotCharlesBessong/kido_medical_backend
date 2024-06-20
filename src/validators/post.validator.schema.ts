import * as yup from "yup"

const createPostSchema = yup.object().shape({
  // doctorId: yup.string().required(),
  title: yup.string().required(),
  image: yup.string().optional(),
  description: yup.string().required(),
});

const updatePostSchema = yup.object().shape({
  title: yup.string().optional(),
  image: yup.string().optional(),
  description: yup.string().optional(),
  status: yup.string().optional(),
});

const createCommentSchema = yup.object().shape({
  // postId: yup.string().required(),
  // userId: yup.string().required(),
  content: yup.string().required(),
});

const validationSchema = { createPostSchema, updatePostSchema, createCommentSchema }

export default validationSchema;
