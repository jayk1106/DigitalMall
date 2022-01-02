const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-Auth');

const router = express.Router();

router.get('/' , shopController.getHome);

router.get('/category' , shopController.getCategory)

router.get('/category/:catId'  , shopController.getProductsByCategory );

router.get('/products' , shopController.getProducts);

router.get('/product/:prodId' , shopController.getProductPage);

router.get('/cart' , isAuth , shopController.getCart);

router.post('/cart', isAuth , shopController.postCart);

router.post('/remove-from-cart', isAuth , shopController.postRemoveFromCart);

router.get('/order', isAuth , shopController.getOrders );

router.post('/order', isAuth , shopController.postOrder);

module.exports = router;