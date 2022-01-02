const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    mrp : {
        type : Number,
        required : true
    },
    quantity : {
        type: Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    imageUrl : {
        type : String,
        required : true
    },
    specifications : {
        type : [ String ]
    },
    category : {
        type : Schema.Types.ObjectId,
        ref : 'catagory',
        required : true
    }
})

module.exports = mongoose.model('Product' , productSchema);