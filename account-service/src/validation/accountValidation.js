import Joi from 'joi';


export const createAccountSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});


export const updateBalanceSchema = Joi.object({
  id: Joi.string().required(),
  amount: Joi.number().required(),
});


export const getAccountSchema = Joi.object({
  id: Joi.string().required(),
});
