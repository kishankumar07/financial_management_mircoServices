import express from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs'
import accountRoutes from './routes/accountRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js'
import reportingRoutes from './routes/reportingRoutes.js'
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Swagger setup
const swaggerFilePath = path.join(__dirname,'../swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/accounts', accountRoutes);
app.use('/notifications', notificationRoutes); 
app.use('/transactions',transactionRoutes)
app.use('/reporting',reportingRoutes)
 
app.listen(PORT, () => {
  console.log(`API Gateway is running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});


// -------------------------------------------------------------
// import express from 'express';
// import proxy from 'express-http-proxy';

// const app = express();
// const PORT = 3000;

// // Sample validation middleware
// const validateNotificationPayload = (req, res, next) => {
//   const { email, message } = req.body;
//   if (!email || !message) {
//     return res.status(400).json({ error: 'Email and message are required.' });
//   }
//   next();
// };

// app.use("/accounts",proxy('http://localhost:50051',{
//   proxyReqPathResolver:(req) =>`/` + req.url
// }))

// // Proxy for Notification Service with additional validation
// app.use('/notifications', validateNotificationPayload, proxy('http://localhost:50052', {
//   proxyReqPathResolver: (req) => `/` + req.url,
//   userResDecorator: (proxyRes, proxyResData) => {
//     // You can transform the response data if needed
//     const parsedData = JSON.parse(proxyResData.toString('utf8'));
//     if (parsedData.error) {
//       // Add custom error handling if necessary
//       return JSON.stringify({ error: 'Something went wrong with the notification service' });
//     }
//     return proxyResData;
//   }
// }));

// app.listen(PORT, () => {
//   console.log(`API Gateway is running on http://localhost:${PORT}`);
// });





