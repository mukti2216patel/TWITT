var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const upload = require("./multer");
const postModel = require('./posts')

passport.use(new localStrategy(userModel.authenticate()));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    
    return next();
  } else {
    console.log("back")
    res.redirect('/');
   
  }
}

router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});



router.get("/profile", isLoggedIn, function (req, res, next) {
  const user = req.user;
  console.log(user)
  if (user.Age && user.profession && user.hobby) {
    res.render("profile", { nav: false, users: user , details:true});
  } else {
    res.render("profile", { nav: false, users: user ,details:false});
  }
});

router.get("/notification", isLoggedIn,(req, res, next) => {
  const user = req.user;
  res.render("notification", { nav: false ,users:user });
});
router.get('/posts' , (req,res,next)=>{
  res.render('post',{nav:false})
})

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    console.log(user);
    await user.save();
  }
);

router.post("/register", async (req, res, next) => {
  const { username, fullname, email, contact, password } = req.body; // password is destructured from req.body
  const newUser = new userModel({ username, fullname, email, contact }); // userModel.register expects password as an argument
  newUser.lastLogin.push(new Date());
  userModel
    .register(newUser, password) // password is used here
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        console.log(newUser);
        res.redirect('/profile');
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
});
router.get('/userpost',isLoggedIn ,async (req,res,next)=>{
  console.log("hey")
  const user = await userModel.findById(req.user._id).populate('posts');
  console.log(user);
  if(user)
    {
      res.render('show' , {users:user});
    }

})
router.get('/add',isLoggedIn , (req,res,next)=>{
  const user = req.user;
  res.render('create' , {users:user});
})
router.get('/feed' , isLoggedIn ,async (req,res,next)=>{
  try {
    const posts = await postModel.find().populate('user1', 'fullname username profileImage');
    console.log(posts); // Log the posts object
    res.render('feed', { posts: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.redirect('/');
  }
})

router.get('/alluser' , isLoggedIn ,async (req,res,next)=>{
 
    const users = await userModel.find();
    console.log(users); // Log the posts object
    res.render('alluser', { users});
  
})


router.post('/createpost' ,isLoggedIn , upload.single('postimage'),async (req,res,next)=>{
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
    const newpost = new postModel({
      user1: user._id,
      title: req.body.title,
      description: req.body.description,
      postimage: req.file.filename,
      likes: 0,
    });
    user.posts.push(newpost._id);
    await user.save();
    await newpost.save();
    // user.populate(posts);
    console.log(user);
    console.log(newpost);
    res.redirect('/profile');
  
});

router.post("/profile", isLoggedIn, async (req, res, next) => {
  try {
    const user = req.user; // Get the currently authenticated user
    if (user) {
      user.Age = req.body.Age;
      user.profession = req.body.profession;
      user.hobby = req.body.hobby;
      await user.save();
      console.log("User profile updated successfully");
      res.redirect("/lastlogin");
    } else {
      console.log("User not found");
      res.redirect("/"); // Redirect to home page or handle the error appropriately
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.redirect("/profile"); // Redirect to profile page or handle the error appropriately
  }
});

router.get('/lastlogin', isLoggedIn,async (req, res, next) => {
  try {
    const user = req.user;
    console.log("hii")
    console.log(user);
    if (user) {
      user.lastLogin.push(new Date());
      await user.save();
      console.log(user);
      res.redirect('/profile');
    } else {
      console.error('User not found');
      res.redirect('/'); // Redirect to home page or handle the error appropriately
    }
  } catch (error) {
    console.error('Error updating last login:', error);
    res.redirect('/profile'); // Redirect to profile page or handle the error appropriately
  }
});


router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/lastlogin",
    failureRedirect: "/",
  }),
  async (req, res) => {
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
