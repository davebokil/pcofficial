var express = require("express");
const exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
const path = require('path');

// Create a new express app
const app = express();
// Set an initial port
const PORT = process.env.PORT || 3000;

require('dotenv').config();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Run Morgan for Logging
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static("./public"));


// NodeMail
const nodemailer = require('nodemailer');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));



// -------------------------------------------------

// Main "/" Route. Redirect user to React App
app.get("/", function(req, res) {
    res.render('home');
});

app.post('/send', (req, res) => {
    const output = `
    <p>Hey Pat! You have a new contact request:</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Reason for Contacting: ${req.body.inquiry}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  	
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Mailgun",
        auth: {
            user: process.env.GUN_USER, // generated ethereal user
            pass: process.env.GUN_PASS // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"P. Connaughton Official Website" <postmaster@sandbox219d4744045542aea2393eed39485472.mailgun.org>', // sender address
        to: process.env.DEST, // list of receivers
        subject: 'New Contact Form Submission', // Subject line
        text: 'New Contact Request', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        var msg = "Your message has been sent!"
        res.render('confirmation');
    });
});


// -------------------------------------------------

// Server Start
app.listen(PORT, function() {
    console.log("App listening on PORT: " + PORT);
});