import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { sendNotification } from './services/notificationService.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const PROTO_PATH = path.join(__dirname, '../../proto/notification.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

const server = new grpc.Server();

server.addService(notificationProto.NotificationService.service, {
  SendNotification: sendNotification,
});

const PORT = process.env.PORT || 50052;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Notification service running at http://localhost:${PORT}`);
  // server.start();
});
