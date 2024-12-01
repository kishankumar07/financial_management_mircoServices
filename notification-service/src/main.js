import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { sendEmailNotification } from './services/notificationService.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectRabbitMQ } from '../config/rabbitMQ.js';
import { consumeNotificationMessages } from './consumers/notification.consumers.js';
import logger from '../config/logger.js';


const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename); 

const PROTO_PATH = path.join(__dirname, '../proto/notification.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

const server = new grpc.Server();

server.addService(notificationProto.NotificationService.service, {
  SendNotification: sendEmailNotification,
});

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 50052;
try {
 await connectRabbitMQ();
 await consumeNotificationMessages();
} catch (error) {
 logger.error('Failed to initialize RabbitMQ:', error.message);
 process.exit(1); 
}
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), async() => {
  console.log(`Notification service running at http://localhost:${PORT}`);
  // server.start();

   // Initialize RabbitMQ and consumers
  
});


