const Product = require('../models/product');
const Order = require('../models/order');

exports.getHome = (req,res,next) => {
    Product.find()
    .then(products => {
        res.render('shop/index',{ products : products });
    })
    .catch(err => {
        res.redirect('/500');
    })
};

exports.getProductPage = (req,res,next) => {
    const prodId = req.params.prodId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product' , { product : product })
    })
    .catch(err => {
        res.redirect('/500');
    })
};


exports.getCart = (req,res,next) => {
    req.user
    .populate('cart.items.productId')
    .then(user => {
        res.render('shop/cart' , {cartItems : user.cart.items});
    }).catch(err => {
        res.redirect('/500');
    })
}


exports.postCart = (req,res,next) => {
    const productId = req.body.productId;
    
    req.user.addToCart(productId)
    .then( result => {
        res.redirect('/cart');
    })
    .catch( err => {
        res.redirect('/500');
    })
}


exports.postRemoveFromCart = (req,res,next) => {
    const productId = req.body.productId;

    req.user
    .removeToCart(productId)
    .then( result => {
        res.redirect('/cart');
    })
    .catch( err => {
        res.redirect('/500');
    })
}



exports.getOrders = (req,res,next) => {
    Order.find({ userId : req.user._id})
    .then( orders => {
        res.render('shop/order' , { orders : orders});
    })
    .catch(err => {
        res.redirect('/500');
    })
}

exports.postOrder = (req,res,next) => {
    const userId = req.user._id;

    req.user
    .populate('cart.items.productId')
    .then( user => {
        
        const products = user.cart.items.map( i => {
            return { qty : i.qty , product : i.productId._doc};
        })
        
        const order = new Order({
            products : products,
            userId : userId
        })

        return order.save();
    })
    .then( result => {
        return req.user.clearCart();
    })
    .then( result => {
        res.redirect('/order');
    })
    .catch( err => {
        res.redirect('/500');
    })

    
}