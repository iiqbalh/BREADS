var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../helper/util');
const saltRounds = 10;
var moment = require('moment');


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
        res.render('todos/list', { user: req.session.user, data: result.rows, moment });
      })
      .catch(err => {
        console.log(err);
      })
  });

  router.get('/add', function (req, res, next) {
    res.render('todos/add', { user: 'Adding Data' });
  });

  router.post('/add', function (req, res, next) {
    query('insert into todos (title, userid) values ($1, $2)', [req.body.title, req.session.user.id])
      .then(() => {
        res.redirect('/users');
      })
      .catch(err => {
        console.log(err);
      });
  })

  router.get('/update/:index', function (req, res, next) {
    const index = req.params.index
    query('select * from todos where id = $1', [index])
      .then(result => {
        console.log(result.rows)
        res.render('todos/update', { data: result.rows[0], user: 'Updating Data', moment })
      })
      .catch(err => {
        console.log(err);
      })
  });

  router.post('/update/:index', function (req, res, next) {
    const index = req.params.index
    console.log(req.body.complete)
    query('update todos set title = $1, deadline = $2, complete = $3 WHERE id = $4', [req.body.title, req.body.deadline, req.body.complete, index])
      .then(() => {
        res.redirect('/users')
      })
      .catch(err => {
        console.log(err);
      })
  })

  return router;

};
