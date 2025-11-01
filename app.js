const express = require('express');
// Load environment variables from .env into process.env
require('dotenv').config();

const connectDB = require('./config/db');
const ejs = require('ejs');
const Photo = require('./models/Photo');

const app = express();
connectDB();

app.set('view engine', 'ejs');



// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
    const photos = await Photo.find({});
    res.render('index', {
        photos
    });
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/photos', async (req, res) => {
    await Photo.create(req.body);
    res.redirect('/');
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});