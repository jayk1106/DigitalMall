const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    cart : {
        items : [ { productId : {type: Schema.Types.ObjectId , ref : 'Product' , required: true} , qty : { type:Number, required: true } }]
    },
    isAdmin : {
        type: Boolean
    },
    resetToken : {
        type : String
    },
    resetTokenExpire : {
        type : Date
    }
})


// Methods

userSchema.methods.addToCart = function(productId) {
    //compare if product is already there or not
    const cartProductIndex = this.cart.items.findIndex( cp => {
        return cp.productId.toString() === productId.toString();
    })

    let newQty = 1;
    let updatedCartItems = [...this.cart.items ]; // Assign old value

    if(cartProductIndex >= 0){
        // Already Present
        newQty = this.cart.items[cartProductIndex].qty + 1;
        updatedCartItems[cartProductIndex].qty = newQty;
    }else {
        updatedCartItems.push({
            productId : productId,
            qty : 1
        })
    }

    let updatedCart = {
        items : updatedCartItems
    }

    this.cart = updatedCart;

    return this.save();
}


userSchema.methods.removeToCart = function(productId){

    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    })

    this.cart.items = updatedCartItems;

    return this.save();
}


userSchema.methods.clearCart = function(){
    this.cart.items = [];
    return this.save();
}


module.exports = mongoose.model('User' , userSchema);