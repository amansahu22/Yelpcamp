const User=require('../models/user');

module.exports.renderRegisterForm=(req,res)=>{
    res.render('user/register');
};

module.exports.register=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        const user=new User({
            email,
            username
        });
        const newUser=await User.register(user,password);
        req.login(newUser, err=>{ //if there is any error occured
            if(err) return next(err)
            req.flash('success','Welcome to Yelpcamp');
            res.redirect('/campgrounds');  
        })
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render('user/login'); 
 };

module.exports.login=(req,res)=>{
    req.flash('success','Welcome back');
    const returnTo=req.session.returnTo || '/campgrounds'; //if we are directly hitting /login route rather than redirecting back to login ,in that case we would redirect user to /campgrounds
    delete req.session.returnTo;
    res.redirect(returnTo);
};

module.exports.logout=(req,res)=>{
    req.logout();
    req.flash('success','GoodBye, See you soon');
    res.redirect('/campgrounds');
};