import logger from '../config/logger.js';
import { getChannel } from '../config/rabbitMQ.js';
import { updateBalance } from '../services/accountServices.js';

let processedCount = 0;
let rejectedCount = 0;

/**
 * Consumes messages from the 'balance-update' queue and updates account balances
 */
export const consumeBalanceUpdates = async () => {
  const channel = getChannel();

  const queue = 'balance-update';
  await channel.assertQueue(queue, { durable: true });
  logger.info(`account-service ; Listening for messages in queue: ${queue}`);

  channel.consume(queue, async (message) => {
    if (message) {
      try {
        const { accountId, newBalance } = JSON.parse(message.content.toString());

        logger.info(`Received balance update message: accountId=${accountId}, newBalance=${newBalance}`);

        // Call the updateBalance function directly with gRPC-like payload
        await updateBalance({ request: { id: accountId, amount: newBalance } }, (err, res) => {
          if (err) {
            logger.error(`Error updating balance for accountId=${accountId}:`, err.message);
          } else {
            logger.info(`Balance updated successfully for accountId=${accountId}:`, res);
          }
        });

        processedCount++; // Increment the processed count
        logger.info(`Messages processed successfully: ${processedCount}`);
        channel.ack(message); // Acknowledge message after processing
      } catch (error) {
        rejectedCount++;
        logger.error('Failed to process balance update message:', error.message);
        logger.error(`Message rejected:${rejectedCount}`)
        channel.nack(message, false, false); // Reject the message without requeue
      }
    }
  });
};
