
const adminchecksession=(req,res,next)=>{
    if (req.session.admin){
        
        next()
    }
    else{
        res.redirect('/admin/login')}
    
    
    
    }



    
const adminloginback=(req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin/')
    }
    else{next()}
}


module.exports={adminchecksession,adminloginback}