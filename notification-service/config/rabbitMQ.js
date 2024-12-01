import amqp from 'amqplib';
import logger from './logger.js';
import { RABBITMQ_CONFIG } from './rabbitMQ.config.js';

let channel;

export const connectRabbitMQ = async (maxRetries = 5, retryDelay = 2000) => {
  let retries = 0;

  while(retries < maxRetries){

    try {
      const { host, port, username, password } = RABBITMQ_CONFIG;
      const connectionString = `amqp://${username}:${password}@${host}:${port}`;
      const connection = await amqp.connect(connectionString);
 // Replace with RabbitMQ URL if hosted remotely
      channel = await connection.createChannel();
//       const healthCheckQueue = 'health-check';
//     await channel.assertQueue(healthCheckQueue, { durable: false });

    logger.info('notification-service -- Connected to RabbitMQ');
    return channel;
    } catch (error) {

      retries++;
     logger.error(`Failed to connect to RabbitMQ (attempt ${retries}/${maxRetries}):`, error.message);
      // Remember this is a while loop
      if (retries < maxRetries) {
        logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); 
        retryDelay *= 2; // Exponential backoff
      } else {
        logger.error('Max retries reached. Could not connect to RabbitMQ.');
        throw error;
      }
    }
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
  }
  return channel;
};
