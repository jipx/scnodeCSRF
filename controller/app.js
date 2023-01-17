var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var user = require('../model/user.js');
var cors = require('cors');
var validator = require('validator');
var validateFn = require('../validation/validationFns');
var bcrypt = require('bcryptjs');
var verifyToken = require('../auth/verifyToken');
var morgan=require('morgan');
var fs=require('fs');
var path=require('path');
var rfs = require('rotating-file-stream');


app.options('*', cors());
app.use(cors());
var urlencodedParser = bodyParser.urlencoded({ extended: false });


app.use(bodyParser.json());
app.use(urlencodedParser);

mainDir=path.resolve(__dirname, '..')

//const appLogStream = fs.createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' })
//const appLogStream = fs.createWriteStream(path.join(mainDir, 'app.log'), { flags: 'a' })
var appLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily, can be in secs(s), mins(m), hours(h), days etc
    path: path.join(mainDir, 'log') //write to a subdir log
  })
  

//app.use(morgan("combined",{ stream: appLogStream}));
//can add in your own text eg {exception::exception...

//app.use(morgan("combined"));
morgan.token('exception', (req,res) => res.err);

app.use(morgan(`{"exception":":exception","method":":method","url":":url","ip":":remote-addr","date":":date[web]"}`,{ stream: appLogStream}))

//console.log(__dirname);


//----session-----------
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var dbconnect=require('../model/databaseConfig');

var sessionStore = new MySQLStore({}/* session store options */, dbconnect.getConnection());
app.use(session({
    secret: 'an231hjEZ10mzk$zAP',
    store: sessionStore,
    saveUninitialized: false,//'Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.'
    resave: false //Forces the session to be saved back to the session store, even if the session was never modified during the request
}));

//---------------------------------

//------csrf token-----
var csrf=require('csurf');
var csrfProtection = csrf();

app.get('/csrftestGet',csrfProtection,function(req,res){

    console.log(req.csrfToken());

    res.status(200).send(`{"csrfToken":"${req.csrfToken()}"}`);

});
app.post('/csrfModifyData',csrfProtection,function(req,res){
	/* 
	activities to modify content in the server
	
	*/
	console.log(req.csrfToken());
    res.send("success!");

});

//--------------------------------------------------

//app.get('/user/:userid', verifyToken.verifyToken,verifyToken.verifyAdmin, validateFn.validateUserid, function (req, res) {
app.get('/user/:userid',verifyToken.verifySessionAdmin, validateFn.validateUserid, function (req, res) {

    var id = req.params.userid;

    user.getUser(id, function (err, result) {
        if (!err) {
            validateFn.sanitizeResult(result);
            res.send(result);
        } else {

            res.status(500).send("Some error");
        }
    });
});

app.get('/user', function (req, res) {
   
    user.getUsers(function (err, result) {
        res.err=err;

        if (!err) {
            validateFn.sanitizeResult(result);
            res.send(result);
        } else {
            res.status(500).send(null);
        }
    });
});


//POST (INSERT) /user
app.post('/user', validateFn.validateRegister, function (req, res) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var role = "member";//req.body.role;

    user.insertUser(username, email, role, password, function (err, result) {

        res.type('json');
        if (err) {
            res.status(500);
            res.send(`{"message":"Internal Server Error"}`);

        } else {
            res.status(200);
            res.send(`{"Record Inserted":"${result.affectedRows}"}`);
        }
    });

});


app.delete('/user/:userid',verifyToken.verifyToken,verifyToken.verifyAdmin,  validateFn.validateUserid, function (req, res) {

    var userid = req.params.userid;

    user.deleteUser(userid, function (err, result) {

        res.type('json');
        if (err) {
            res.status(500);
            res.send(`{"message":"Internal Server Error"}`);

        } else {
            res.status(200);
            res.send(`{"Record(s) Deleted":"${result.affectedRows}"}`);
        }

    });

});


//POST (LOGIN) /user/login
app.post('/user/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    console.log("Login...");
    user.loginUser(email, password, function (err, result) {

        res.type("json");
        if (err || result == null) {
            res.status(500);
            res.send(`{"Message":"Logged in Fail"}`);
        } else {

            res.status(200);
            //res.send(`{"Token":"${result}"}`);

            var role=result[0];
            var username=result[1];
            var session=req.session;
            session.role=role;
            console.log("Retrieved session.role:...",role);
            session.username=username;
            res.send(`{"Message":"Logged in Success"}`);
        }

    });

});


app.get('/hash/:password',function(req,res){

    var pwd=req.params.password;

    bcrypt.hash(pwd,10,function(err,hash){

        if(err){
            res.status(500);
            res.send(`{"Message":"Error"}`)
        }else{
            res.status(200);
            res.send(`{"Message":"${hash}"}`)

        }
        
    });
});

app.post('/hashVerify',function(req,res){

    var pwd=req.body.password;
    var hash=req.body.hash;

    bcrypt.compare(pwd,hash,function(err,success){

        if(err){
            res.status(500);
            res.send(`{"Message":"Error"}`)
        }else{
            res.status(200);
            res.send(`{"Message":"${success}"}`)

        }

    });


});

module.exports = app;