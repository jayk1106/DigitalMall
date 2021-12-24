const { validationResult } = require("express-validator");

const Product = require("../models/product");
const Catagory = require("../models/category");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products", { products: products });
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.getAddNewProduct = (req, res, next) => {
  res.render("admin/addNewProduct", { editMode: false, oldInput: {} ,  errorMessage : null });
};

exports.postAddNewProduct = (req, res, next) => {
  const specifications = [];
  if (req.body.specItem1) specifications.push(req.body.specItem1);
  if (req.body.specItem2) specifications.push(req.body.specItem2);
  if (req.body.specItem3) specifications.push(req.body.specItem3);
  if (req.body.specItem4) specifications.push(req.body.specItem4);
  if (req.body.specItem5) specifications.push(req.body.specItem5);

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
        },
      });
  }

  let image = req.file;
  console.log(image);
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
      },
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
  });
  product
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.postUpdateProduct = (req, res, next) => {
  const prodId = req.body._id;

  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedMrp = req.body.mrp;
  const updatedDescription = req.body.description;

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
          description: req.body.description,
          specItem1 :req.body.specItem1,
          specItem2 : req.body.specItem2,
          specItem3 : req.body.specItem3,
          specItem4 : req.body.specItem4,
          specItem5 : req.body.specItem5,
        },
      });
  }

  const specifications = [];
  if (req.body.specItem1) specifications.push(req.body.specItem1);
  if (req.body.specItem2) specifications.push(req.body.specItem2);
  if (req.body.specItem3) specifications.push(req.body.specItem3);
  if (req.body.specItem4) specifications.push(req.body.specItem4);
  if (req.body.specItem5) specifications.push(req.body.specItem5);

  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.mrp = updatedMrp;
      product.description = updatedDescription;
      product.specifications = specifications;
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
};

exports.getUpdateProduct = (req, res, next) => {
  const prodId = req.params.prodId;
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/addNewProduct", { product: product, editMode: true ,errorMessage : null , oldInput : {}});
    })
    .catch((err) => {
      res.redirect('/500');
    });
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
  res.render("admin/addCatagory", { editMode: false , errorMessage: null , oldInput :{}});
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
  Catagory.find()
    .then((catagories) => {
      res.render("admin/catagory", { catagories: catagories });
    })
    .catch((err) => {
      res.redirect('/500');
    });
};

exports.getUpdateCatagory = (req, res, next) => {
  const catId = req.params.catId;

  Catagory.findById(catId)
    .then((catagory) => {
      res.render("admin/addCatagory", { editMode: true, catagory: catagory , errorMessage: null , oldInput:{}});
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
