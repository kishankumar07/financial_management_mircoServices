import { getChannel } from '../config/rabbitMQ.js';

export const checkRabbitMQHealth = async () => {
  try {
    const channel = getChannel();
    await channel.checkQueue('health-check');
    return { status: 'healthy', message: 'RabbitMQ is connected' };
  } catch (error) {
    console.error('RabbitMQ health check failed:', error.message);
    return { status: 'unhealthy', message: 'RabbitMQ connection failed' };
  }
};
