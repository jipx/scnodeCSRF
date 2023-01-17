var db = require('./databaseConfig.js');
var config = require('../config.js');

var userDB = {
    getUser: function (userid, callback) {

        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            else{
                console.log("***Connected!");
				
                //var sql = `SELECT userid,email,username FROM user WHERE userid = '${userid}'`;

				var sql="SELECT userid,email,username FROM user WHERE userid=?"; 
				//console.log(sql);
				//sql=`call finduser(?,?)`; 
                conn.query(sql, [userid], function(err, result){
				//conn.query(sql, [], function(err, result){

                    conn.end();
                    if(err){
                        console.log(err);
                        return callback(err, null);
                    }
					//V1
					/*else { 
						console.log(result);
						return callback(null, result);

                    }*/
					//V2 for showing of only 1 record
					else { 
						var arrResult=[]
                        //
                        
                        
                        console.log(result);
						arrResult.push(result[0]);//show only 1 matching record
                        //return callback(null, result);
						return callback(null, arrResult);

                    }
                });
            }
        });
    },

	getUsers: function (callback) {

        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            else{
                console.log("***Connected!");
				
                var sql = 'SELECT userid,username,email FROM user ';
                conn.query(sql, [], function(err, result){
                    conn.end();
                    if(err){
                        console.log(err);
                        return callback(err, null);
                    } else {  
                        return callback(null, result);
                    }
                });
            }
        });
    },
    insertUser:function(username,email,role,password,callback){

        var dbConn=db.getConnection();

        dbConn.connect(function(err){

            if(err){
                console.log(err);
                return callback(err,null);

            }else{
                var sql="insert into user(username,email,role,password) Values(?,?,?,?)";

                dbConn.query(sql,[username,email,role,password],function(err,result){

                    dbConn.end();
                    if(err){
                        console.log(err);
                    }else{

                        //console.log(result);
                    }
                    return callback(err,result);
                });
            }
        });
    },
    deleteUser:function(userid,callback){

        var dbConn=db.getConnection();

        dbConn.connect(function(err){

            if(err){

                console.log(err);
                return callback(err,null);

            }else{
                var sql="Delete from user where userid=?";

                dbConn.query(sql,[userid],function(err,result){

                    dbConn.end();
                    if(err){
                        console.log(err);
                    }else{

                        console.log(result);
                    }
                    return callback(err,result);
                });
            }
        });
    },
    loginUser: function (email, password,callback) {
        var dbConn = db.getConnection();

        dbConn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {

                var sql = "select * from user where email=? and password=?";

                dbConn.query(sql, [email, password], function (err, result) {
                    if (err) {

                        console.log(err);
                        return callback(err, null);
                    } else {

                        if (result.length == 1) {//1 rec retrieved since email and password correct. Email is unique

                            //successful login
                            var role = result[0].role;
                            var username = result[0].username;
                            //var token = jwt.sign({"role":role,"username":username}, config.JWTKey, {expiresIn: 86400});
                            var token=[role,username];
                            return callback(null, token);


                        } else {

                            //login wrong...
                            return callback(null, null);

                        }

                    }

                });

            }

        });

    }

};

module.exports = userDB;

