const express = require('express');
const {body} = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login' , authController.getLogin);

router.post('/login' , authController.postLogin );



router.get('/signup' , authController.getSignup);
router.post('/signup' , [
    body("name" , "Username must be 3 character long").isLength({min : 3}).trim(),
    body('email' , "Enter Valid Email").isEmail().normalizeEmail(), // for removeing extra spaces or case diffrence in email 
    body('password',"Password must be 5 character long").isLength({ min: 5 }).trim(),
] , authController.postSignup);

router.post('/logout' , authController.postLogout);

router.get('/reset' , authController.getReset );
router.post('/reset' , authController.postReset );


router.get('/reset/:resetToken' , authController.getUpdatePassword);
router.post('/update-password' , authController.postUpdatePassword);

module.exports = router;