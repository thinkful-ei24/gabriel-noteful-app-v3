'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  console.log('Get All Notes');
  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      // const searchTerm = 'cats';
      // let filter = {};

      // if (searchTerm) {
      //   filter.title = { $regex: searchTerm };
      //   filter.content = { $regex: searchTerm };
      // }

      // return Note.find({
      //   $or: [{ title: filter.title }, { content: filter.content }]
      // });
      return Note.find();
    })
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  console.log('Get a Note');
  const { id } = req.params;

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.findById(id);
    })
    .then(note => {
      console.log(note);
      res.json(note);
    })
    .then(() => {
      return mongoose.disconnect();
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
  const { title, content } = req.body;

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

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.create(newNote);
    })
    .then(note => {
      console.log('New note created');
      console.log(note);
      res
        .location(`${req.originalUrl}/${note.id}`)
        .status(201)
        .json({ id: note.id, title: note.title });
    })
    .then(() => {
      return mongoose.disconnect();
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
  const { title, content } = req.body;
  const updateItem = {};

  /***** Never trust users. Validate input *****/
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

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.findByIdAndUpdate(id, updateItem);
    })
    .then(() => {
      return Note.findById(id);
    })
    .then(note => {
      console.log('Note updated');
      res.json({ id: note.id, title: note.title });
    })
    .then(() => {
      return mongoose.disconnect();
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

  mongoose
    .connect(
      MONGODB_URI,
      { useNewUrlParser: true }
    )
    .then(() => {
      return Note.findByIdAndRemove(id);
    })
    .then(() => {
      console.log('Note removed');
      res.status(204).end();
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(err);
      console.log(err);
      next(err);
    });
});

module.exports = router;
