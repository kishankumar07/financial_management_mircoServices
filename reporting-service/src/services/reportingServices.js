import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const TRANSACTION_PROTO_PATH = path.join(__dirname,`../../../proto/transaction.proto`)

const transactionPackageDefinition = protoLoader.loadSync(TRANSACTION_PROTO_PATH);
const transactionProto = grpc.loadPackageDefinition(transactionPackageDefinition).transaction;


// Create gRPC client for transaction-service
const transactionClient = new transactionProto.TransactionService(
      process.env.TRANSACTION_SERVICE_URL || 'localhost:50053',
      grpc.credentials.createInsecure()
    );

    // Fetch all transactions for an account
      export const getTransactions = (call, callback) => {
      const { accountId } = call.request;
    
      if (!accountId) {
        return callback({ 
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Account ID is required',
        });
      }
    
      // Call the transaction-service to get transactions
      transactionClient.ListTransactions({ accountId }, (error, response) => {
        if (error) {
          console.error('Error fetching transactions from transaction-service:', error);
          return callback({
            code: grpc.status.INTERNAL,
            message: 'Failed to fetch transactions',
          });
        }
    
        callback(null, response); // Forward the response from transaction-service
      });
    }; 


    export const getTransactionSummary = (call, callback) => {
      const { accountId } = call.request;
    
      if (!accountId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Account ID is required',
        });
      }
    
      // Fetch transactions and calculate the summary
      transactionClient.ListTransactions({ accountId }, (error, response) => {
        if (error) {
          console.error('Error fetching transactions from transaction-service:', error);
          return callback({
            code: grpc.status.INTERNAL,
            message: 'Failed to fetch transaction summary',
          });
        }
    
        // Process transactions to calculate the summary
        const { transactions } = response;
        console.log('the transactions are:',transactions)
        const totalDeposits = transactions
          .filter((t) => t.type === 'DEPOSIT')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = transactions
          .filter((t) => t.type === 'WITHDRAWAL')
          .reduce((sum, t) => sum + t.amount, 0);
        const currentBalance = totalDeposits - totalWithdrawals;
    
        callback(null, {
          totalDeposits,
          totalWithdrawals,
          currentBalance,
        });
      });
    };


// Potential Complexities of Direct gRPC Communication
// Increased Coupling:

// Direct gRPC calls couple the transaction-service tightly with the account-service and notification-service. This means:
// Any change in the account-service or notification-service API would require corresponding updates in the transaction-service.
// This tight coupling might reduce flexibility and hinder independent deployment of services.
// Error Handling and Resilience:

// With direct gRPC calls, the transaction-service must handle all potential errors (e.g., service downtime, connection issues).
// Using the API Gateway adds an abstraction layer that can implement retries or fallbacks. Without it, the transaction-service must implement these mechanisms.
// Service Discovery:

// Direct gRPC communication requires the transaction-service to know the exact addresses (e.g., account-service:50051) of the account-service and notification-service.
// In complex systems, service discovery tools like Consul or etcd might be required to dynamically resolve service addresses.
// Scalability:

// The API Gateway can load balance calls to account-service and notification-service if they scale horizontally (multiple replicas).
// Without the API Gateway, the transaction-service must manage load balancing itself or rely on the orchestration platform (e.g., Kubernetes).
// Security:

// The API Gateway can handle authentication and authorization centrally for all services.
// With direct gRPC communication, each service must implement its own authentication mechanism, potentially duplicating code.