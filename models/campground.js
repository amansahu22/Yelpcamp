const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require('./review');

const ImageSchema = new Schema({ //we can only set virtual property to schema that's why we created seprate schema for image
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () { //we can call anything other as well in place of thumbnail(and it will set property on every name with that name)
    return this.url.replace('/upload', '/upload/w_150,c_fill');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema= new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,

    geometry: { //we took it from mongoose geojson
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },

    images:[ImageSchema],
    creator:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
}, opts );

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<b><p>go to campground page...</p></b>
            <p><a href="/campgrounds/${this._id}">${this.title}</a></p>`
});

CampgroundSchema.post('findOneAndDelete', async function(campground){
    if(campground){
        await Review.deleteMany({
            _id: { $in : campground.reviews}
        })
    }
}) //if any campground will be deleted then we will have access to that campground here in this post function

module.exports=mongoose.model('Campground', CampgroundSchema);