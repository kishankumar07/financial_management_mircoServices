import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';


import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 


// Load account.proto
const PROTO_PATH = path.join(__dirname, '../../../proto/account.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const accountProto = grpc.loadPackageDefinition(packageDefinition);

// gRPC client setup
const client = new accountProto.account.AccountService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const router = express.Router();

// Route: Create Account
router.post('/', (req, res) => {
  const { name, email } = req.body;
  client.CreateAccount({ name, email }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// Route: Get Account
router.get('/:id', (req, res) => {
  const { id } = req.params;
  client.GetAccount({ id }, (error, response) => {
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

// Route: Update Balance
router.put('/:id/balance', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  client.UpdateBalance({ id, amount }, (error, response) => {
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

export default router;
