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
  ;
  router.get('/', isLoggedIn, function (req, res, next) {

    const { title, stardate, enddate, complete, operation, page = 1, sortBy = 'id', sortMode = 'asc' } = req.query;
    const url = req.url == '/' ? `/?page=${page}&sortBy=${sortBy}&sortMode=${sortMode}` : req.url;

    let sqlAll = `select * from todos where userid = ${req.session.user.id}`;
    let sqlGet = `select count(*) as total from todos where userid = ${req.session.user.id}`;
    let params = [];
    let queries = [];

    if (title) {
      queries.push(title);
      params.push(`title ilike '%'||$${queries.length}||'%'`);
    }

    if (stardate && enddate) {
      queries.push(stardate, enddate);
      params.push(`deadline between $${queries.length - 1} and $${queries.length}::TIMESTAMP + INTERVAL '1 DAY - 1 SECOND'`);
    } else if (stardate) {
      queries.push(stardate);
      params.push(`deadline >= $${queries.length}`);
    } else if (enddate) {
      queries.push(enddate);
      params.push(`deadline <= $${queries.length}::TIMESTAMP + INTERVAL '1 DAY - 1 SECOND'`);
    }

    if (complete) {
      queries.push(complete);
      params.push(`complete = $${queries.length}`);
    }

    if (params.length > 0) {
      sqlGet += ` and (${params.join(` ${operation} `)})`;
      sqlAll += ` and (${params.join(` ${operation} `)})`;
    }

    const limit = 5;
    const offset = (page - 1) * limit;

    query(sqlGet, queries)
      .then(result => {
        const total = result.rows[0].total;
        const pages = Math.ceil(total / limit);

        sqlAll += ` order by ${sortBy} ${sortMode}`;
        queries.push(limit, offset);
        sqlAll += ` limit $${queries.length - 1} offset $${queries.length}`;

        query(sqlAll, queries)
          .then(result => {
            res.render('todos/list',
              { user: req.session.user, data: result.rows, offset, sortBy, sortMode, title, stardate, enddate, complete, operation, moment, pages, page, url });
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
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
  });

  router.get('/update/:index', function (req, res, next) {
    const index = req.params.index;
    query('select * from todos where id = $1', [index])
      .then(result => {
        console.log(result.rows);
        res.render('todos/update', { data: result.rows[0], user: 'Updating Data', moment });
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.post('/update/:index', function (req, res, next) {
    const index = req.params.index;
    query('update todos set title = $1, deadline = $2, complete = $3 WHERE id = $4', [req.body.title, req.body.deadline, req.body.complete || false, index])
      .then(() => {
        res.redirect('/users');
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.get('/delete/:index', function (req, res, next) {
    const index = req.params.index;
    console.log(index)
    query('delete from todos where id = $1', [index])
      .then(() => {
        res.redirect('/users');
      })
      .catch(err => {
        console.log(err);
      });
  });

  return router;

};
