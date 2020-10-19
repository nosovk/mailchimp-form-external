const fetch = require('node-fetch');
const express = require('express');

const app = express();

app.use(express.json());

app.get('/api/audiences', async (req, res) => {
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists?apikey=${process.env.mailchimpkey}`);
    const body = await resp.json();
    const { lists } = body;
    const mapped = lists.map(({ id, name }) => ({ id , name }));
    return res.json(mapped);
});

app.get('/api/audiences/:id/tags', async (req, res) => {
    const { id } = req.params;
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${id}/segments/?apikey=${process.env.mailchimpkey}&type=static`);
    const body = await resp.json();
    const { segments } = body;
    const mapped = segments.map(({ id, name }) => ({ id , name }));
    return res.json(mapped);
});

// audience строка - аудитория переданная с фронта
// tags массив строк - тэги переданные с фронта
// contact - объект - данные контакта
app.post('/api/addContact', async (req, res) => {
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


    const basicAuthCredits = Buffer.from(`${process.env.USERNAME}:${process.env.mailchimpkey}`).toString('base64');
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${audience}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuthCredits}`
        },
        body: JSON.stringify(bodyToSend)
    });

    if (resp.ok) {
        return res.status(201).send();
    } 

    return res.status(400).send();
});

app.listen(process.env.PORT, () => {
    console.log('[OK] Server started on port ' + process.env.PORT);
});
