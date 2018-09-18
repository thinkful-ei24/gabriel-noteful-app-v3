'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/noteful'
};
