import { PrismaClient } from '@prisma/client'
import { status } from '@grpc/grpc-js';
import { createAccountSchema,updateBalanceSchema,getAccountSchema } from '../validation/accountValidation.js'

const prisma = new PrismaClient();
// const API_GATEWAY_URL = process.env.API_GATEWAY_URL

export const createAccount = async(call, callback) => {
  const { name, email } = call.request;

    const { error } = createAccountSchema.validate({ name, email });
    if (error) {
      return callback({
        code: status.INVALID_ARGUMENT,
        message: error.details[0].message,
      });
    }

  try {
    const account = await prisma.account.create({
      data: { name, email },
    });
    callback(null, { id: account.id, message: 'Account created successfully' });
  } catch (error) {
    console.error('error while creating a customer at prisma at createAccount method: ',error.message)
    callback({
      code: status.ALREADY_EXISTS,
      message: 'Account with this email already exists',
    });
  }
};

export const getAccount = async(call, callback) => {
  const { id } = call.request;

  const { error } = getAccountSchema.validate({ id });
  if (error) {
    return callback({
      code: status.INVALID_ARGUMENT,
      message: error.details[0].message,
    });
  }


  try {
    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (account) {
      callback(null, account);
    } else {
      callback({
        code: status.NOT_FOUND,
        message: 'Account not found',
      });
    }
  } catch (error) {
    console.error("Error fetching user using prisma orm : ",error.message)
    callback({
      code: status.INTERNAL,
      message: 'Something went wrong',
    });
  }
};

export const updateBalance = async (call, callback) => {
  const { id, amount } = call.request;

  const { error } = updateBalanceSchema.validate({ id, amount });
  if (error) {
    return callback({
      code: status.INVALID_ARGUMENT,
      message: error.details[0].message,
    });
  }

  if (amount < 0) { 
    return callback({
      code: status.INVALID_ARGUMENT,
      message: 'Invalid argument: amount cannot be negative',
    });
  }
  
  try {
    const account = await prisma.account.update({
      where: { id },
      data: { balance:{ set:amount } },
    });
   

    callback(null, {
      id: account.id,
      updated_balance: account.balance,
      message: 'Balance updated successfully',
    });
  } catch (error) {
    console.error("error at updateBalance of account-service:",error.message)
    callback({
      code: status.NOT_FOUND,
      message: 'Account not found',
    });
  }
};