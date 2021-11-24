const Campground=require('../models/campground');
const Review=require('../models/review');

module.exports.makeReview=async (req,res,next)=>{
    const campground= await Campground.findById(req.params.id);
    const review=new Review(req.body.review);
    review.creator=req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash('success', 'Succesfully created new review');
    res.redirect(`/campgrounds/${campground._id}`);
    
};

module.exports.deleteReview=async (req,res,next)=>{
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewId }}); //to delete something from mongoose array we use pull operator where reviews is array of referances and we want to pull reviewId ref out
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);

}