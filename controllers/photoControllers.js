const Photo = require('../models/Photo');
const fs = require('fs');

exports.getAllPhotos = async (req, res) => {
    const page = req.query.page || 1;
    const photosPerPage = 2;

    const totalPhotos = await Photo.countDocuments({});
    const photos = await Photo.find({})
        .sort('-dateCreated')
        .skip((page - 1) * photosPerPage)
        .limit(photosPerPage);
    
    res.render('index', {
        photos,
        current: page,
        pages: Math.ceil(totalPhotos / photosPerPage)
    })
    // const photos = await Photo.find({}).sort( '-dateCreated');
    // res.render('index', {
    //     photos
    // });
};

exports.getPhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    res.render('photo', {
        photo
    });
};

exports.createPhoto = async (req, res) => {

    const UploadDir = 'public/uploads/';
    if (!fs.existsSync(UploadDir)){
        fs.mkdirSync(UploadDir);
    }

    let UploadedImage = req.files.image;
    let uploadPath = UploadDir + UploadedImage.name;

    UploadedImage.mv(uploadPath, async () => {
        await Photo.create({
            ...req.body,
            imageUrl: '/uploads/' + UploadedImage.name,
            dateCreated: new Date()
        });
        res.redirect('/');
    });
};

exports.updatePhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    photo.title = req.body.title;
    photo.description = req.body.description;
    photo.save();
    res.redirect('/photos/' + req.params.id);
};

exports.deletePhoto = async (req, res) => {
    const photo = await Photo.findById(req.params.id);
    let deletedImage = 'public' + photo.imageUrl;
    fs.unlinkSync(deletedImage);
    await Photo.findByIdAndDelete(req.params.id);
    res.redirect('/');
};