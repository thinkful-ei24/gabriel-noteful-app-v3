const mongoose = require('mongoose');
const Note = require('../models/note');
const Folder = require('../models/folders');

exports.getAllFolders = function(req, res, next) {
  console.log('Get all folders');
  const userId = req.user.id;

  Folder.find({ userId })
    .sort({ name: 'asc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
};

exports.getFolderByID = function(req, res, next) {
  console.log('Get folder by ID');
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The id is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findOne({ _id: id, userId })
    .then(folder => {
      console.log(folder);
      res.json(folder);
    })
    .catch(err => {
      next(err);
    });
};

exports.createNewFolder = function(req, res, next) {
  console.log('Create new folder');
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = { name, userId };

  Folder.create(newFolder)
    .then(folder => {
      console.log('New folder created');
      // console.log(folder);
      res
        .location(`${req.originalUrl}/${folder.id}`)
        .status(201)
        .json(folder);
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

exports.updateFolder = function(req, res, next) {
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

  const updateFolder = { name, userId };

  Folder.findByIdAndUpdate(id, updateFolder, { new: true })
    .then(note => {
      console.log('Folder updated');
      res.json(note);
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

exports.deleteFolder = function(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  const folderRemovePromise = Folder.findByIdAndRemove({ _id: id, userId });
  const noteRemovePromise = Note.updateMany(
    { folderId: id },
    { $unset: { folderId: '' } }
  );

  Promise.all([folderRemovePromise, noteRemovePromise])
    .then(resultsArray => {
      const folderResult = resultsArray[0];

      if (folderResult) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
};
