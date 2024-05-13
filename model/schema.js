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
   isAdmin:{
      type:Boolean,
      default:false
   }
   });


   const model = mongoose.model('userdb',SomeModelSchema)

   module.exports = model