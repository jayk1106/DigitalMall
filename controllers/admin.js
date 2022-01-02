const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');

const Product = require("../models/product");
const Catagory = require("../models/category");
const User = require('../models/user');

const ITEMS_PER_PAGE = 4;

// admin auth


exports.getAdminLogin = (req,res,next) => {
  res.render('admin/login' , {oldInput : {} , errorMessage : null , path : 'login' , title : 'Admin login' });
}

exports.postAdminLogin = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({isAdmin : true , email : email})
  .then( admin => {
    
    if(!admin){
      return  res.status(422).render('admin/login' , { errorMessage : "Invalid Email or Password", path : 'login' , title : 'Admin login' , oldInput : { email , password}});
    }

    bcrypt.compare(password , admin.password)
        .then( isMatch => {
            if(isMatch){
                req.session.user = admin;
                req.session.isLoggedIn = true;
                req.session.isAdmin = true;

                req.session.save( err => {
                    if(err) console.log(err);
                    res.redirect('/admin/products');
                })
            }else{
                return  res.status(422).render('admin/login' , { errorMessage : "Invalid Email or Password", path : 'login' , title : 'Admin login' , oldInput : { email , password}});
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


// products

exports.getProducts = (req, res, next) => {

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
    res.render("admin/products", { 
      products: products , 
      currentPage : page , 
      hasNextPage : ITEMS_PER_PAGE * page < totalProducts , 
      hasPrePage : page > 1 , 
      nextPage :  page + 1 , 
      prePage : page - 1 ,
      path : 'adminproducts',
      title : 'Admin Products'
    });
  })
  .catch((err) => {
    res.redirect('/500');
  });

    
};

exports.getAddNewProduct = (req, res, next) => {
  Catagory.find()
  .then( catagories => {
    res.render("admin/addNewProduct", { editMode: false, oldInput: {} ,  errorMessage : null , catagories : catagories , path : 'adminproducts', title : 'Add New Products'});
  })
  .catch( err => {
    res.redirect('/500');
  })
};

exports.postAddNewProduct = async (req, res, next) => {
  const specifications = [];
  // console.log( req.body.specItem1 , req.body.specItem2 ,req.body.specItem3 ,req.body.specItem4 ,req.body.specItem5)
  if (req.body.specItem1) {await specifications.push(req.body.specItem1);}
  if (req.body.specItem2) {await specifications.push(req.body.specItem2);}
  if (req.body.specItem3) {await specifications.push(req.body.specItem3);}
  if (req.body.specItem4) {await specifications.push(req.body.specItem4);}
  if (req.body.specItem5) {await specifications.push(req.body.specItem5);}

  Catagory.find()
  .then( catagories => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array();
      return res
        .status(422)
        .render("admin/addNewProduct", {
          editMode: false,
          errorMessage : errors[0].msg,
          oldInput: {
            title: req.body.title,
            price: req.body.price,
            mrp: req.body.mrp,
            description: req.body.description,
            specItem1 :req.body.specItem1,
            specItem2 : req.body.specItem2,
            specItem3 : req.body.specItem3,
            specItem4 : req.body.specItem4,
            specItem5 : req.body.specItem5,
            category : req.body.category,
            quantity : req.body.quantity,
          },
          catagories : catagories,
          path : 'adminproducts',
          title : 'Add New Products'
        });
    }
  
    let image = req.file;
    // console.log(image);
    if(!image){
      return res
      .status(422)
      .render("admin/addNewProduct", {
        editMode: false,
        errorMessage : "Please Upload image in png,jpg or jpeg format",
        oldInput: {
            title: req.body.title,
            price: req.body.price,
            mrp: req.body.mrp,
            description: req.body.description,
            specItem1 :req.body.specItem1,
            specItem2 : req.body.specItem2,
            specItem3 : req.body.specItem3,
            specItem4 : req.body.specItem4,
            specItem5 : req.body.specItem5,
            category : req.body.category,
            quantity : req.body.quantity,
        },
        catagories : catagories,
        path : 'adminproducts',
        title : 'Add New Products'
      });
    }
  
    const imageUrl = image.path;
    const product = new Product({
      title: req.body.title,
      price: req.body.price,
      mrp: req.body.mrp,
      description: req.body.description,
      imageUrl:imageUrl,
      specifications: specifications,
      category : req.body.category,
      quantity : req.body.quantity,
    });
    product
      .save()
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/500');
      });
  })
  .catch( err => {
    console.log(err);
    res.redirect('/500');
  })

  
};

