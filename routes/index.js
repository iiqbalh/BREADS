var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (db) {

  function query(sql, params) {
    return new Promise((resolve, reject) => {
      db.query(sql, params)
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
  }

  // login
  router.get('/', function (req, res, next) {
    res.render('login', { failedInfo: req.flash('failedInfo'), successInfo: req.flash('successInfo') });
  });

  router.post('/', function (req, res, next) {
    const { email, password } = req.body;

    query("select * from users where email = $1", [email])
      .then(result => {
        if (result.rows.length === 0) {
          req.flash('failedInfo', `User not exist`);
          return res.redirect('/');
        } else {
          if (!bcrypt.compareSync(password, result.rows[0].password)) {
            req.flash('failedInfo', `Password is wrong`);
            return res.redirect('/');
          } else {
            req.session.user = result.rows[0];
            res.redirect('/users');
          };
        };
      })
      .catch(err => {
        console.error(err);
        req.flash('failedInfo', `Interval Server Error`)
        return res.redirect('/');
      });
  });


  //logout
  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });


  // register
  router.get('/register', function (req, res, next) {
    res.render('register', { failedInfo: req.flash('failedInfo'), successInfo: req.flash('successInfo') });
  });

  router.post('/register', function (req, res, next) {
    const { email, password, repassword } = req.body;

    if (password !== repassword) {
      req.flash('failedInfo', `Password doesn't match`);
      return res.redirect('/register');
    };

    query('select * from users where email = $1', [email])
      .then(result => {
        if (result.rows.length > 0) {
          req.flash('failedInfo', `Email already exist`);
          return res.redirect('/register');
        };
      })
      .catch(err => {
        console.log(err);
      });

    const hash = bcrypt.hashSync(password, saltRounds);
    query('insert into users (email, password) values ($1, $2)', [email, hash])
      .then(() => {
        req.flash('successInfo', 'successfully registered, please sign in!');
        return res.redirect('/');
      })
      .catch(err => {
        console.log(err)
      });

  });

  return router;
  
};
