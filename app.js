var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session')
var users = require('./routes/users');

var app = express();
var mysql = require('mysql');



var connection = mysql.createConnection({
  host: "csdatabaseinstance.cevxrmipfzbs.us-west-2.rds.amazonaws.com",
  user: "mertgur",
  password: "305020305020",
  port: "3030",
  database: 'innodb'
});

connection.connect();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ssshhhhh'
}));

app.use('/users', users);

var sess;

/* GET home page. */
app.get('/', function(req, res, next) {
  sess = req.session;
  var id = sess.user_id;
  var name = sess.user_name;
  connection.query('Select * from Post P, has_post H, User U where P.post_type = "Q" and U.user_id = H.user_id and P.post_id = H.post_id order by P.ask_timestamp desc limit 10', function(err, rows) {
    res.render('index', {
      rows: rows,
      login: name
    });
  });
});

app.get('/register', function(req, res, next) {
  res.render('register');
});

app.get('/login', function(req, res, next) {
  res.render('login');
});

app.get('/ask', function(req, res, next) {
  sess = req.session;
  if (sess.user_name)
    res.render('ask', {
      login: sess.user_name
    });
  else
    res.redirect("/");
});




/////////////////REGISTER//////////////////
app.post('/register', function(req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  connection.query("select user_name from User where user_name = '" + username + "'", function(err, rows) {
    if (err) {
      res.send({
        message: "Invalid username!"
      });
    } else if (rows[0]) {
      res.send({
        message: "Username exist!"
      });
    } else {
      connection.query("select e_mail from User where e_mail = '" + email + "'", function(err, rows) {
        if (err) {
          res.send({
            message: "Invalid email!"
          });
        } else if (rows[0]) {
          res.send({
            message: "Email exist!"
          });
        } else {
          connection.query("insert into User (user_name, password, e_mail) values ('" + username + "', '" + password + "', '" + email + "')", function(err, rows) {
            if (err) {
              res.send({
                message: "Error"
              });
            } else {
              res.send({
                redirect: "/login"
              });
            }
          });

        }
      });
    }
  });

});



app.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  connection.query("select user_name, user_id from User where user_name = '" + username + "' and password = '" + password + "'", function(err, rows) {
    if (err) {
      res.send({
        message: "Error"
      });
    } else if (!rows[0]) {
      res.send({
        message: 'Incorrect username or password'
      });
    } else {
      sess = req.session;
      sess.user_name = username;
      sess.user_id = rows[0].user_id;
      res.send({
        redirect: "/"
      });
    }
  });

});

app.get("/logout", function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.post('/askQuestion', function(req, res, next) {
  sess = req.session;
  var userid = sess.user_id;
  var title = req.body.title;
  var text = req.body.text;
  if (userid) {
    connection.query("insert into Post(ask_timestamp, edit_timestamp, post_type, text, title) values (NOW(), NOW(), 'Q', '" + text + "', '" + title + "')", function(err, rows) {
      if (err) {
        res.send({
          message: "Error"
        });
      } else {
        connection.query("insert into has_post values(" + userid + ", " + rows.insertId + ")", function(err, rows) {
          if (err) {
            res.send({
              message: "Error"
            });
          } else {
            res.send({
              redirect: "/"
            });
          }
        });
      }
    });

  }
});


app.get('/question:id', function(req, res, next) {
  var name = sess.user_name;
  var a = req.params.id.split(':');
  connection.query("Select * from Post P, has_post H, User U where P.post_type = 'Q' and U.user_id = H.user_id and P.post_id = H.post_id and P.post_id = " + a[1], function(err, rows) {
    connection.query("Select * from has_parent H, Post P, User U, has_post HP where H.parent_id=" + a[1] + " and H.post_id = P.post_id and U.user_id = HP.user_id and HP.post_id = H.post_id", function(err, children) {
      console.log(children);
      res.render('question', {
        rows: rows,
        children: children,
        login: name
      });
    });
  });
});

app.get('/profile', function(req, res, next){
  sess = req.session;
  var user_id = sess.user_id;
  connection.query("Select * from Post P, has_post H, User U where P.post_type = 'Q' and U.user_id ="+ user_id + " and U.user_id = H.user_id and P.post_id = H.post_id", function(err,questions){
    connection.query("Select * from Post P, has_post H, User U, has_parent HP where P.post_type = 'A' and U.user_id ="+ user_id + " and HP.post_id = P.post_id and U.user_id = H.user_id and P.post_id = H.post_id", function(err,answers){
      connection.query("Select * from Post P, favourites F, User U where P.post_type = 'Q' and U.user_id ="+ user_id + " and U.user_id = F.user_id and P.post_id = F.post_id", function(err,favourite){
        connection.query("Select * from Badges B, has_badges H, User U where U.user_id ="+ user_id +" and U.user_id = H.user_id and B.badge_id = H.badge_id", function(err, badges){
          connection.query("Select * from Tag T, follow F, User U where U.user_id ="+ user_id +" and U.user_id = F.user_id and T.tag_id = F.tag_id", function(err,tags){
            connection.query("Select * from User U where U.user_id ="+ user_id +"", function(err,reputation){
              console.log(reputation);
              res.render('profile', {questions : questions, answers : answers, favourite : favourite, badges : badges, tags : tags, reputation : reputation});
            });
          });
        });
      });
    });
  });

});


app.post('/answerQuestion', function(req, res, next) {
  var answer = req.body.answer;
  var qId = req.body.qId;
  var name = sess.user_name;
  if (name) {
    connection.query("insert into Post(ask_timestamp, edit_timestamp, post_type, text) values(NOW(), NOW(), 'A','" + answer + "' )", function(err, rows) {
      connection.query("insert into has_parent values(" + rows.insertId + ", " + qId + ")");
      connection.query("insert into has_post values(" + sess.user_id + ", " + rows.insertId + ")");
    });
  }
  res.send({
    redirect: "/question:" + qId
  });
});

app.post("/commentPost", function(req, res, next) {
  var comment = req.body.comment;
  var qId = req.body.qId;
  var name = sess.user_name;
  if (name) {
    connection.query("insert into Post(ask_timestamp, edit_timestamp, post_type, text) values(NOW(), NOW(), 'A','" + answer + "' )", function(err, rows) {
      connection.query("insert into has_parent values(" + rows.insertId + ", " + qId + ")");
      connection.query("insert into has_post values(" + sess.user_id + ", " + rows.insertId + ")");
    });
  }
  res.send({
    redirect: "/question:" + qId
  });
});

app.get('/profile', function(req, res, next) {
  res.render('profile', {
    test: "C"
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
