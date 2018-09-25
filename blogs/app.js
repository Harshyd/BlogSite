var app = require("express")();
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
app.set("view engine","ejs");
var methodOverride = require("method-override");
app.use(bodyparser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
mongoose.connect('mongodb://localhost:27017/blogsite');

var blogschema = new mongoose.Schema({
   title: String,
   image: String,
   desc: String
});

var Blog = mongoose.model("blog",blogschema);

// Blog.deleteMany({_id:"5b8a57ae184e480f1cf7ddfe"},function(err,bg){
//     if(err) console.log("error in deletion!");
//     else console.log("fine !");
// });

app.get("/",function(req,res){
  Blog.find({},function(err,blogs){
      if(err) console.log("error in landing !");
      else res.render("landing",{blogs:blogs})
  });
    //res.render("landing",{blogs:blgs});
});

app.get("/blogs/create",function(req,res){
   res.render("new"); 
});

app.delete("/blogs/:id",function(req,res){
    Blog.remove({_id:req.params.id},function(err){
        if(err) console.log("error in deletion !")
        else {res.redirect("/")}
    });
   // res.redirect("/");
   // res.send("this is delete route !")
});

app.get("/blogs/:id",function(req,res){
     var userid = req.params.id;
     Blog.findById(userid,function(err,user){
         if(err) {
             console.log(err)
             
         }
         else {
             //console.log(user)
             res.render("detailblog",{user: user})
         }
     });
     
});

app.post("/blogs",function(req,res){
    var blog = {title: req.body.title,image: req.body.image,desc: req.body.desc};
    Blog.create(blog,function(err,blg){
        if(err) console.log("error in adding!");
        else console.log(blog);
    });
    res.redirect("/");
});

app.listen(process.env.PORT||3000,process.env.IP,function(){
    console.log("server has started !");
});