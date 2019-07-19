var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var Order = require('./models/order');
var User = require("./models/user");
var Blog = require("./models/blogs");
var nodemailer = require('nodemailer');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var passport = require("passport");
var local = require("passport-local");
var plm = require("passport-local-mongoose");
var path = require("path");
app.set("view engine","ejs");
var methodOverride = require("method-override");

app.use(express.static("public"));

var transporter = nodemailer.createTransport({
  service : 'gmail',
  auth :{
    user : 'yadavharsh400@gmail.com',
    pass: 'harshyadavrocks'
  }
});

//====using the required packages ! =====
app.use(bodyparser.urlencoded({extended : true}));
app.use(methodOverride("_method"));

app.use(require("express-session")({
  secret : "this is the secret",
  resave: false,
  saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

passport.use(new local(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

mongoose.connect('mongodb://localhost:27017/blogsite');

app.get("/",function(req,res){
  Blog.find({},function(err,blogs){
      if(err) console.log("error in landing !");
      else res.render("landing",{blogs:blogs})
  });
    //res.render("landing",{blogs:blgs});
});

app.get("/blogs/create",isloggedin,function(req,res){
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
     var blogid = req.params.id;
     Blog.findById(blogid,function(err,blog){
         if(err) {
             console.log(err)
             
         }
         else {
          User.findById(blog.seller,function(err,user){
            if(err){
              console.log(err);
            }
            else
            {
              res.render("detailblog",{blog:blog,name:user.username});
            }
          });
         }
     });
     
});

var fsearch = function()
{
	var ul,li,a,filter;
	filter = document.getElementById("search").value.toUpperCase();
	ul = document.getElementsByTagName("ul")[0];
	li = ul.getElementsByTagName("li");
	for(var i=0;i<li.length();i++)
	{
	console.log(li[i].getElementsByTagName("a")[0].innerHTML.toUpperCase());
	if(li[i].getElementsByTagName("a")[0].innerHTML.toUpperCase().indexOf(filter)>-1) li[i].style.display = "none";
	else li[i].style.display = "none";
	}
	

}

app.get("/search",function(req,res){
	User.find(function(err,users)
	{
		if(err) console.log(err);
		else res.render("sch",{users:users}); 
	});	
});

app.get("/blogs/:id/addcomment",isloggedin,function(req,res){
	Blog.findById(req.params.id,function(err,user){
		if(err) console.log(err);
		else
		{
			res.render("comment",{user:user});
		}
	});
	//res.render("comment",{ID: req.params.id});
});

app.post("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,blog){
		if(err) console.log(err);
		else
		{
			blog.comments.push({author:req.user.username,content:req.body.Content});
			blog.save();
			//res.redirect("/blogs/"+req.params.id);
			console.log(blog.comments);
			res.redirect("/blogs/"+req.params.id);
		}
	});
	//res.send("this is a post request in a detailed blog page !")
});

app.post("/blogs",function(req,res){
  var d = new Date();
  d = String(d);
  d = d.slice(0,15);
  var id = String(req.user._id);
  User.findById(id,function(err,user){
    if(err)
    {
      console.log(err);
    }
    else
    {
      //console.log(user.username);
      var blog = {title: req.body.title,image: req.body.image,price: req.body.price,desc: req.body.desc,seller: user._id};
    Blog.create(blog,function(err,blg){
        if(err) console.log("error in adding!");
        //else console.log(blog);
    });
    res.redirect("/");
    }
  });
    
});

app.get("/profile",isloggedin,function(req,res){
  var s = req.user._id;
  s = String(s);
  Blog.find({creator: s},function(err,blogs){
    if(err){console.log(err);}
    else
    res.render("profile",{blogs:blogs});
  });
});

app.get("/orders",function(req,res){
  var id = String(req.user._id);
  User.findById(id,function(err,user){
    user.deepPopulate('sellorders.buyer sellorders.item',function(err,user){
      if(err) console.log(err);
      else 
      {
        console.log(user.sellorders);
        res.render("orders",{orders:user.sellorders});
      }
    });
  });
});

app.get("/myorders",function(req,res){
  var id = String(req.user._id);
  User.findById(id,function(err,user){
    user.deepPopulate('buyorders.seller buyorders.item',function(err,user){
      if(err) console.log(err);
      else 
      {
        res.render("myorders",{orders:user.buyorders});
      }
    });
  });
});

app.get("/buy/:id",isloggedin,function(req,res){
  console.log('buy called ')
  Blog.findById({_id:req.params.id},function(err,blog){
    if(err) console.log(err);
    else
    {
      res.render("buy",{blog:blog});
    }
  });
});

app.post("/placeorder/:id",function(req,res){
  Blog.findById({_id:req.params.id},function(err,blog){
    if(err) console.log(err);
    else
    {
      var id = String(req.user._id);
      var d = new Date();
      d = String(d);
      d = d.slice(0,15);
      Order.create({seller:blog.seller,buyer:id,item:blog._id,date: d,status:"undelivered",address: req.body.address,contact:req.body.contact},function(err,order){
       
        User.findById({_id:blog.seller},function(err,user){
          user.sellorders.unshift(order._id);
          user.save(function(err,user){
            if(err) console.log(err);
            else {
              User.findById({_id:order.buyer},function(err,user){
                transporter.sendMail({
                  from : 'yadavharsh400@gmail.com',
                  to : user.email,
                  text : (blog.title + ' has been sent to you '),
                  subject : 'order placing'
                },function(err,info){
                  if(err) console.log(err);
                  else console.log(info.response);
                });
                user.buyorders.unshift(order._id);
                user.save();
              });
            }
          });
        });
      });
      res.redirect("/"); 
    }
  });
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  console.log(req.body.isseller);
  User.register(new User({email: req.body.email,username:req.body.username,seller:(req.body.isseller=="on"),buyer:(req.body.isbuyer=="on")}),req.body.password,function(err,user){
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else
    {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});

app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/login"}),
  function(req,res){
});

function isloggedin(req,res,next){
  if(req.isAuthenticated())
  {
    return next();
  }
  res.redirect("/login")
}

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/secret",isloggedin,function(req,res){
  res.render("secret");
});

app.listen(process.env.PORT||3000,process.env.IP,function(){
    console.log("server has started !");
});
