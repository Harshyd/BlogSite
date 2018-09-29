var app = require("express")();
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var User = require("./models/user");
var Blog = require("./models/blogs")
var passport = require("passport");
var local = require("passport-local");
var plm = require("passport-local-mongoose");
app.set("view engine","ejs");
var methodOverride = require("method-override");

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
             //console.log("the length of comments rray is "+user.comments.length);
             res.render("detailblog",{blog: blog})
         }
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
    var blog = {title: req.body.title,image: req.body.image,desc: req.body.desc,date: d,creator : currentUser._id};
    Blog.create(blog,function(err,blg){
        if(err) console.log("error in adding!");
        //else console.log(blog);
    });
    res.redirect("/");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  User.register(new User({username:req.body.username}),req.body.password,function(err,user){
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
