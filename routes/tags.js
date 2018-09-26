const express = require('express');
const router = express.Router();
const passport = require('passport');
const TagsController = require('../controllers/tags.controller');

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/* === GET/POST to / === */
router
  .route('/')
  .get(TagsController.getAllTags)
  .post(TagsController.createNewTag);

/* === GET/PUT/DELETE to /:id === */

router
  .route('/:id')
  .get(TagsController.getTagByID)
  .put(TagsController.updateTag)
  .delete(TagsController.deleteTag);

module.exports = router;
