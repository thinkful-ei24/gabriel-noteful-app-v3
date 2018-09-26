const express = require('express');
const router = express.Router();
const passport = require('passport');
const FoldersController = require('../controllers/folders.controller');

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/* === GET/POST to / === */
router
  .route('/')
  .get(FoldersController.getAllFolders)
  .post(FoldersController.createNewFolder);

/* === GET/PUT/DELETE to /:id === */
router
  .route('/:id')
  .get(FoldersController.getFolderByID)
  .put(FoldersController.updateFolder)
  .delete(FoldersController.deleteFolder);

module.exports = router;
