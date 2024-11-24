import { transporter } from "../../config/nodeMailerConfig.js";

export const sendNotification = (call, callback) => {
      const { email, message } = call.request;
    
      if (!email || !message) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Email and message are required',
        });
      }


  // Nodemailer email options
  const mailOptions = {
    from: process.env.SMTP_USER, 
    to: email,                  
    subject: '<< Transaction Alert >>', 
    text: message,     
    html: `<p>${message}</p>`,         
  };

   // Send the email
   transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending notification:', error);
      return callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to send notification',
      });
    }

    console.log(`Notification sent at notification service---: ${info.response}`);
    callback(null, {
      success: true,
      details: `Notification sent to ${email}`,
    });
  });
};
    