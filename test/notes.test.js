const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const Note = require('../models/note');
const User = require('../models/user');
const Folder = require('../models/folders');

const { notes, folders, users, tags } = require('../db/seed/data.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Test each of the endpoints', () => {
  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let token;
  let user;

  beforeEach(function() {
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
    });
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET request testing', function() {
    /* Positve */
    it('GET /api/notes should be an array', function() {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return (
        Promise.all([
          Note.find({ userId: user.id }),
          chai
            .request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`)
        ])
          // 3) then compare database results to API response
          .then(([data, res]) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(data.length);
          })
      );
    });

    it('Should return correct note for an ID', function() {
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'createdAt',
            'updatedAt',
            'folderId',
            'tags',
            'userId'
          );
          expect(res.body.id).to.be.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    /* Negative */
    it('Should return an empty array for an incorrect query', function() {
      const searchTerm = 'Nasdklajfawiopfawfkj';
      const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note.find({ title: { $regex: re } });
      const apiPromise = chai
        .request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      });
    });

    it('Should respond with a 400 error if wrong ID given', function() {
      return chai
        .request(app)
        .get('/api/notes/1245121')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal(400);
        });
    });
  });

  describe('POST request testing', function() {
    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        title: 'The best article about cats ever!',
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return (
        chai
          .request(app)
          .post('/api/notes')
          .set('Authorization', `Bearer ${token}`)
          .send(newItem)
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(201);
            expect(res).to.have.header('location');
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys(
              'id',
              'title',
              'content',
              'createdAt',
              'updatedAt',
              'tags',
              'userId'
            );
            // 2) then call the database
            return Note.findById(res.body.id);
          })
          // 3) then compare the API response to the database results
          .then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.title).to.equal(data.title);
            expect(res.body.content).to.equal(data.content);
            expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
            expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          })
      );
    });

    it('Returns an error when we are missing the title field', function() {
      const newItem = {
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      return chai
        .request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('status', 'message');
        });
    });
  });

  describe('PUT request testing', function() {
    /* Postive */
    it('Successfully updates an item in the database', function() {
      const updateItem = { title: 'blargh', content: 'blarghblargh' };
      return Note.findOne()
        .then(data => {
          return chai
            .request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'createdAt',
            'folderId',
            'tags',
            'updatedAt',
            'userId'
          );
          return res.body.id;
        })
        .then(id => {
          return chai
            .request(app)
            .get(`/api/notes/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
        });
    });
    /* Negative */
    it('Fails to updates an item in the database when missing title', function() {
      const updateItem = { content: 'blarghblargh' };
      return Note.findOne()
        .then(data => {
          return chai
            .request(app)
            .put(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
        });
    });
  });

  describe('DELETE request testing', function() {
    it('Successfully deletes item from DB', function() {
      let id;
      return Note.findOne({ userId: user.id })
        .then(data => {
          id = data.id;
          return chai
            .request(app)
            .delete(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        })
        .then(() => {
          return Note.findById(id);
        })
        .then(item => {
          expect(item).to.be.null;
        });
    });

    it('Fails to delete item when ID is invalid', function() {
      return chai
        .request(app)
        .delete('/api/notes/124542632')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(500);
        })
        .then(() => {
          return chai
            .request(app)
            .get('/api/notes/124542632')
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });
});
