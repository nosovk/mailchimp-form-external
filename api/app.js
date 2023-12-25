const fetch = require('node-fetch');
const express = require('express');

const app = express();

app.use(express.json());

const basicAuthCredits = Buffer.from(`${process.env.USERNAME}:${process.env.mailchimpkey}`).toString('base64');


app.get('/api/audiences', async (req, res) => {
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists`,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuthCredits}`
        }
    });
    const body = await resp.json();
    const { lists } = body;
    const mapped = lists?.map(({ id, name }) => ({ id , name })) ?? {};
    return res.json(mapped);
});

app.get('/api/audiences/:id/tags', async (req, res) => {
    const { id } = req.params;
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${id}/segments/?type=static`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuthCredits}`
        }
    });
    const body = await resp.json();
    const { segments } = body;
    const mapped = segments?.map(({ id, name }) => ({ id , name })) ?? {};
    return res.json(mapped);
});

// audience строка - аудитория переданная с фронта
// tags массив строк - тэги переданные с фронта
// contact - объект - данные контакта
app.post('/api/addContact', async (req, res) => {
    const { contact, audience, tags } = req.body;
    const status = 'subscribed';

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


    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${audience}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuthCredits}`
        },
        body: JSON.stringify(bodyToSend)
    });

    if (resp.ok) {
        return res.status(201).end();
    } 

    return res.status(400).end();
});

app.listen(process.env.PORT || 3001, () => {
    console.log('[OK] Server started on port ' + process.env.PORT);
});
