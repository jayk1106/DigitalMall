const express = require('express');
const {body} = require('express-validator');

const adminController = require('../controllers/admin');
const isAdmin = require('../middleware/is-Admin');

const router = express.Router();



// Admin Auth

router.get('/' , adminController.getAdminLogin );

router.post('/admin_login' , adminController.postAdminLogin);


// products

router.get('/products' , isAdmin , adminController.getProducts);

router.post('/add-new-product', [
    body('title' , "Title atleast 3 character long").isLength({min : 3}).trim(),
    body('price' , "Price must be numaric").isNumeric().trim(),
    body('mrp' , "MRP must be numaric").isNumeric().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAdmin , adminController.postAddNewProduct);
router.get('/add-new-product', isAdmin , adminController.getAddNewProduct);


router.get('/update-product/:prodId' , isAdmin , adminController.getUpdateProduct);
router.post('/update-product',[
    body('title' , "Title atleast 3 character long").isLength({min : 3}).trim(),
    body('price' , "Price must be numaric").isNumeric().trim(),
    body('mrp' , "MRP must be numaric").isNumeric().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAdmin , adminController.postUpdateProduct);


router.get('/delete-product/:prodId', isAdmin , adminController.getDeleteProduct);


// Catagories

router.get('/add-new-catagory', isAdmin , adminController.getAddNewCatagory);
router.post('/add-new-catagory',[
    body('name' , "Name is required").contains().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAdmin , adminController.postAddNewCatagory);

router.get('/catagory', isAdmin , adminController.getCatagory);

router.get('/update-catagory/:catId', isAdmin , adminController.getUpdateCatagory);
router.post('/update-catagory',[
    body('name' , "Name is required").contains().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAdmin , adminController.postUpdateCatagory);

router.get('/delete-catagory/:catId', isAdmin , adminController.getDeleteCatagory);




module.exports = router;