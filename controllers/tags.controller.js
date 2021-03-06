const mongoose = require('mongoose');
const Tag = require('../models/tags');
const Note = require('../models/note');

exports.getAllTags = function(req, res, next) {
  console.log('Get all tags');
  const userId = req.user.id;

  Tag.find({ userId })
    .sort({ name: 'asc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
};

exports.getTagByID = function(req, res, next) {
  console.log('Get tag by ID');
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findOne({ _id: id, userId })
    .then(tag => {
      console.log(tag);
      res.json(tag);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
      next(err);
    });
};

exports.createNewTag = function(req, res, next) {
  console.log('Create new tag');
  const { name } = req.body;
  const userId = req.user.id;

  const newTag = { userId };

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  } else {
    newTag.name = name;
  }

  Tag.create(newTag)
    .then(tag => {
      console.log('New tag created');
      console.log(tag);
      res
        .location(`${req.originalUrl}/${tag.id}`)
        .status(201)
        .json(tag);
    })
    .catch(err => {
      console.log('Error creating folder');
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
};

exports.updateTag = function(req, res, next) {
  const { name } = req.body;
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = { name, userId };

  Tag.findByIdAndUpdate(id, updateItem, { new: true })
    .then(tag => {
      console.log('Folder updated');
      res.json(tag);
    })
    .catch(err => {
      console.log('Error updating folder');
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
};

exports.deleteTag = function(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  const tagRemovePromise = Tag.findByIdAndRemove({ _id: id, userId });
  const noteUpdatePromise = Note.updateMany(
    { tags: id },
    { $pull: { tags: id } }
  );

  Promise.all([tagRemovePromise, noteUpdatePromise])
    .then(([tagResult]) => {
      if (tagResult) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(next);
};
