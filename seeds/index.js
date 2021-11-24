const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/Yelpcamp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})
    .then(data=>{
        console.log('Connected to Database');
    })
    .catch(err=>{
        console.log('Something went wrong with Mongo')
        console.log(err)
    });

const Campground=require('../models/campground');
const cities=require('./cities');
const {descriptors, places}=require('./seedHelpers');

const sample= array=>{
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB= async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const randomPrice=Math.floor(Math.random()*200+200);
        const c=new Campground({
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            geometry:{
                type : "Point",
                coordinates : [ cities[random1000].longitude, cities[random1000].latitude] },
            images: [
                {
                  url: 'https://res.cloudinary.com/djmubpf63/image/upload/v1625313082/Yelpcamp/rqkeptgigyammpa6m3oj.jpg',
                  filename: 'Yelpcamp/rqkeptgigyammpa6m3oj'
                },
                {
                  url: 'https://res.cloudinary.com/djmubpf63/image/upload/v1625313082/Yelpcamp/drtt8uzaf1ulstpdpglf.jpg',
                  filename: 'Yelpcamp/drtt8uzaf1ulstpdpglf'
                },
                {
                  url: 'https://res.cloudinary.com/djmubpf63/image/upload/v1625313082/Yelpcamp/gljme7gxfpbfempatfg1.jpg',
                  filename: 'Yelpcamp/gljme7gxfpbfempatfg1'
                },
                {
                  url: 'https://res.cloudinary.com/djmubpf63/image/upload/v1625313082/Yelpcamp/iaj7dsn7ztcl7lyjyce6.jpg',
                  filename: 'Yelpcamp/iaj7dsn7ztcl7lyjyce6'
                }
              ],
            price:randomPrice,
            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id sapien et orci vestibulum posuere. Ut volutpat eget est facilisis tristique. Cras mattis, lacus in suscipit consequat, tortor sem mollis nisl, at egestas mauris diam sit amet magna. Aliquam nec justo ut felis molestie consectetur. Curabitur sit amet sollicitudin justo. Quisque sed magna a purus ornare gravida.',
            creator:"60ccd7059b6c3543708a58c7"
        })

        await c.save();
    }
}

seedDB()
    .then(()=>{
        mongoose.connection.close();
    });
