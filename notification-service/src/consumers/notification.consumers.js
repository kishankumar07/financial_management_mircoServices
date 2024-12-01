import { sendEmailNotification } from '../services/notificationService.js';
import { getChannel } from '../../config/rabbitMQ.js';



// Start consuming messages from RabbitMQ queue
export const consumeNotificationMessages = async () => {
  const channel = getChannel();
  try {
    await channel.assertQueue('notifications', { durable: true });

    channel.consume('notifications', async (msg) => {
      if (msg) {
        const { email, message } = JSON.parse(msg.content.toString());
        console.log('Notification received at notification-service after passing through rabbitMQ:', { email, message });
        
        await sendEmailNotification(email, message);
        channel.ack(msg); 
      }
    });

    console.log('Notification Service is listening for messages...');
  } catch (error) {
    console.error('Error consuming messages in notification service:', error);
  }
};

