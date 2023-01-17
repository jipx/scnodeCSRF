var jwt = require('jsonwebtoken');
var config = require('../config');


var verifyFn = {

    verifyToken: function (req, res, next) {

        var token = req.headers['authorization'];

        res.type('json');
        if (!token || !token.includes("Bearer ")) {

            res.status(403);
            res.send(`{"Message":"Not Authorized"}`);

        } else {
            //token = token.split('Bearer ')[1]; //obtain the token’s value
            token=token.substring(7);
            jwt.verify(token,config.JWTKey,function(err,decoded){
                if(err){//key invalid
                    res.status(403);
                    res.send(`{"Message":"Not Authorized"}`);
                }else{
                    req.username=decoded.username;
                    req.role=decoded.role;
                    next();
                }

            });
        }

    },


    verifyAdmin: function (req, res, next) {

        res.type('json');
        if (req.role!="admin") {

            res.status(403);
            res.send(`{"Message":"Not Authorized"}`);

        } else {
           next();
        }

    },
    verifySession:function(req,res,next){

        var session=req.session;
        if(session.role)
            next();
        else{
            res.status(403);
            res.send(`{"Message":"Not Authorized"}`);

        }

    },
    verifySessionAdmin:function(req,res,next){

        console.log(req.session.id);
        var session=req.session;
        
        console.log(session.role);
        if(session.role=="admin")
            next();
        else{
            res.status(403);
            res.send(`{"Message":"Not Authorized"}`);

        }
    }

    
}

module.exports=verifyFn;