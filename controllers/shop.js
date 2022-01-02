const Product = require('../models/product');
const Order = require('../models/order');
const Catagory = require('../models/category');

const ITEMS_PER_PAGE = 4;

exports.getHome = (req,res,next) => {
    let allCategories;

    Catagory.find().limit(4).then( categories => {
        allCategories = categories;
        return Product.find().limit(4);
    })
    .then(products => { 
        res.render('shop/index',{ products : products , categories : allCategories , path : 'home' , title : 'Home'});
    })
    .catch(err => {
        res.redirect('/500');
    })
};


exports.getProducts = (req,res,next) => {

  let page = parseInt(req.query.page);
  let totalProducts;
  if(!page) page = 1;


  Product.find().count().then( numProducts => {
    totalProducts = numProducts;
    return Product.find()
          .skip( (page-1) * ITEMS_PER_PAGE )
          .limit(ITEMS_PER_PAGE)
  })
  .then((products) => {
    res.render("shop/products", { 
      products: products , 
      currentPage : page , 
      hasNextPage : ITEMS_PER_PAGE * page < totalProducts , 
      hasPrePage : page > 1 , 
      nextPage :  page + 1 , 
      prePage : page - 1 ,
      path : 'products' , 
      title : 'Products'
    });
  })
  .catch((err) => {
    res.redirect('/500');
  });

}



exports.getCategory = (req,res,next) => {
    let page = parseInt(req.query.page);
    let totalCategories;
    if(!page) page = 1;

    Catagory.find().count().then( numCat => {
        totalCategories = numCat;
        return Catagory.find().skip( (page -1 )* ITEMS_PER_PAGE ).limit(ITEMS_PER_PAGE)
    })
    .then( categories => {
        res.render("shop/categories", { 
            categories: categories , 
            currentPage : page , 
            hasNextPage : ITEMS_PER_PAGE * page < totalCategories , 
            hasPrePage : page > 1 , 
            nextPage :  page + 1 , 
            prePage : page - 1 ,
            path : 'category' , 
            title : 'Category'
          });
    })
    .catch((err) => {
        res.redirect('/500');
      });
}


exports.getProductsByCategory = (req,res,next) => {

  const catId = req.params.catId;

  let page = parseInt(req.query.page);
  let totalProducts;
  if(!page) page = 1;


  Product.find({category : catId}).count().then( numProducts => {
    totalProducts = numProducts;
    return Product.find({category : catId})
          .skip( (page-1) * ITEMS_PER_PAGE )
          .limit(ITEMS_PER_PAGE)
  })
  .then((products) => {
    res.render("shop/products", { 
      products: products , 
      currentPage : page , 
      hasNextPage : ITEMS_PER_PAGE * page < totalProducts , 
      hasPrePage : page > 1 , 
      nextPage :  page + 1 , 
      prePage : page - 1 ,
      path : 'products' , 
      title : 'Products'
    });
  })
  .catch((err) => {
    res.redirect('/500');
  });
}


exports.getProductPage = (req,res,next) => {
    const prodId = req.params.prodId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product' , { product : product , path : 'products' , title : 'Products'})
    })
    .catch(err => {
        res.redirect('/500');
    })
};


exports.getCart = (req,res,next) => {
    req.user
    .populate('cart.items.productId')
    .then(user => {
        res.render('shop/cart' , {cartItems : user.cart.items , path : 'cart' , title : 'Cart'});
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
        res.render('shop/order' , { orders : orders , path : 'order' , title : 'Orders'});
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