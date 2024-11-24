import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';

dotenv.config()

import { createTransaction, getTransaction, listTransactions } from '../services/transactionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load transaction.proto
const PROTO_PATH = path.join(__dirname, '../../proto/transaction.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const transactionProto = grpc.loadPackageDefinition(packageDefinition).transaction;

// Create gRPC server
const server = new grpc.Server();

server.addService(transactionProto.TransactionService.service, {
  CreateTransaction: createTransaction,
  GetTransaction: getTransaction, 
  ListTransactions: listTransactions,
});

const PORT = 50053;
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(`Transaction Service running at http://localhost:${PORT}`);
//     server.start();
  }
);
