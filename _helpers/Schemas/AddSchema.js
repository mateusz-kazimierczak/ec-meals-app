import Joi from "joi";

export default Joi.object({
  defaultUsername: Joi.boolean(),
  username: Joi.string().trim().when("defaultUsername", {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  birthday: Joi.string().trim().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/).optional(),
  password: Joi.string().required().trim(),
  firstName: Joi.string().required(),
  lastName: Joi.string().empty(""),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .empty(""),
  sendWelcomeEmail: Joi.boolean(),
  role: Joi.string().required(),
  active: Joi.boolean().required(),
  room: Joi.number().empty(""),
  guest: Joi.boolean(),
  diet: Joi.any(),
});