exports.postUpdateProduct =  (req, res, next) => {
  const prodId = req.body._id;

  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedMrp = req.body.mrp;
  const updatedDescription = req.body.description;
  const updatedQuantity = req.body.quantity;
  const updatedCategory = req.body.category;

  Catagory.find()
  .then( async (catagories) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = errors.array();
      return res
        .status(422)
        .render("admin/addNewProduct", {
          product : {_id : prodId , specifications : []},
          editMode: true,
          errorMessage : errors[0].msg,
          oldInput: {
            title: req.body.title,
            price: req.body.price,
            mrp: req.body.mrp,
            quantity : req.body.quantity,
            description: req.body.description,
            specItem1 :req.body.specItem1,
            specItem2 : req.body.specItem2,
            specItem3 : req.body.specItem3,
            specItem4 : req.body.specItem4,
            specItem5 : req.body.specItem5,
            category : req.body.category,
          },
          catagories : catagories,
          path : 'adminproducts',
          title : 'Update Products'
        });
    }
  
    const specifications = [];
    if (req.body.specItem1) {await specifications.push(req.body.specItem1);}
    if (req.body.specItem2) {await specifications.push(req.body.specItem2);}
    if (req.body.specItem3) {await specifications.push(req.body.specItem3);}
    if (req.body.specItem4) {await specifications.push(req.body.specItem4);}
    if (req.body.specItem5) {await specifications.push(req.body.specItem5);}
  
    Product.findById(prodId)
      .then((product) => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.mrp = updatedMrp;
        product.quantity = updatedQuantity;
        product.description = updatedDescription;
        product.specifications = specifications;
        product.category = updatedCategory;
        if(req.file){
          product.imageUrl = req.file.path;
        }
        return product.save();
      })
      .then((result) => {
        res.redirect("/admin/products");
      })
      .catch((err) => {
        res.redirect('/500');
      });
  })
  .catch( err => {
    console.log(err);
    res.redirect('/500');
  })
  
};

exports.getUpdateProduct = (req, res, next) => {
  const prodId = req.params.prodId;

  Catagory.find()
  .then( catagories => {
    Product.findById(prodId)
    .then((product) => {
      res.render("admin/addNewProduct", { product: product, editMode: true ,errorMessage : null , oldInput : {} , catagories : catagories , path : 'adminproducts', title : 'Update Products'});
    })
    .catch((err) => {
      res.redirect('/500');
    });
  })
  .catch( err => {
    console.log(err);
    res.redirect('/500');
  })
  
};

exports.getDeleteProduct = (req, res, next) => {
  const prodId = req.params.prodId;

  Product.findByIdAndRemove(prodId)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

// Catagories

exports.getAddNewCatagory = (req, res, next) => {
  res.render("admin/addCatagory", { editMode: false , errorMessage: null , oldInput :{} , path : 'admincategory' , title : 'Admin Category'});
};

exports.postAddNewCatagory = (req, res, next) => {
  
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array();
    return res
      .status(422)
      .render("admin/addCatagory", {
        editMode: false,
        errorMessage : errors[0].msg,
        oldInput: {
          name: req.body.name,
          description: req.body.description,
        },
        path : 'admincategory',
        title : 'Admin Category'
      });
  }
  let image = req.file;
  console.log(image);
  if(!image){
    return res
    .status(422)
    .render("admin/addCatagory", {
      editMode: false,
      errorMessage : "Please Upload image in png,jpg or jpeg format",
      oldInput: {
        name: req.body.name,
        description: req.body.description,
      },
      path : 'admincategory',
      title : 'Admin Category'
    });
  }
  const imageUrl = image.path;
  const catagory = new Catagory({
    name: req.body.name,
    description: req.body.description,
    imageUrl:imageUrl,
  });

  catagory
    .save()
    .then((result) => {
      res.redirect("/admin/catagory");
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.getCatagory = (req, res, next) => {

  let page = parseInt(req.query.page);
    let totalCategories;
    if(!page) page = 1;

    Catagory.find().count().then( numCat => {
        totalCategories = numCat;
        return Catagory.find().skip( (page -1 )* ITEMS_PER_PAGE ).limit(ITEMS_PER_PAGE)
    })
    .then( categories => {
        res.render("admin/catagory", { 
            catagories: categories , 
            currentPage : page , 
            hasNextPage : ITEMS_PER_PAGE * page < totalCategories , 
            hasPrePage : page > 1 , 
            nextPage :  page + 1 , 
            prePage : page - 1 ,
            path : 'admincategory' , 
            title : 'Admin Category'
          });
    })
    .catch((err) => {
        res.redirect('/500');
      });
};

exports.getUpdateCatagory = (req, res, next) => {
  const catId = req.params.catId;

  Catagory.findById(catId)
    .then((catagory) => {
      res.render("admin/addCatagory", { editMode: true, catagory: catagory , errorMessage: null , oldInput:{} , path : 'admincategory', title : 'Update Category'});
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.postUpdateCatagory = (req, res, next) => {
  const catId = req.body._id;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors = errors.array();
    return res
      .status(422)
      .render("admin/addCatagory", {
        editMode: true,
        errorMessage : errors[0].msg,
        oldInput: {
          name: req.body.name,
          description: req.body.description,
        },
        path : 'admincategory', 
        title : 'Update Category'
      });
  }

  Catagory.findById(catId)
    .then((catagory) => {
      catagory.name = req.body.name;
      catagory.description = req.body.description;
      if(req.file){
        catagory.imageUrl = req.file.path;
      }

      return catagory.save();
    })
    .then((result) => {
      res.redirect("/admin/catagory");
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.getDeleteCatagory = (req, res, next) => {
  const catId = req.params.catId;

  Catagory.findByIdAndRemove(catId)
    .then((result) => {
      res.redirect("/admin/catagory");
    })
    .catch((err) => {
      res.redirect('/500');
    });
};
