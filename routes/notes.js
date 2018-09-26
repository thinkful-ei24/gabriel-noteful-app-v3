const express = require('express');
const router = express.Router();
const passport = require('passport');

const NotesController = require('../controllers/notes.controller');

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/* === GET/POST notes to / === */
router
  .route('/')
  .get(NotesController.getAllNotes)
  .post(NotesController.postNewNote);

router
  .route('/:id')
  .get(NotesController.getNoteByID)
  .put(NotesController.updateNoteByID)
  .delete(NotesController.deleteNoteByID);

module.exports = router;
