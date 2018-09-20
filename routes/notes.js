'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  console.log('Get All Notes');
  const { searchTerm, folderId } = req.query;

  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  Note.find(filter)
    .sort('created')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  console.log('Get a Note');
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .then(note => {
      console.log(note);
      res.json(note);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  console.log('Create a Note');
  const { title, content, folderId } = req.body;

  const newNote = {};

  if (!title) {
    const err = new Error('Missing title in request body');
    err.status = 400;
    return next(err);
  } else {
    newNote.title = title;
  }
  if (content) {
    newNote.content = content;
  }

  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The folderId is not valid');
      err.status = 400;
      return next(err);
    } else {
      newNote.folderId = folderId;
    }
  }

  Note.create(newNote)
    .then(note => {
      console.log('New note created');
      console.log(note);
      res
        .location(`${req.originalUrl}/${note.id}`)
        .status(201)
        .json(note);
    })
    .catch(err => {
      console.log('Error creating note');
      console.error(err);
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Note');
  const { id } = req.params;
  const { title, content, folderId } = req.body;
  const updateItem = {};

  /***** Never trust users. Validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  } else {
    updateItem.title = title;
  }

  if (content) {
    updateItem.content = content;
  }

  if (folderId) {
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      const err = new Error('The folderId is not valid');
      err.status = 400;
      return next(err);
    } else {
      updateItem.folderId = folderId;
    }
  }

  Note.findByIdAndUpdate(id, updateItem, { new: true })
    .then(note => {
      console.log('Note updated');
      res.json({ id: note.id, title: note.title });
    })

    .catch(err => {
      console.log('Error updating note');
      console.error(err);
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const { id } = req.params;

  Note.findByIdAndRemove(id)
    .then(() => {
      console.log('Note removed');
      res.status(204).end();
    })

    .catch(err => {
      console.error(err);
      console.log(err);
      next(err);
    });
});

module.exports = router;
