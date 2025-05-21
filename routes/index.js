var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
  const {username, password} = req.body
  console.log(username, password)
});

router.get('/register', function(req, res, next) {
  res.render('register');
});
module.exports = router;
