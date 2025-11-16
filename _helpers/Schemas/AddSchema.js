import * as Yup from "yup";

export default Yup.object({
  defaultUsername: Yup.boolean(),
  username: Yup.string()
    .trim()
    .when("defaultUsername", {
      is: false,
      then: (schema) => schema.required("Username is required"),
      otherwise: (schema) => schema.optional(),
    }),
  birthday: Yup.string()
    .trim()
    .nullable()
    .notRequired()
    .test('birthday-format', 'Birthday must be in DD/MM format', function(value) {
      if (!value || value === '') return true; // Allow empty/null values
      return /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/.test(value);
    }),
  password: Yup.string().trim().required("Password is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().nullable().notRequired(),
  email: Yup.string()
    .email("Invalid email format")
    .nullable()
    .notRequired(),
  sendWelcomeEmail: Yup.boolean(),
  role: Yup.string().required("Role is required"),
  active: Yup.boolean().required("Active status is required"),
  room: Yup.number().nullable().notRequired(),
  guest: Yup.boolean(),
  diet: Yup.mixed().nullable(),
});
