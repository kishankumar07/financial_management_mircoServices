import grpc from '@grpc/grpc-js';
import { createAccount, getAccount, updateBalance } from './services/accountServices.js';
import path from 'path';
import protoLoader from '@grpc/proto-loader';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const PROTO_PATH = path.join(__dirname, '../../proto/account.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const accountProto = grpc.loadPackageDefinition(packageDefinition).account;

const server = new grpc.Server();

server.addService((accountProto).AccountService.service, {
  CreateAccount: createAccount,
  GetAccount: getAccount,
  UpdateBalance: updateBalance,
});

const PORT = '50051';

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Account Service is running on port ${PORT}`);
  
});


// How to Identify the Role
// If you see code with:

// new AccountService: It's a gRPC client connecting to the server.
// server.addService: It's a gRPC server exposing methods for clients to call.