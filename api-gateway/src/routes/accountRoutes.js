import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';


import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 


// Load account.proto
const PROTO_PATH = path.join(__dirname, '../../proto/account.proto');
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
  'account-service:50051', // Docker service name instead of localhost
  grpc.credentials.createInsecure()
);

const router = express.Router();


// -----------------------------------------------------------
/**
 * @ DESC    Create a new user [must provide name & email] 
 * 
 *  POST     /accounts/
 *  
 *  Access   Public
 */
router.post('/', (req, res) => {
  const { name, email } = req.body;
  client.CreateAccount({ name, email }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(response);
  });
});

// ------------------------------------------------------------

/**
 * @ DESC    Fetch a user acc details [ id required in path params ] 
 * 
 *  GET     /accounts/:id
 *  
 *  Access   Private
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  client.GetAccount({ id }, (error, response) => {
    if (error) {
      return res.status(404).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

//-----------------------------------------------------------------

/**
 * @ DESC    Update balance of account using account id [ id required ] 
 * 
 *  PUT     /accounts/:id/balance
 *  
 *  Access   Private
 */
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
