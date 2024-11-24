import express from 'express';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROTO_PATH = path.join(__dirname, '../../../proto/notification.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(packageDefinition);

// gRPC client setup
const client = new notificationProto.notification.NotificationService(
  'localhost:50052', // Assuming the Notification Service runs on port 50052
  grpc.credentials.createInsecure()
);

const router = express.Router();

const validateNotificationPayload = (req, res, next) => {
      const { email, message } = req.body;
      if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required' });
      }
      next();
    };

// Route: Send Notification
router.post('/send',validateNotificationPayload, (req, res) => {
  const { email, message } = req.body;
  client.SendNotification({ email, message }, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(response);
  });
});

export default router;
