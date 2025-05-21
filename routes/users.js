var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = function (db) {

  router.get('/', function (req, res, next) {
    db.query("select * from users", (err, { rows }) => {
      if (err) {
          console.log(err);
          res.json({ message: 'user gagal' })
        } else {
          res.json(rows)
          next()
        }
    })
  });

  router.get('/add', function (req, res, next) {
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    db.query("insert into users(email, password) values ($1, $2)",
      [req.body.email, hash], (err) => {
        if (err) {
          console.log(err);
          res.json({ message: 'gagal menambah user' })
        } else {
          res.json({ message: 'user is created' })
        }
      })
  });

};
