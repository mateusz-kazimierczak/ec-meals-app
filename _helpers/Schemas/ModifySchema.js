import Joi from "joi";

export default Joi.object({
  defaultUsername: Joi.boolean(),
  username: Joi.string().required().trim(),
  password: Joi.string().empty("").trim(),
  firstName: Joi.string().empty(""),
  lastName: Joi.string().empty(""),
  birthday: Joi.string().trim().pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/).optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .empty(""),
  role: Joi.string(),
  active: Joi.boolean(),
  guest: Joi.boolean(),
  room: Joi.number().empty(""),
  diet: Joi.any(),
});
