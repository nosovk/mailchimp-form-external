require('dotenv').config();

const fetch = require('node-fetch');
const express = require('express');

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists?apikey=${process.env.MAILCHIMP_KEY}`);
    const body = await resp.json();
    const { lists } = body;
    const mapped = lists.map(({ id, name }) => ({ id , name }));
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Headers", "content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With, access-control-allow-origin");
    // res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    return res.json(mapped);
});

app.get('/:id/tags', async (req, res) => {
    const { id } = req.params;
    const resp = await fetch(`https://us20.api.mailchimp.com/3.0/lists/${id}/segments/?apikey=${process.env.MAILCHIMP_KEY}&type=static`);
    const body = await resp.json();
    const { segments } = body;
    const mapped = segments.map(({ id, name }) => ({ id , name }));
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header("Access-Control-Allow-Headers", "content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With, access-control-allow-origin");
    // res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    return res.json(mapped);
});

// audience строка - аудитория переданная с фронта
// tags массив строк - тэги переданные с фронта
// contact - объект - данные контакта

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`[OK] Server started on port ${port}`);
});
