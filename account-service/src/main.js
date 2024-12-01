import grpc from '@grpc/grpc-js';
import express from 'express'
import { createAccount, getAccount, updateBalance } from './services/accountServices.js';
import path from 'path';
import protoLoader from '@grpc/proto-loader';
import { connectRabbitMQ } from './config/rabbitMQ.js';
import { consumeBalanceUpdates } from './consumers/balanceConsumer.js';
import { fileURLToPath } from 'node:url';
import { checkRabbitMQHealth } from './healthCheck/rabbitMQHealthCheck.js';
import logger from './config/logger.js'

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const PROTO_PATH = path.join(__dirname, '../proto/account.proto');

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

const GRPC_PORT = '50051';

try {
  await connectRabbitMQ();
  await consumeBalanceUpdates();
} catch (error) {
  logger.error('Failed to initialize RabbitMQ:', error.message);
  process.exit(1); // Exit the process if RabbitMQ setup fails
}
server.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), async() => {
  logger.info(`Account Service is running on port ${GRPC_PORT}`);

  // Initialize RabbitMQ and consumers
  
});

// to handle the health checks , metrics

const app = express();

// RabbitMQ Health Check Endpoint
app.get('/health/rabbitmq', async (req, res) => {
  const healthStatus = await checkRabbitMQHealth();
  const statusCode = healthStatus.status === 'healthy' ? 200 : 500;
  res.status(statusCode).json(healthStatus);
});


const HTTP_PORT = process.env.ACCOUNT_HTTP_PORT || 3001;


app.listen(HTTP_PORT, () => {
  logger.info(`HTTP server (Health checking) running on http://localhost:${HTTP_PORT}`);
});


// How to Identify the Role
// If you see code with:

// new AccountService: It's a gRPC client connecting to the server.
// server.addService: It's a gRPC server exposing methods for clients to call.