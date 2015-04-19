var express = require('express');
var router = express.Router();

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

module.exports = router;
