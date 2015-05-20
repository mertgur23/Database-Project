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
    if (err)
      res.send({
        message: "Error"
      });
    res.render('index', {
      rows: rows,
      login: name
    });
  });
});

app.get('/popular', function(req, res, next) {
  sess = req.session;
  var id = sess.user_id;
  var name = sess.user_name;
  connection.query('Select * from Post P, has_post H, User U where P.post_type = "Q" and U.user_id = H.user_id and P.post_id = H.post_id order by P.number_of_views desc limit 10', function(err, rows) {
    res.render('indexPopular', {
      rows: rows,
      login: name
    });
  });
});

app.get('/statistics', function(req, res, next) {
  sess = req.session;
  var id = sess.user_id;
  var check = 0;
  var name = sess.user_name;
  connection.query("Select user_name, MAX(reputation) as rep from User where userType_id =" + check + " group by user_name order by rep desc limit 5", function(err, highestRepPeople) {
    connection.query("Select H.user_id, U.user_name, count(H.post_id) as Count from has_post H, User U where H.user_id = U.user_id group by H.user_id having Count > 10 order by Count desc limit 10", function(err2, poster) {
      connection.query("DROP VIEW IF EXISTS postAvg");
      connection.query('CREATE VIEW postAvg AS Select P.post_id,P.title, P.total_like from Post P where P.post_type = "Q" and P.total_like > (Select AVG(total_like) from Post where post_type = "Q")', function(err, avgLike) {
        connection.query("Select * from postAvg where title IS NOT NULL order by total_like desc limit 10", function(err, avgPost) {
          if (err)
            console.log(err);
          if (err2)
            console.log(err2);
          console.log(poster);
          res.render('Statistics', {
            highestRepPeople: highestRepPeople,
            poster: poster,
            login: sess.user_name,
            avgPost: avgPost
          });
        });
      });
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
  if (sess.user_name) {
    connection.query("Select category_name from Categories", function(err, catz) {
      res.render('ask', {
        login: sess.user_name,
        catz: catz
      });
    });
  } else
    res.redirect("/");
});

app.get('/followedTag', function(req, res, next) {
  sess = req.session;
  var id = sess.user_id;
  if (id) {
    connection.query("Select distinct PT.post_id, P.total_like, P.title, P.number_of_views, P.ask_timestamp, U.user_name from follow F, post_tag PT, Post P, User U, has_post HP where F.user_id=" + id + " and F.tag_id = PT.tag_id and P.post_id=HP.post_id and U.user_id=HP.user_id and P.post_id=PT.post_id order by P.ask_timestamp desc limit 10", function(err, rows) {
      connection.query("Select T.name from follow F, Tag T where F.tag_id = T.tag_id and F.user_id=" + id, function(err2, foltags) {
        connection.query("Select category_name from Categories", function(err, categ) {
          if (err)
            console.log(err);
          if (err2)
            console.log(err2);

          res.render('followedTag', {
            rows: rows,
            login: sess.user_name,
            foltags: foltags,
            categ: categ
          });
        });
      });
    });
  } else
    res.redirect("/login");
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

app.post('/favourite', function(req, res, next) {
  var user_id = sess.user_id;
  var post_id = req.body.post_id;
  connection.query("insert into favourites values (" + user_id + ", " + post_id + ")", function(err, insertFavourite) {
    res.send({
      redirect: "/question:" + post_id
    });
  });
});

app.post('/unfavourite', function(req, res, next) {
  var user_id = sess.user_id;
  var post_id = req.body.post_id;
  console.log(user_id);
  console.log(post_id);
  connection.query("DELETE FROM favourites where user_id = " + user_id + " and post_id = " + post_id, function(err, deleteFavourite) {
    res.send({
      redirect: "/question:" + post_id
    });
  });
});

app.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  connection.query("select user_name, user_id, userType_id from User where user_name = '" + username + "' and password = '" + password + "'", function(err, rows) {
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
      sess.userType = rows[0].userType_id;
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
  var tags = req.body.tags;
  var splittedTags = tags.split(" ");
  var insertedId;
  var index = 0;
  if (userid) {
    var str = "(";
    for (var i = 0; i < splittedTags.length; i++) {
      str += "'" + splittedTags[i] + "'";
      if (i != splittedTags.length - 1)
        str += ", ";
    }
    str += ")";
    connection.query("select tag_id from Tag where name in " + str, function(err, rows) {
      if (err) {
        console.log(err);
      }
      if (rows.length != splittedTags.length) {
        res.send({
          message: "Given tag(s) are not valid"
        });
      } else {
        connection.query("insert into Post(ask_timestamp, edit_timestamp, post_type, text, title) values (NOW(), NOW(), 'Q', '" + text + "', '" + title + "')", function(err, result) {
          insertedId = result.insertId;
          str = "";
          for (var i = 0; i < splittedTags.length; i++) {
            str += "('" + insertedId + "', '" + rows[i].tag_id + "')";
            if (i != splittedTags.length - 1)
              str += ", ";
          }
          console.log(str);
          connection.query("insert into post_tag(post_id, tag_id) values " + str, function(err, result) {
            if (err)
              console.log(err);
          });
          connection.query("insert into has_post values(" + userid + ", " + insertedId + ")", function(err, rows) {
            if (err)
              console.log(err);
          });
          res.send({
            redirect: "/"
          });
        });
      }
    });
  }
});

app.post('/followTag', function(req, res, next) {
  sess = req.session;
  var userid = sess.user_id;
  var tags = req.body.tags;
  console.log(tags);
  var splittedTags = tags.split(" ");
  var index = 0;
  if (userid) {
    var str = "(";
    for (var i = 0; i < splittedTags.length; i++) {
      str += "'" + splittedTags[i] + "'";
      if (i != splittedTags.length - 1)
        str += ", ";
    }
    str += ")";
    connection.query("select tag_id from Tag where name in " + str, function(err, rows) {
      if (err) {
        console.log(err);
      }
      if (rows.length != splittedTags.length) {
        res.send({
          message: "Given tag(s) are not valid"
        });
      } else {
        str = "";
        for (var i = 0; i < splittedTags.length; i++) {
          str += "('" + userid + "', '" + rows[i].tag_id + "')";
          if (i != splittedTags.length - 1)
            str += ", ";
        }
        connection.query("insert into follow values " + str, function(err2, result2) {
          if (err2) {
            res.send({
              message: "You can't follow tags you already follow"
            });
          } else
            res.send({
              redirect: "/followedTag"
            });
        });
      }
    });
  }
});

app.post('/addTag', function(req, res, next) {
  sess = req.session;
  var userid = sess.user_id;
  var category = req.body.category;
  var tags = req.body.tags;
  var splittedTags = tags.split(" ");
  var index = 0;
  if (userid) {
    connection.query("select reputation from User where user_id=" + userid, function(err, result) {
      if (err)
        console.log(err);
      else if (result[0].reputation >= 150) {
        connection.query("select category_id from Categories where category_name='" + category + "'", function(err2, cat_id) {
          if (err2)
            console.log(err2);
          else {
            var str = "(";
            for (var i = 0; i < splittedTags.length; i++) {
              str += "'" + splittedTags[i] + "'";
              if (i != splittedTags.length - 1)
                str += ", ";
            }
            str += ")";
            connection.query("insert into Tag(name) values " + str, function(err3, newtag) {
              if (err3) {
                res.send({
                  message: "Given tag(s) already exist in the system",
                });
              } else {
                var insertedTagId = newtag.insertId;
                connection.query("insert into has_tag(category_id, tag_id) values(" + cat_id[0].category_id + "," + insertedTagId + ")", function(err4, result4) {
                  if (err4)
                    console.log(err4);
                  else
                    res.send({
                      redirect: "/followedTag"
                    });
                });
              }
            });
          }
        });
      } else {
        res.send({
          redirect: "/followedTag",
          message: "Your reputation is not enough to add tag to system"
        });
      }
    });
  }
});





app.get('/question:id', function(req, res, next) {
  var name = sess.user_name;
  var user_id = sess.user_id;
  var comments = new Array();
  var a = req.params.id.split(':');
  var favourited = 0;
  var hasAcceptedAnswer = 0;
  var ownerOfQuestion = 0;
  if (!user_id)
    user_id = 0;
  connection.query("Select * from Post P, has_post H, User U where P.post_type = 'Q' and U.user_id = H.user_id and P.post_id = H.post_id and P.post_id = " + a[1], function(err, rows) {
    connection.query("Select * from has_parent H, Post P, User U, has_post HP where H.parent_id=" + a[1] + " and H.post_id = P.post_id and U.user_id = HP.user_id and HP.post_id = H.post_id", function(err, children) {
      connection.query("Select * from user_post_view where user_id=" + user_id + " and post_id=" + a[1] + "", function(err, view_result) {
        if (view_result.length == 0 && user_id != 0) {
          connection.query("insert into user_post_view values (" + user_id + ", " + a[1] + ")", function(err, instertedView) {
            connection.query("UPDATE Post SET number_of_views = number_of_views + 1 where post_id = " + a[1] + "", function(err, increaseView) {});
          });
        }
        connection.query("Select name from post_tag PT, Tag T where T.tag_id= PT.tag_id and PT.post_id = " + a[1], function(err, tags) {
          connection.query("Select * from favourites where user_id = " + user_id + " and post_id =" + a[1] + "", function(err, favouriteResult) {
            connection.query("Select * from has_post where user_id = " + user_id + " and post_id = " + a[1] + "", function(err, ownerQuestion) {
              connection.query("Select acceptedAnswer_id from hasAcceptedAnswer where post_id = " + a[1] + "", function(err, acceptedAnswer) {
                if (favouriteResult.length > 0) {
                  favourited = 1;
                }

                if (ownerQuestion.length > 0) {
                  ownerOfQuestion = 1;
                }

                if (acceptedAnswer.length > 0) {
                  hasAcceptedAnswer = acceptedAnswer[0].acceptedAnswer_id;
                }

                var count = 0;
                for (var i = 0; i < children.length; i++) {
                  count++;
                  connection.query("select * from has_parent H, Post P,User U, has_post HP where H.parent_id= " + children[i].post_id + " and H.post_id = P.post_id and U.user_id = HP.user_id and HP.post_id = H.post_id", function(err, childchild) {
                    if (err) {
                      console.log(err);
                    }
                    count--;
                    comments.push(childchild);
                    if (count == 0) {
                      res.render('question', {
                        rows: rows,
                        children: children,
                        comments: comments,
                        login: name,
                        tags: tags,
                        favourited: favourited,
                        hasAcceptedAnswer: hasAcceptedAnswer,
                        ownerOfQuestion: ownerOfQuestion,
                        userType: sess.userType
                      });
                    }
                  });


                }

                if (count == 0) {
                  res.render('question', {
                    rows: rows,
                    children: children,
                    comments: comments,
                    login: name,
                    tags: tags,
                    favourited: favourited,
                    hasAcceptedAnswer: hasAcceptedAnswer,
                    ownerOfQuestion: ownerOfQuestion,
                    userType: sess.userType
                  });
                }
              });
            });
          });
        });
      });
    });
  });
});



app.get('/profile', function(req, res, next) {
  sess = req.session;
  var user_id = sess.user_id;
  connection.query("Select * from Post P, has_post H, User U where P.post_type = 'Q' and U.user_id =" + user_id + " and U.user_id = H.user_id and P.post_id = H.post_id", function(err, questions) {
    connection.query("Select * from Post P, has_post H, User U, has_parent HP where P.post_type = 'A' and U.user_id =" + user_id + " and HP.post_id = P.post_id and U.user_id = H.user_id and P.post_id = H.post_id", function(err, answers) {
      connection.query("Select * from Post P, favourites F, User U where P.post_type = 'Q' and U.user_id =" + user_id + " and U.user_id = F.user_id and P.post_id = F.post_id", function(err, favourite) {
        connection.query("Select * from Badges B, has_badges H, User U where U.user_id =" + user_id + " and U.user_id = H.user_id and B.badge_id = H.badge_id", function(err, badges) {
          connection.query("Select * from Tag T, follow F, User U where U.user_id =" + user_id + " and U.user_id = F.user_id and T.tag_id = F.tag_id", function(err, tags) {
            connection.query("Select * from User U where U.user_id =" + user_id + "", function(err, reputation) {
              res.render('profile', {
                questions: questions,
                answers: answers,
                favourite: favourite,
                badges: badges,
                tags: tags,
                reputation: reputation,
                login: sess.user_name
              });
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
  var qId = req.body.postId;
  var name = sess.user_name;
  if (name) {
    connection.query("insert into Post(ask_timestamp, edit_timestamp, post_type, text) values(NOW(), NOW(), 'Q_C','" + comment + "' )", function(err, rows) {
      connection.query("insert into has_parent values(" + rows.insertId + ", " + qId + ")");
      connection.query("insert into has_post values(" + sess.user_id + ", " + rows.insertId + ")");
    });
  }
  res.send({
    redirect: "/question:" + qId
  });
});

app.post('/upvote', function(req, res, next) {
  var postId = req.body.postId;
  var user_id = sess.user_id;
  connection.query("Select H.user_id from Post P, has_post H where P.post_id = H.post_id and P.post_id = " + postId + "", function(err, postOwner) {
    connection.query("Select * from votes_on where user_id = " + user_id + " and post_id =" + postId + "", function(err, votedBefore) {
      if (!user_id) {
        res.send({
          message: "Login to Vote a Post"
        });
      } else {
        if (postOwner[0].user_id == user_id) {
          res.send({
            message: "You Can't Vote Your Post"
          });
        } else if (votedBefore.length != 0) {
          res.send({
            message: "You Voted This Post Before. You Can't Vote Again"
          });
        } else {
          connection.query("UPDATE Post SET total_like = total_like + 1 where post_id = " + postId + "", function(err, upvotePost) {
            connection.query("UPDATE Post SET number_of_upvotes = number_of_upvotes + 1 where post_id = " + postId + "", function(err, upvotePost) {
              connection.query("UPDATE User SET reputation = reputation + 10 where user_id = " + postOwner[0].user_id + "", function(err, repUser) {
                connection.query("insert into votes_on values(" + user_id + ", " + postId + ", 'U', NOW())", function(err, votes_onValue) {
                  connection.query("Select post_type from Post where post_id = " + postId + "", function(err, postType) {
                    if (postType[0].post_type == "Q") {
                      res.send({
                        redirect: "/question:" + postId
                      });
                    } else {
                      connection.query("Select parent_id from has_parent where post_id = " + postId + "", function(err, parentId) {
                        res.send({
                          redirect: "/question:" + parentId[0].parent_id
                        });
                      });
                    }
                  });
                });
              });
            });
          });
        }
      }
    });
  });
});

app.post('/downvote', function(req, res, next) {
  var postId = req.body.postId;
  var user_id = sess.user_id;
  connection.query("Select H.user_id from Post P, has_post H where P.post_id = H.post_id and P.post_id = " + postId + "", function(err, postOwner) {
    connection.query("Select * from votes_on where user_id = " + user_id + " and post_id =" + postId + "", function(err, votedBefore) {
      if (!user_id) {
        res.send({
          message: "Login to Vote a Post"
        });
      } else {
        if (postOwner[0].user_id == user_id) {
          res.send({
            message: "You Can't Vote Your Post"
          });
        } else if (votedBefore.length != 0) {
          res.send({
            message: "You Voted This Post Before. You Can't Vote Again"
          });
        } else {
          connection.query("UPDATE Post SET total_like = total_like - 1 where post_id = " + postId + "", function(err, upvotePost) {
            connection.query("UPDATE Post SET number_of_downvotes = number_of_downvotes + 1 where post_id = " + postId + "", function(err, upvotePost) {
              connection.query("UPDATE User SET reputation = reputation - 5 where user_id = " + postOwner[0].user_id + "", function(err, repUser) {
                connection.query("insert into votes_on values(" + user_id + ", " + postId + ", 'D', NOW())", function(err, votes_onValue) {
                  connection.query("Select post_type from Post where post_id = " + postId + "", function(err, postType) {

                    if (postType[0].post_type == "Q") {
                      res.send({
                        redirect: "/question:" + postId
                      });
                    } else {
                      connection.query("Select parent_id from has_parent where post_id = " + postId + "", function(err, parentId) {
                        res.send({
                          redirect: "/question:" + parentId[0].parent_id
                        });
                      });
                    }
                  });
                });
              });
            });
          });
        }
      }
    });
  });
});

app.post('/acceptAnswer', function(req, res, next) {
  var postId = req.body.postId;
  console.log(postId);
  connection.query("Select parent_id from has_parent where post_id = " + postId + "", function(err, parentId) {
    console.log(parentId[0].parent_id);
    connection.query("insert into hasAcceptedAnswer values (" + parentId[0].parent_id + ", " + postId + ")", function(err, hasAnswer) {
      connection.query("Select * from has_post where post_id = " + postId + "", function(err, ownerAnswer) {
        connection.query("UPDATE User SET reputation = reputation + 15 where user_id = " + ownerAnswer[0].user_id + "", function(err, repUser) {
          if (err)
            console.log(err);
          res.send({
            redirect: "/question:" + parentId[0].parent_id
          });
        });
      });
    });
  });
});


app.get('/profile', function(req, res, next) {
  res.render('profile', {
    test: "C"
  });
});

app.post('/getTag', function(req, res, next) {
  var cat = req.body.cat;
  if (cat) {
    connection.query("Select category_id from Categories where category_name = '" + cat + "'", function(err, rows) {
      if (err) {
        console.log(err);
      }
      if (rows) {
        var cat_id = rows[0].category_id;
        connection.query("Select t.name from Tag t, has_tag h where h.tag_id = t.tag_id and h.category_id=" + cat_id, function(err, tags) {
          if (err) {
            console.log(err);
          }
          if (tags) {
            res.send({
              tags: tags
            });
          }
        });
      }
    });
  }
});

app.post("/search", function(req, res, next) {
  var user_id = sess.user_id;
  var searchText = '%' + req.body.searchText + '%';
  var data = [searchText, searchText];
  connection.query("SELECT * FROM Post P, has_post H, User U WHERE (P.post_type = 'Q' and U.user_id = H.user_id and P.post_id = H.post_id) and (text LIKE ? or title LIKE ?)", data, function(err, result) {
    console.log(data);
    res.render("searchResult", {
      rows: result,
      login: sess.user_name
    });
  });
});

app.post("/deletePost", function(req, res, next) {
  var postId = req.body.postId;
  connection.query("delete from Post where post_id = ?", [postId], function(err, rows) {
    res.send(rows);
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
