import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify the transporter configuration
      transporter.verify((error, success) => {
       if (error) {
              console.error('SMTP Configuration Error:', error);
        } else {
              console.log('SMTP Connected Successfully');
            }
      });

     