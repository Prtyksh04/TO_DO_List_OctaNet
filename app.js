const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
app.use(express.static("public/css"));
app.use(express.static("public/assets"));
app.use(express.static("public/index"));
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "this is my todolist website",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://0.0.0.0:27017/todolistDB');

const userSchema = new mongoose.Schema({
    Email : String,
    Password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

const itemSchema = new mongoose.Schema({
    Item: String,
    Name:String,
    Email : String
});

const Item = mongoose.model('Item', itemSchema);

const projectSchema = new mongoose.Schema({
    Title: String,
    Color: String,
    Email:String
});

const Project = mongoose.model('Project', projectSchema);

//  handling the project routes


app.get("/addproject", (req, res) => {
    if(req.isAuthenticated()){
        res.render("todo");
    }
    else{
        res.redirect("/login");
    }
});
app.post("/addproject", (req, res) => {
    const username = localStorage.getItem('username');
    console.log(username);
    const projectname = req.body.projectname;
    const color = req.body.color;
    localStorage.setItem("projectname", projectname);

    const newproject = new Project({
        Title: projectname,
        Color: color,
        Email:username
    });
    newproject.save();
    res.redirect("/features");
});


// handling the features routes...
app.get("/features", (req, res) => {
    if(req.isAuthenticated()){
        const name = req.query.name;
        const username = localStorage.getItem('username');
    if (!name) {
        async function findproject() {
            const project = await Project.find({Email : username});
            res.render("todo", {
                name: "",
                Items: [],
                project: project
            });
        }
        findproject();
    }
    else {
        async function finddocument() {
            const document = await Item.find({Email : username , Name : name});
            console.log(document);
            async function findproject() {
                const project = await Project.find({Email : username});
                console.log(project);
                res.render("todo", {
                    name: name,
                    Items: document,
                    project: project
                });
            }
            findproject();
        }
        finddocument();
    }
    }else{
        res.redirect("/login");
    }
});

app.post("/features", (req, res) => {
    const item = req.body.task;
    const name = req.query.name;
    const username = localStorage.getItem('username');
    console.log(username);
    console.log(name);
    if(!name) console.log("not found");
    console.log(item);
    const newitem = new Item({
        Item: item,
        Name:name,
        Email:username
    });
    newitem.save();
    res.redirect("features?name=" + name);
});


// handling the delete function


app.post("/delete", (req, res) => {
    const taskid = req.body.deletetodo;
    const name = req.query.name;
    async function deletedocument() {
        const document = await Item.deleteOne({ _id: taskid });
        console.log(document);
        res.redirect("features?name="+ name);
    }
    deletedocument();
});


// handling the update function


app.post("/edit", (req, res) => {
    const task = req.body.task;
    const taskid = req.body.update;
    const name = req.query.name;
    async function updatedocument() {
        const result = await Item.updateOne({ _id: taskid }, { Item: task });
        if (result) {
            res.redirect("features?name="+name);
        }
    }
    updatedocument();
});

// register
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    console.log(req.body.username , req.body.password);
    localStorage.setItem('username', req.body.username);

    User.register({username : req.body.username} , req.body.password , function(err, user){
        if(err){console.log(err);
        res.redirect("/register");
    }
    else{
        passport.authenticate("local")(req,res, function(){
            res.redirect("/login");
        })
    }
    })
    
})



// login

app.post("/login" , (req,res)=>{
    const user = new User({
        Email : req.body.username,
        Password : req.body.password
    });
    localStorage.setItem('username', req.body.username);
    // console.log(req.body.username);
    
    req.login(user , function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/features");
            })
        }
    })
});

app.get("/login", (req, res) => {
    res.render("login");
});



// listening to the port 3000

app.get("/", (req, res) => {
    res.render("homepage");
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});