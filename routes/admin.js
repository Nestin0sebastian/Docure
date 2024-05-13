var express = require('express');
var router = express.Router();
const model = require('../model/schema')
const adminmodel=require('../model/adminschema')
const usermodel=require('../model/schema')
/*GET home page.*/


router.get('/adminlog',(req,res)=>{
  try{
  res.render('admindisplay')
}
catch(error){
  console.log(error)
}})

router.post('/adminlog',async(req,res)=>{
  const email =req.body.email
  const password=req.body.password
const [adminstorage]=await adminmodel.aggregate([
  {
    $match:{email:email
    }
  }
])
if(adminstorage){
if(password===adminstorage.password){
  
res.redirect('/admin/home2')}
}

console.log(adminstorage)
})



router.get('/home2',(req,res)=>{
  try{
  res.render('homepage/home2')
}
catch(error){
  console.log(error)
}})



router.get('/edit',(req,res)=>{
  try{
  res.render('adduser/sign')
}
catch(error){
  console.log(error)
}})







router.get('/add',(req,res)=>{
  try{
  res.render('adduser/sign')
}
catch(error){
  console.log(error)
}})


router.get('/users',async(req,res)=>{
  try{
    const userstorage= await usermodel.find({})
    console.log(userstorage)
  res.render('userlist',{userstorage})

}
catch(error){
  console.log(error)
}})











router.post('/deleteUser/:id', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const id = req.params.id;
    const userData = await model.findOne({ _id: id });

    if (userData) {
      // Check if the user to be deleted is the currently logged-in admin
      if (req.session.isadmin && req.session.user === userData.email) {
        // Clear the session to log out the admin
        req.session.destroy((err) => {
          if (err) {
            console.error(err);
          }
        });
      }

      // Delete the user from the database
      await model.deleteOne({ _id: id });

      return res.redirect('/admin');
    } else {
      // Handle user not found
      return res.status(404).send("User not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});








module.exports = router;