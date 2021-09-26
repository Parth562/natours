const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '268d3df18d5bf4',
            pass: '490af804e1461f',
        },
    });

    const mailOptions = {
        from: 'Manish giri <manishgiri562@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    transport.sendMail(mailOptions);
};

module.exports = sendEmail;
