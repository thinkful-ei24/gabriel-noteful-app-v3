const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/', (req, res, next) => {
  const { fullname = '', username, password } = req.body;

  // Check all fields are valid
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  // Check the fields
  if (missingField) {
    const err = new Error(`Missing ${missingField} in request body`);
    err.status = 422;
    return next(err);
  }

  // Check that fields are strings
  const values = Object.values(req.body);
  const hasNonString = values.find(value => typeof value !== 'string');

  if (hasNonString) {
    const err = new Error('All values must be strings');
    err.status = 422;
    return next(err);
  }

  // Check that there is no leading or trailing whitespace
  const nonTrimmedField = requiredFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error('Values may not contain leading/trailing whitespace');
    err.status = 422;
    return next(err);
  }

  // Check that username > 1 char long
  if (username.length <= 1) {
    const err = new Error('Username must be >1 character');
    err.status = 422;
    return next(err);
  }

  // Check that password is 8-72 characters long
  if (password.length < 8 || password.length > 72) {
    const err = new Error('Password must be between 8-72 characters');
    err.status = 422;
    return next(err);
  }

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res
        .status(201)
        .location(`/api/users/${result.id}`)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;
