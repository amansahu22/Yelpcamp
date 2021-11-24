const express=require('express');
const router=express.Router();
const catchAsync=require('../utilities/catchAsync');
const {isLoggedIn,validateCampground,isCreator} = require('../middleware');
const campgrounds=require('../controllers/campgrounds');
var multer  = require('multer')
const {storage}=require('../cloudinary'); //here we need not to specify index.js bcz node automatically looks for index file in a folder
var upload = multer({ storage })

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.get('/:id', catchAsync(campgrounds.displayCampground));

router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(campgrounds.renderEditForm));

router.post('/', upload.array('image') ,validateCampground , isLoggedIn, catchAsync(campgrounds.createCampground)); //the way multer works we can't validateCampground before uploading
// router.post('/', upload.array('image'),  (req,res)=>{
//     console.log(req.body, req.files);
//     res.send(req.files);
// })

router.put('/:id',isLoggedIn, isCreator, upload.array('image') ,validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isCreator, catchAsync(campgrounds.deleteCampground));

module.exports=router;