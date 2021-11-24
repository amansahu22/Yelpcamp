const Campground=require('./models/campground');
const Review=require('./models/review');
const ExpressError=require('./utilities/ExpressError');
const {joiCampgroundSchema,joiReviewSchema}=require('./schemas.js');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //whenever our middleware will be hitted and if we are not logged in and redirected back to login url and after that we enter username and password then it would redirect us to default (/campgrounds)
        //so here we are keeping track off from where were we directed here
        req.session.returnTo=req.originalUrl;  
        req.flash('error','You must be LoggedIn first');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateCampground=(req,res,next)=>{
    const {error}=joiCampgroundSchema.validate(req.body);
    
    if(error){
        const msg=error.details.map(e=>e.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next()
    }
};

module.exports.isCreator = async (req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground.creator._id.equals(req.user._id)){
        req.flash('error', "you dont't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewCreator = async (req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId);
    if(!review.creator._id.equals(req.user._id)){
        req.flash('error', "you dont't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = joiReviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};