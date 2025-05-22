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
    res.render('login');
  });

  router.post('/', function (req, res, next) {
    const { email, password } = req.body;

    query("select * from users where email = $1", [email])
      .then(result => {
        if (result.rows.length === 0) {
          res.send('user not exist');
          //return res.redirect('/');
        } else {
          if (!bcrypt.compareSync(password, result.rows[0].password)) {
            res.send('password is wrong');
            //return res.redirect('/');
          } else {
            req.session.user = result.rows[0]
            res.redirect('/users')
          }
        }
      })
      .catch(err => {
        console.error(err);
        res.end('Internal Server Error');
        //return res.redirect('/')
      });
  });


  //logout
  router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
      res.redirect('/')
    })
  });


  // register
  router.get('/register', function (req, res, next) {
    res.render('register');
  });

  router.post('/register', function (req, res, next) {
    const { email, password, repassword } = req.body;
    console.log(password, repassword)

    if (password !== repassword) {
      res.send("password doesn't match");
      //return res.render('/register');
    }

    query('select * from users where email = $1', [email])
      .then(result => {
        if (result.rows.length > 0) {
          res.send("email already exist")
        }
      })
      .catch(err => {
        console.log(err);
      })

    const hash = bcrypt.hashSync(password, saltRounds);
    query('insert into users (email, password) values ($1, $2)', [email, hash])
      .then(res.render('/'))
      .catch(err => {
        console.log(err)
      })

  });

  return router;
};
