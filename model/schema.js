   const mongoose = require('mongoose');
   const Schema = mongoose.Schema;
   const bcrypt = require('bcrypt')
   const SomeModelSchema = new Schema({
   firstname: String,
   lastname:String,
   email:String,
  
   password:{
      type:String,
   } ,
  isList:{
      type:Boolean,
      default:false
   },  wallet: {
      type: Number,
      default: 0,
      min: 0
   }
   });


   const model = mongoose.model('userdb',SomeModelSchema)

   module.exports = model