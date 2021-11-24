const Campground=require('../models/campground');
const { cloudinary }=require('../cloudinary');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const myAccessToken=process.env.MAPBOX_TOKEN;
const geoCodingService = mbxGeoCoding({ accessToken: myAccessToken });

module.exports.index=async (req,res)=>{
    const campgrounds= await Campground.find();
    res.render('campground/index', {campgrounds});
};

module.exports.renderNewForm=(req,res)=>{
    res.render('campground/new');
};

module.exports.createCampground=async (req,res,next)=>{

    const geoCodeData= await geoCodingService.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();

    const add=new Campground(req.body.campground);
    add.geometry=geoCodeData.body.features[0].geometry;
    add.images=req.files.map(file=>({
        url:file.path,
        filename:file.filename
    }));
    add.creator=req.user._id;
    await add.save();
    req.flash('success', 'Successfully created new Campground');
    res.redirect(`/campgrounds/${add._id}`);
};

module.exports.displayCampground=async (req,res)=>{
    const {id} = req.params;
    const foundCampground= await Campground.findById(id)
    .populate({          
        path: 'reviews',
        populate: {
            path: 'creator'
        } //yha hamne har review ko populate kiya sath hi usme jo user ka objectId dala tha usko bhi populate kiya ye nested populating h
    }).populate('creator'); 

    if(!foundCampground){
        req.flash('error', 'Can not find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campground/show', {foundCampground});

};

module.exports.renderEditForm=async (req,res)=>{
    const {id} = req.params;
    const foundCampground= await Campground.findById(id);
    if(!foundCampground){
        req.flash('error', 'Can not find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campground/edit', {foundCampground});
};

module.exports.updateCampground=async (req,res,next)=>{
    const {id}=req.params;
    const change= await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const moreImages=req.files.map(file=>({
        url:file.path,
        filename:file.filename
    }));
    change.images.push(...moreImages);
    await change.save();
    if (req.body.deleteImages) {
        console.log(req.body.deleteImages);
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await change.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Campground');
    res.redirect(`/campgrounds/${change._id}`);
};

module.exports.deleteCampground=async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground');
    res.redirect('/campgrounds');
};

