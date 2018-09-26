const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthController = require('../controllers/auth.controller');

const options = { session: false, failWithError: true };
const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

router.post('/', localAuth, AuthController.createNewAuth);
router.post('/refresh', jwtAuth, AuthController.refreshAuth);

module.exports = router;
