import { transporter } from "../../config/nodeMailerConfig.js";


export const sendEmailNotification = async(email, message) => {   
  console.log('email of recipient: ',email)  ;
  console.log('message gonna send:',message)
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
      console.error('Error sending notification at notification-service method sendEmailNotification--:', error);
    }
    
    console.log(`Notification sent at notification service---: ${info.response}`);
  });
};
    