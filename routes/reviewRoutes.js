const express=require('express');
const router=express.Router({mergeParams:true}); //so we can have access of req.params on both sides
const catchAsync=require('../utilities/catchAsync');
const {validateReview, isLoggedIn, isReviewCreator}=require('../middleware')
const reviews=require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.makeReview));

router.delete('/:reviewId', isLoggedIn, isReviewCreator ,catchAsync(reviews.deleteReview));

module.exports=router;