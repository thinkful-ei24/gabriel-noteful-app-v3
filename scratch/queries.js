const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/search using Note.find
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const searchTerm = 'cats';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find note by ID
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     return Note.findById('000000000000000000000007');
//   })
//   .then(note => {
//     console.log(note);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Create a new note using Note.create
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     Note.create({
//       title: 'test title',
//       content: 'hello content',
//       __v: 0
//     });
//   })
//   .then(() => {
//     console.log('New note created');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.log('Error creating note');
//     console.error(err);
//   });

// Update a note by id using Note.findByIdAndUpdate
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     return Note.findByIdAndUpdate('000000000000000000000007', {
//       content: 'hurp'
//     });
//   })
//   .then(() => {
//     console.log('Note updated');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.log('Error updating note');
//     console.error(err);
//   });

// Delete a note by id using Note.findByIdAndRemove
mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    return Note.findByIdAndRemove('000000000000000000000006');
  })
  .then(() => {
    console.log('Note removed');
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    console.log(err);
  });
