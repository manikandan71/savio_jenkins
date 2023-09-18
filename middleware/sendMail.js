const nodemailer = require('nodemailer');

module.exports=
{
    handleMail:async(data)=>
    {
        console.log('heello',data);
        var url = 'https://development.dezxa59xxrr6g.amplifyapp.com/'
        // Create a transporter object using your email service provider's SMTP settings
        const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'mani.zenix@gmail.com',
                pass: 'ijmisbohjlrneqpe'
                }
             });
    
            // Set up the email options
            if(data.user_id)
            {
                var mailOptions = {
                    from: 'mani.zenix@gmail.com',
                    to: data.email,
                    subject: data.subject,
                    text: `Your Login User ID : ${data.user_id} 
                            and Password : ${data.password}
                            url: ${url}`,
                };
            }
            else
            {
                var mailOptions = {
                    from: 'mani.zenix@gmail.com',
                    to: data.email,
                    subject: data.subject,
                    text: `${data.otp}`
                };
            }
        
    console.log('check the mail options',mailOptions)
            // Send the email
        transporter.sendMail(mailOptions, async(error, info) => {
                if (error) {
                console.log('Error occurred:', error.message);
                return error.message
                } else {
                console.log('Email sent successfully!');
                console.log('Message ID:', info.messageId);
                var res = `Email sent successfully! Message ID:${info.messageId} `
                return res
                }
            });
    },
    cronJobMail:async()=>
    {
        var url = 'https://development.dezxa59xxrr6g.amplifyapp.com/'
        // Create a transporter object using your email service provider's SMTP settings
        const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'mani.zenix@gmail.com',
                pass: 'ijmisbohjlrneqpe'
                }
             });
    
            // Set up the email options
                var mailOptions = {
                    from: 'mani.zenix@gmail.com',
                    to: 'manikandan.m@ittstar.com',
                    subject: 'AGENT AUTO LOGOUT ',
                    text: 'cron job successfully runned at 11:30 PM (EST) and all users logout successfully'
                };
        
            // Send the email
        transporter.sendMail(mailOptions, async(error, info) => {
                if (error) {
                console.log('Error occurred:', error.message);
                return error.message
                } else {
                console.log('Email sent successfully!');
                console.log('Message ID:', info.messageId);
                var res = `Email sent successfully! Message ID:${info.messageId} `
                return res
                }
            });
    }
}

