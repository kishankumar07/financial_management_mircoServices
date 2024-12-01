import grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch'
import { publishTransactionMessage } from '../src/utils/rabbitMQ.publish.js';

const prisma = new PrismaClient()

const API_GATEWAY_URL = process.env.API_GATEWAY_URL
//-------------------------------------------------------------------------
// Helper function to fetch account details
const fetchAccount = async (accountId) => {
  const response = await fetch(`${API_GATEWAY_URL}/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error(`Account with ID ${accountId} not found`);
  }
  return response.json(); 
};
// ---------------------------------------------------------------------------

// Helper function to update account balance
// const updateAccountBalance = async (accountId, amount) => {
//   const response = await fetch(`${API_GATEWAY_URL}/accounts/${accountId}/balance`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ amount }),
//   });
//   if (!response.ok) {
//     throw new Error(`Failed to update balance for account ID ${accountId}`);
//   }
//   return response.json();
// };

// ---------------------------------------------------------------------------
// Helper function to send notification (async using RabbitMQ)
const sendNotification = async (email, message) => {
  try {
    await publishTransactionMessage('notifications', { email, message });
    console.log('Notification message published at createTransactions.');
  } catch (error) {
    console.error('Failed to publish notification message at createTransactions:', error.message);
    throw new Error('Failed to queue notification');
  }
};


//------------------------------------------------------------------------

// To create a transaction
export const createTransaction = async (call, callback) => {
  const { accountId, type, amount } = call.request;

  if (!accountId || !type || !amount) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Account ID, type, and amount are required',
    });
  }


  try {
    // Step 1: Fetch account details
    const account = await fetchAccount(accountId);

    if (type === 'WITHDRAWAL' && account.balance < amount) {
      return callback({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Insufficient balance for withdrawal',
      });
    }
    console.log(`Account validated from account-service good to go: ${JSON.stringify(account)}`);

    // Step 2: Proceed to create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        accountId,
        type,
        amount,
        createdAt: new Date()
      },
    });

     // Step 3: Update account balance
     const newBalance = type === 'DEPOSIT'
     ? account.balance + amount
     : account.balance - amount;

     // Step 4: Publish balance update to RabbitMQ
     await publishTransactionMessage('balance-update', {
      accountId,
      newBalance,
    });
    console.log(`Balance update published: accountId=${accountId}, newBalance=${newBalance}`);

  // const updatedBala =  await updateAccountBalance(accountId, newBalance);
  // console.log('this is the updated bala------',updatedBala)

    // Publish transaction details to RabbitMQ
    await publishTransactionMessage('transactions', {
      id: transaction.id,
      accountId,
      type,
      amount,
      timestamp: transaction.createdAt,
    });

    console.log(`Transaction created and published: ${JSON.stringify(transaction)}`);


   // Step 5: Send a notification for the transaction
   const notificationMessage = `A ${type.toLowerCase()} of $${amount} has been made to your account.`;

   await sendNotification(account.email, notificationMessage);

   // Final response
   callback(null, {
     id: transaction.id,
     message: 'Transaction successfully created',
   });

    // console.log('Notification sent successfully.');
  } catch (error) {
    console.error('Error creating transaction at createTransaction from transaction-service:', error.message);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Failed to create transaction: ' + error.message,
    });
  }
};


//------------------------------------------------------------------------------------

// Get a transaction by ID
export const getTransaction = async (call, callback) => {
  const { id } = call.request;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Transaction not found',
      });
    }

    callback(null, transaction);
  } catch (error) {
    console.error('Error fetching transaction at getTransaction method of transaction-service:', error.message);
    
    callback({
      code: grpc.status.INTERNAL,
      message: 'Error fetching transaction',
    });
  }
};


//----------------------------------------------------------------------------------

// List Transactions for an Account
export const listTransactions = async (call, callback) => {
  const { accountId } = call.request;

  if (!accountId) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Account ID is required',
    });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { accountId },
    });

    callback(null, { transactions });
  } catch (error) {
    console.error(`error at listTransactions of transaction-service:${error.message}`);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Error fetching transactions',
    });
  }
};



// Why Validate accountId?

// Before creating a transaction, we need to ensure that the accountId exists in the account-service. Otherwise, we risk creating orphaned transactions for non-existent accounts.
// How to Validate accountId?

// The transaction-service should communicate with the account-service to check if the account exists before proceeding.
// Since we are using the ----------------------API Gateway--------------------------, the transaction-service can call the account-service through the gateway.
