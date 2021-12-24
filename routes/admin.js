const express = require('express');
const {body} = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-Auth');

const router = express.Router();

router.get('/products' , isAuth , adminController.getProducts);

router.post('/add-new-product', [
    body('title' , "Title must be alphanumeric and atleast 3 character long").isAlphanumeric().isLength({min : 3}).trim(),
    body('price' , "Price must be numaric").isNumeric().trim(),
    body('mrp' , "MRP must be numaric").isNumeric().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAuth , adminController.postAddNewProduct);
router.get('/add-new-product', isAuth , adminController.getAddNewProduct);


router.get('/update-product/:prodId' , isAuth , adminController.getUpdateProduct);
router.post('/update-product',[
    body('title' , "Title must be alphanumeric and atleast 3 character long").isAlphanumeric().isLength({min : 3}).trim(),
    body('price' , "Price must be numaric").isNumeric().trim(),
    body('mrp' , "MRP must be numaric").isNumeric().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAuth , adminController.postUpdateProduct);


router.get('/delete-product/:prodId', isAuth , adminController.getDeleteProduct);


// Catagories

router.get('/add-new-catagory', isAuth , adminController.getAddNewCatagory);
router.post('/add-new-catagory',[
    body('name' , "Name is required").contains().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAuth , adminController.postAddNewCatagory);

router.get('/catagory', isAuth , adminController.getCatagory);

router.get('/update-catagory/:catId', isAuth , adminController.getUpdateCatagory);
router.post('/update-catagory',[
    body('name' , "Name is required").contains().trim(),
    body('description', "Description must be in range of 5 to 400 characters").isLength({min:5 , max : 400}).trim(),
], isAuth , adminController.postUpdateCatagory);

router.get('/delete-catagory/:catId', isAuth , adminController.getDeleteCatagory);

module.exports = router;