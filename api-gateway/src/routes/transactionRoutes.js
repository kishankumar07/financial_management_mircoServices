import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, '../../../proto/transaction.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const transactionProto = grpc.loadPackageDefinition(packageDefinition);
const client = new transactionProto.transaction.TransactionService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

// Create Transaction
router.post('/', (req, res) => {
  const { accountId, type, amount } = req.body;
  client.CreateTransaction({ accountId, type, amount }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// Get Transaction
router.get('/:id', (req, res) => {
  const { id } = req.params;
  client.GetTransaction({ id }, (error, response) => {
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

// List Transactions for an Account
router.get('/account/:accountId', (req, res) => {
  const { accountId } = req.params;
  client.ListTransactions({ accountId }, (error, response) => {
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

export default router;
