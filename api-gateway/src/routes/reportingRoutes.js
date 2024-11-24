import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 


// Load account.proto
const PROTO_PATH = path.join(__dirname, '../../../proto/reporting.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const reportingProto = grpc.loadPackageDefinition(packageDefinition);

// gRPC client setup
const client = new reportingProto.reporting.ReportingService(
  'localhost:50054',
  grpc.credentials.createInsecure()
);

const router = express.Router();

//Get all the transactions of a customer
router.get('/transactions/:accountId', (req, res) => {
      const { accountId } = req.params;
    
      client.GetTransactions({ accountId }, (error, response) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(200).json(response);
      });
    });
    
// Get Transaction summary of a client
    router.get('/summary/:accountId', (req, res) => {
      const { accountId } = req.params;
    
      client.GetTransactionSummary({ accountId }, (error, response) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(200).json(response);
      });
    }); 
    
 
    export default router;