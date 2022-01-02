const crypto = require('crypto')

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {validationResult} = require('express-validator');


const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "kaneriyajay4@outlook.com",
      pass: "jaykaneriya@2001",
    },
});




module.exports.getLogin = (req,res,next) => {

    let flashMessage = req.flash('error');
    if(flashMessage.length > 0 ){
        flashMessage = flashMessage[0];
    }else{
        flashMessage = null;
    }
    res.render('auth/login' , { errorMessage : flashMessage, path: 'login' , title : 'LogIn' , oldInput : {}});
};

module.exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
        
    User.findOne({email : email})
    .then( user => {
        if(!user){
            return  res.status(422).render('auth/login' , { errorMessage : "Invalid Email or Password", path: 'login' , title : 'LogIn', oldInput : { email , password}});
        }
        bcrypt.compare(password , user.password)
        .then( isMatch => {
            if(isMatch){
                req.session.user = user;
                req.session.isLoggedIn = true;

                req.session.save( err => {
                    if(err) console.log(err);
                    res.redirect('/');
                })
            }else{
                return  res.status(422).render('auth/login' , { errorMessage : "Invalid Email or Password" , path: 'login' , title : 'LogIn' , oldInput : { email , password}});
                
            }
        })
        .catch( err => {
            res.redirect('/500');
        })
    })
    .catch( err => {
        res.redirect('/500');
    })
}


module.exports.postSignup =  (req,res,next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors =  errors.array();
        return res.status(422).render('auth/sign-up' , { errorMessage : errors[0].msg , path: 'signup' , title : 'SignUp' , oldInput : {name , email , password}});
    }

    User.findOne({email : email})
    .then( user => {
        if(user){
            return  res.status(422).render('auth/sign-up' , { errorMessage :"This Email is Already Registered", path: 'signup' , title : 'SignUp' , oldInput : {name , email , password}});
        }else{
            bcrypt.hash(password,12)
            .then( hashPassword => {
                const user = new User({
                    name : name,
                    email : email,
                    password : hashPassword
                })

                return user.save();
            })
            .then( result => {
                res.redirect('/login');
                return transporter.sendMail(
                    {
                      to: email,
                      from: "kaneriyajay4@outlook.com",
                      subject: "Welcome Message",
                      text: "You successfuly signed up in our website",
                    },
                    (err, info) => {
                      if (err) console.log(err);
                    //   else console.log("Email Send");
                    }
                  );
            })
            .catch( err => {
                res.redirect('/500');
            })
        }
    })
    .catch( err => {
        res.redirect('/500');
    })

}

module.exports.getSignup = (req,res,next) => {

    let flashMessage = req.flash('error');
    if(flashMessage.length > 0 ){
        flashMessage = flashMessage[0];
    }else{
        flashMessage = null;
    }

    res.render('auth/sign-up' , { errorMessage : flashMessage , oldInput : {} , path : 'signup' , title : 'SignUp'});
};



module.exports.postLogout = (req,res,next) => {
    req.session.destroy( err => {
        if(err) console.log(err);
        res.redirect('/');
    })
}


module.exports.getReset = (req,res,next) => {

    let flashMessage = req.flash('error');
    if(flashMessage.length > 0 ){
        flashMessage = flashMessage[0];
    }else{
        flashMessage = null;
    }
    res.render('auth/reset' , {errorMessage : flashMessage , path : 'reset' , title : 'Reset Password'});
}

module.exports.postReset = (req,res,next) => {
    const email = req.body.email;
    User.findOne({email : email })
    .then( user => {
        if(!user){
            req.flash('error' , 'Email is not Valid!');
            return res.redirect('/reset');
        }
        crypto.randomBytes(32 , (err , buffer) => {
            if(err) {
                console.log(err);
                return res.redirect('/reset');
            }
            const token = buffer.toString("hex");

            user.resetToken = token;
            user.resetTokenExpire = new Date(new Date().getTime()+3600000);
            user.save().then( result => {
                
                return transporter.sendMail(
                    {
                      to: req.body.email,
                      from: "kaneriyajay4@outlook.com",
                      subject: "Password Reset",
                      html: `
                        <p>You request for new passwprd</p>
                        // <p><a href="http://localhost:3001/reset/${token}">Click Here</a> to update passwprd</p>
                        <p>Only active for 1 hour. Ignore if you not request this.</p>
                    `,
                    },
                    (err, info) => {
                      if (err) {
                          console.log(err.message);
                          req.flash('error' , 'Somthing wrong try again');
                          res.redirect('/reset');
                      }  
                      else {
                        req.flash('error' , 'Mail Sent to your Email Adress');
                        res.redirect('/reset');
                      }   
                    }
                  );
            });
        } )

    }).catch(err => {
        res.redirect('/500');
    })
}

module.exports.getUpdatePassword = (req,res,next) => {
    
    const resetToken = req.params.resetToken;
    User.findOne({resetToken : resetToken , resetTokenExpire : { $gt: new Date() } })
    .then( user => {
        if(!user) {
            return res.redirect('/');
        }
        res.render('auth/update-passeord' , { userId : user._id , passToken : user.resetToken , path : 'updatePassword' , title : 'Update Password'});
        
    })
    .catch( err => {
        res.redirect('/500');
    })
}

module.exports.postUpdatePassword = (req,res,next) => {
    
    const userId = req.body._id;
    const passToken = req.body.token;
    const newPassword = req.body.password;

    let resetUser;
    User.findOne({_id:userId , resetToken: passToken , resetTokenExpire: {$gt: new Date()}})
    .then( user => {
        if(!user){
            console.log("User :",user);
            return res.redirect('/');
        }
        resetUser = user;
        bcrypt.hash(newPassword , 12)
        .then( hashPassword => {
            resetUser.password = hashPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpire = undefined;
            return resetUser.save();
        })
        .then( result => {
            res.redirect('/login');
        }); 
        
    })
    .catch( err => {
        res.redirect('/500');
    })

}