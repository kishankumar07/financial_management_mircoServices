export const RABBITMQ_CONFIG = {
      host: process.env.RABBITMQ_HOST || 'rabbitmq', // Use Docker service name as the host
      port: process.env.RABBITMQ_PORT || 5672,
      username: process.env.RABBITMQ_USERNAME || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    };
    