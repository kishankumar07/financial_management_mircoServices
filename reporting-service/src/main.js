import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { getTransactions, getTransactionSummary } from './services/reportingServices.js';
import { fileURLToPath } from 'node:url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
const REPORTING_PROTO_PATH = path.join(__dirname,'../../proto/reporting.proto');

const packageDefinition = protoLoader.loadSync(REPORTING_PROTO_PATH);
const reportingProto = grpc.loadPackageDefinition(packageDefinition).reporting;

const server = new grpc.Server();

server.addService(reportingProto.ReportingService.service, {
  GetTransactions: getTransactions,
  GetTransactionSummary: getTransactionSummary, 
});

const PORT = process.env.REPORTING_SERVICE_PORT || 50054;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Reporting-Service running on port ${PORT}`);
//   server.start();
});
