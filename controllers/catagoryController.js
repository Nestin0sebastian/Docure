const session = require('express-session')
const categoryModel = require('../model/category');





const addcategory=(req,res)=>{
    res.render('admin/addcategory')
  }

const addcategorypost = async (req, res) => {
    try {
      const { name, description } = req.body;

      let hello=req.body
      console.log(hello,'hhhhhhhhhhhhhhhhhhhhhh')
  
      // Convert the incoming category name to lowercase for case-insensitive comparison
      const categoryNameLowerCase = name.toLowerCase();
  
      // Find existing category case-insensitively
      const existingCategory = await categoryModel.findOne({ name: { $regex: new RegExp(`^${categoryNameLowerCase}$`, 'i') } });
  
      if (existingCategory) {
        // Display a simple alert if the category already exists
        return res.send(
          '<script>alert("This category already exists"); window.location.href = "/admin/addcategory";</script>'
        );
      } else {
        const newData = {
          name,
          description
        };
  
        const categoryData = await categoryModel.create(newData);
        console.log(categoryData);
        return res.status(200).redirect('/admin/addcategory');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  };
  


  const listed = async (req, res) => {
    try {
        console.log("//////////////////////////////////////////", req.params)
        const { userId } = req.params;
        const category = await categoryModel.findById(userId);
  
        if (!category) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Toggle the user's block status
        console.log(category.islist);
        category.islist = !category.islist;
        await category.save();
  
        // Update islist property for each product in the category
        
  
        res.json({ message: 'User status updated successfully', isblocked: category.islist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  


  module.exports={
    addcategory,
    addcategorypost,
    listed

  }