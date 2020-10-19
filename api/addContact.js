require('dotenv').config();

const fetch = require('node-fetch');
const express = require('express');

const app = express();

app.use(express.json());

// audience строка - аудитория переданная с фронта
// tags массив строк - тэги переданные с фронта
// contact - объект - данные контакта
app.post('/', async (req, res) => {
    const { contact, audience, tags } = req.body;
    const status = 'pending';

    const bodyToSend = {
        email_address: contact.email,
        status,
        merge_fields: {
            "FNAME": contact.fullname,
            "MMERGE6": contact.organization,
            "PHONE": contact.phone,
            "ADDRESS": contact.address
        },
        tags
    };


    const basicAuthCredits = Buffer.from(`${process.env.USERNAME}:${process.env.MAILCHIMP_KEY}`).toString('base64');
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${audience}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuthCredits}`
        },
        body: JSON.stringify(bodyToSend)
    });
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Headers", "content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With, access-control-allow-origin");
    // res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (resp.ok) {
        return res.status(201).send();
    } 

    return res.status(400).send();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`[OK] Server started on port ${port}`);
});
