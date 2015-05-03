var express = require('express');
var router = express.Router();
var mysql      = require('mysql');



var connection = mysql.createConnection({
  host     : "csdatabaseinstance.cevxrmipfzbs.us-west-2.rds.amazonaws.com",
  user     : "mertgur",
  password : "305020305020",
  port 	   : "3030",
  database : 'innodb'
});

connection.connect();


/* GET home page. */
router.get('/', function(req, res, next) {
	
  res.render('index', { title: 'Express' });

});

router.get('/register', function(req, res, next){
	res.render('register');
});

router.get('/login', function(req, res, next){
	res.render('login');
});

router.get('/ask', function(req, res, next){
	res.render('ask');
});

router.get('/question', function(req, res, next){
	res.render('question');
});


/////////////////REGISTER//////////////////
router.post('/register', function(req, res, next){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;

	connection.query("select user_name from User where user_name = '" + username + "'", function(err, rows){
		if(err){
			res.send({message: "Invalid username!"});
		}
		else if(rows[0]){
			res.send({message: "Username exist!"});
		}
		else{
			connection.query("select e_mail from User where e_mail = '" + email + "'", function(err, rows){
				if(err){
					res.send({message: "Invalid email!"});
				}
				else if(rows[0]){
					res.send({message: "Email exist!"});
				}
				else{
					connection.query("insert into User (user_name, password, e_mail) values ('"+username+"', '"+password+"', '"+email+"')", function(err, rows){
						if(err){
							res.send({message: "Error"});
						}
						else{
							res.send({redirect: "/login"});
						}
					});
					
				}
			});
		}
	});
	
});


//////////////////////LOGIN////////////////////////
/*router.post('/login', function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;
	console.log(username);
	console.log(password);
	connection.query("select user_name from User where user_name = '" + username + "' and password = '" + password + "'", function(err, rows){
	  	if (err) { 
	  		res.send({message: "Error"}); 
	  	}
	    else if (!rows[0]) {
	        res.send({message: 'Incorrect username or password'});
	    }
	    else{
	    	res.send({redirect: "/", cookiename: username ,cookiepass: password});
	    }
    });
  	
});*/

module.exports = router;
