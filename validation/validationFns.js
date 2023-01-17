const validator = require('validator');

var validationFn = {

    validateRegister: function (req, res, next) {

        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;

        reUserName = new RegExp(`^[a-zA-Z\s,']+$`);
        rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$`);

        
        if (reUserName.test(username) && rePassword.test(password) && validator.isEmail(email)) {

            next();
        } else {

            res.status(500);
            res.send(`{"Message":"Error!!"}`);
        }
    },

    validateUserid: function (req, res, next) {
        var userid = req.params.userid;
        reUserid = new RegExp(`^[1-9][0-9]*$`);
        

        if (reUserid.test(userid)) {
            next();
        } else {

            res.status(500);
            res.send(`{"Message":"Error!!"}`);
        }

    },

    sanitizeResult: function (result){
        //[
        //{"username":"<jon>;","email":"jon@gmail.com"},
        //{"username":"mary","email":"mary@gmail.com"},
        //..
        //]
        //&lt;jon&gt;
        for (i = 0; i < result.length; i++) {
            var row = result[i];
            //console.log(row);
            for (var key in row) {
                val = row[key];
                if (typeof val === "string") {
                    row[key] = validator.escape(val);
                }
            }
        }

    }

}

module.exports = validationFn;