const Note = require('../models/note');
const Folder = require('../models/folders');
const Tag = require('../models/tags');
const mongoose = require('mongoose');

exports.getAllNotes = function(req, res, next) {
  const { searchTerm, folderId, tagId } = req.query;
  const userId = req.user.id;

  let filter = { userId };

  let sort = 'created';

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ title: { $regex: re } }, { content: { $regex: re } }];
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
};

exports.getNoteByID = function(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
};

exports.postNewNote = function(req, res, next) {
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;

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

  if (userId) {
    newNote.userId = userId;
  } else {
    const err = new Error('Missing user in request body');
    err.status = 400;
    return next(err);
  }

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagIds(tags, userId)
  ])
    .then(() => Note.create(newNote))
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err === 'InvalidFolder') {
        err = new Error('The folder is invalid');
        err.status = 400;
      }

      if (err === 'InvalidTag') {
        err = new Error('The tag is invalid');
        err.status = 400;
      }
      next(err);
    });
};

exports.updateNoteByID = function(req, res, next) {
  console.log('Update a Note');
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;
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

  if (userId) {
    updateItem.userId = userId;
  } else {
    const err = new Error('Missing user in request body');
    err.status = 400;
    return next(err);
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

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagIds(tags, userId)
  ])
    .then(() => {
      return Note.findByIdAndUpdate(id, updateItem, { new: true }).populate(
        'tags'
      );
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err === 'InvalidFolder') {
        err = new Error('The folder is invalid');
        err.status = 400;
      }

      if (err === 'InvalidTag') {
        err = new Error('The tag is invalid');
        err.status = 400;
      }
      next(err);
    });
};

exports.deleteNoteByID = function(req, res, next) {
  console.log('Delete a Note');
  const { id } = req.params;
  const userId = req.user.id;

  Note.findByIdAndRemove({ _id: id, userId })
    .then(() => {
      console.log('Note removed');
      res.status(204).end();
    })

    .catch(err => {
      next(err);
    });
};

function validateFolderId(folderId, userId) {
  if (folderId === undefined) {
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return Promise.reject(err);
  }
  return Folder.count({ _id: folderId, userId }).then(count => {
    if (count === 0) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return Promise.reject(err);
    }
  });
}

function validateTagIds(tags, userId) {
  if (tags === undefined) {
    return Promise.resolve();
  }
  if (!Array.isArray(tags)) {
    const err = new Error('The `tags` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }
  return Tag.find({ $and: [{ _id: { $in: tags }, userId }] }).then(results => {
    if (tags.length !== results.length) {
      const err = new Error('The `tags` contains an invalid id');
      err.status = 400;
      return Promise.reject(err);
    }
  });
}
