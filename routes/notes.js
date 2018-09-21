'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  let filter = {};

  let sort = 'created';

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  // if querying by folder, then add to filter
  if (folderId) {
    filter.folderId = folderId;
  }

  // if querying by tags, then add to filter
  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .select('title content created folderId tags')
    .populate('tags')
    .sort(sort)
    .then(results => {
      res.json(results);
    })
    .catch(next);
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
    .populate('tags')
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
  const { title, content, folderId, tags } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach(tag => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The tag ID is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }

  const newNote = { title, content, folderId, tags };

  Note.create(newNote)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Note');
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;
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

  if (tags) {
    updateItem.tags = tags;
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
