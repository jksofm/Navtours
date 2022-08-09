const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pug = require('pug');
const { convert } = require('html-to-text');

dotenv.config();


module.exports = class Email {
  constructor(user,url){
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Huy Le<${process.env.EMAIL_FROM}>`
  }
  newTransport(){
    if(process.env.NODE_ENV === "production"){
      return nodemailer.createTransport({
        service : "SendGrid",
        auth : {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }
      return nodemailer.createTransport({
        host:  process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    

  }

  async send(template,subject){
     ///1 render template
           const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName : this.firstName,
            url : this.url,
            subject

           })
     //2 define email options
     const mailOptions = {
      from : this.from,
      to: this.to,
      subject : subject,
      html ,
      text :  convert(html, {
        wordwrap: 130
      }),
      // html : 
    }
    //create transport and send email
       
      await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome(){
     await this.send("welcome","Welcome to the Natours !")
  }
  async sendResetPassword(){
    await this.send("passwordReset","Your password reset token(valid for only 10 minutes) !")
 }

}
const sendEmail = async options =>{
    //1)Create a transpoter
    // const transporter = nodemailer.createTransport({
    //     host:  process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     auth: {
    //       user: process.env.EMAIL_USERNAME,
    //       pass: process.env.EMAIL_PASSWORD
    //     }
    //   });

    //2) Define the emailoptions
              // const mailOptions = {
              //   from : "Nhi<nguyenhoangnhi@gmail.com>",
              //   to: options.email,
              //   subject : options.subject,
              //   text : options.message,
                // html : 
              }


    //3) Actually send the email
  // await  transporter.sendMail(mailOptions)

// module.exports = sendEmail;