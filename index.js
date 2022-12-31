const express = require('express');
const app = express();
const {Router} = require('express');
const router = Router();
const nodemailer = require('nodemailer');
const cors = require('cors');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//settings
app.set('port',process.env.PORT || 4000);

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());
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
    res.send('Bienvenido a GMAIL-SEND-MSG-NODEJS')
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