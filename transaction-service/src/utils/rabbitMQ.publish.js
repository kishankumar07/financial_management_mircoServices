import { getChannel } from "../config/rabbitMQ.js";


// Publish a message to a specific queue
export const publishTransactionMessage = async (queue, message) => {
  const channel = getChannel();
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  console.log(`Message published from transaction-service to queue "${queue}":`, message);
};
