const express = require('express');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
// Load environment variables from .env into process.env
require('dotenv').config();

const connectDB = require('./config/db');
const ejs = require('ejs');
const fs = require('fs');
const Photo = require('./models/Photo');

const app = express();
connectDB();

app.set('view engine', 'ejs');



// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));

// Routes
app.get('/', async (req, res) => {
    const photos = await Photo.find({}).sort( '-dateCreated');
    res.render('index', {
        photos
    });
});

app.get('/photos/:id', async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    res.render('photo', {
        photo
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/photos', async (req, res) => {

    // console.log(req.files.image);
    // await Photo.create(req.body);
    // res.redirect('/');

    const UploadDir = 'public/uploads/';
    if (!fs.existsSync(UploadDir)){
        fs.mkdirSync(UploadDir);
    }

    let UploadedImage = req.files.image;
    let uploadPath = __dirname + '/public/uploads/' + UploadedImage.name;

    UploadedImage.mv(uploadPath, async () => {
        await Photo.create({
            ...req.body,
            imageUrl: '/uploads/' + UploadedImage.name
        });
        res.redirect('/');
    });
});

app.get('/photos/edit/:id', async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    res.render('edit', { photo });
});

app.put('/photos/:id', async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    photo.title = req.body.title;
    photo.description = req.body.description;
    photo.save();
    res.redirect('/photos/' + req.params.id);
});

app.delete('/photos/:id', async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    let deletedImage = __dirname + '/public' + photo.imageUrl;
    fs.unlinkSync(deletedImage);
    await Photo.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});