import * as Yup from "yup";

export default Yup.object({
  defaultUsername: Yup.boolean(),
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string().trim().nullable().notRequired(),
  firstName: Yup.string().nullable().notRequired(),
  lastName: Yup.string().nullable().notRequired(),
  birthday: Yup.string()
    .trim()
    .matches(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/, "Birthday must be in DD/MM format")
    .nullable()
    .notRequired(),
  email: Yup.string()
    .email("Invalid email format")
    .nullable()
    .notRequired(),
  role: Yup.string(),
  active: Yup.boolean(),
  guest: Yup.boolean(),
  room: Yup.number().nullable().notRequired(),
  diet: Yup.mixed(),
});
