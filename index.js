const express = require('express');
const app = express();
const {Router} = require('express');
const router = Router();
const nodemailer = require('nodemailer');
const cors = require('cors');
const morgan = require('morgan');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

app.use(cors());

app.use((req, res, next) => {
    // If 'Authorization' header not present
    if(!req.get('Authorization')){
        var err = new Error('Not Authenticated!')
        // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
        res.status(401).set('WWW-Authenticate', 'Basic')
        next(err)
    }
    // If 'Authorization' header present
    else{
        // Decode the 'Authorization' header Base64 value
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
        // <Buffer 75 73 65 72 6e 61 6d 65 3a 70 61 73 73 77 6f 72 64>
        .toString()
        // username:password
        .split(':')
        // ['username', 'password']

        var username = credentials[0]
        var password = credentials[1]
        
        // If credentials are not valid
        if(!(username === `${process.env.ID}` && password === `${process.env.IDPASS}`)){
            var err = new Error('Not Authenticated!')
            // Set status code to '401 Unauthorized' and 'WWW-Authenticate' header to 'Basic'
            res.status(401).set('WWW-Authenticate', 'Basic')
            next(err)
        } 
        res.status(200)
        // Continue the execution
        next()
    }
})


//settings
app.set('port',process.env.PORT || 4000);

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(morgan('dev'))
app.use("/",router);

const contactEmail = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:`${process.env.GMAIL}`,
        pass:`${process.env.PASSWORD}`
    },
})

contactEmail.verify((error)=>{
    if (error) {
        console.log(error);
    } else {
        console.log("Ready to Send");
    }
});

router.get("/",(req,res)=>{
    res.send('Bienvenido a GMAIL-SEND-MSG-NODEJS-1.2')
    });

router.post(`${process.env.ROUTER}`,(req,res)=>{
    const name = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const message = req.body.message;
    const phone = req.body.phone;
    const mail = {
        from:name,
        to:`${process.env.GMAIL}`,
        subject:"Contact Form Submission - Portfolio",
        html:`<p>Name: ${name}</p>
            <p>LastName: ${lastName}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
            <p>Message: ${message}</p>
        `,
    };

    contactEmail.sendMail(mail,(error)=>{
        if (error) {
            res.json(error)
        } else {
            res.json({code:200,status:"Message Sent"})
        }
    });
})

//starting the server
app.listen(app.get('port'),()=>{
    console.log(`server on port ${app.get('port')}`)
})