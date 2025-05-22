var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../helper/util');
const saltRounds = 10;


module.exports = function (db) {

  function query(sql, params) {
    return new Promise((resolve, reject) => {
      db.query(sql, params)
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
  }

  router.get('/', isLoggedIn, function (req, res, next) {
    query('select * from todos where userid = $1', [req.session.user.id])
      .then(result => {
        res.render('todos/list', { user: req.session.user,  data: result.rows});
      })
      .catch(err => {
        console.log(err);
      })
  });

  return router;

};
