const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const Folder = require('../models/folders');
const Tag = require('../models/tags');
const User = require('../models/user');

const { notes, folders, tags, users } = require('../db/seed/data.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Test each of the tag endpoints', () => {
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
      Folder.insertMany(folders),
      Tag.insertMany(tags),
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
    /* Positive */
    it('should return all tags', function() {
      return (
        Promise.all([
          Tag.find({ userId: user.id }),
          chai
            .request(app)
            .get('/api/tags')
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

    it('Should return correct tag for an ID', function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'name',
            'createdAt',
            'id',
            'updatedAt',
            'userId'
          );
          expect(res.body.id).to.be.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    /* Negative */
    it('Should respond with a 400 error if wrong ID given', function() {
      return chai
        .request(app)
        .get('/api/tags/1245121')
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
    /* POSITIVE */
    it('should create a note when posted', function() {
      const newFolder = { name: 'testFolder' };

      return chai
        .request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(newFolder)
        .then(res => {
          expect(res).to.have.status(201);

          return Tag.findById(res.body.id).then(data => {
            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(data.name);
          });
        });
    });

    /* NEGATIVE */
    it('should fail to create a note when missing name', function() {
      return chai
        .request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .then(res => {
          expect(res.body).to.have.status(400);
          expect(res.body).to.have.keys('message', 'status');
        });
    });
  });

  describe('PUT request testing', function() {
    /* POSITIVE */
    it('should update the tag', function() {
      const updateItem = { name: 'Updated Name' };
      let data;
      return Tag.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .put(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateItem);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
        });
    });

    /* NEGATIVE */
    it('Fails to updates a tag in the database when missing title', function() {
      const updateItem = { content: 'blarghblargh' };
      return Tag.findOne()
        .then(data => {
          return chai
            .request(app)
            .put(`/api/tags/${data.id}`)
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
    /* POSITIVE */
    it('should delete an item by id', function() {
      let data;
      return Tag.findOne({ userId: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .delete(`/api/tags/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.findById(data.id);
        })
        .then(item => {
          expect(item).to.be.null;
        });
    });
  });
});
