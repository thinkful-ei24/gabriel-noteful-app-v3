const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folders');

const { notes, folders } = require('../db/seed/data.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Test each of the endpoints', () => {
  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Folder.insertMany(folders);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  /* GET */
  describe('GET request folder testing', function() {
    // Positive
    it('Should return an array of folders', function() {
      Promise.all([Folder.find(), chai.request(app).get('/api/folders')]).then(
        ([data, res]) => {
          console.log('DATADATADATA');
          console.log(data);
          expect(res).to.have.status(200);
          expect(res).to.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        }
      );
    });
  });

  /* GET by ID */
  describe('GET folder by ID', function() {
    // Positive
    it('should return correct notes', function() {
      let data;
      return Folder.findOne()
        .select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });
    // Negative
    it('should respond with a 400 if wrong ID given', function() {
      return chai
        .request(app)
        .get('/api/folders/21592521512')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.status).to.equal(400);
        });
    });
  });

  /* POST */
  describe('POST request for folders', function() {
    // Positive
    it('Should create a new folder', function() {
      const newFolder = { name: 'Hurp' };
      let res;
      return chai
        .request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'createdAt', 'updatedAt', 'id');

          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    // Negative
    it('Should create a new folder', function() {
      const newFolder = {};
      let res;
      return chai
        .request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
        });
    });
  });

  /* PUT */
  describe('Update with PUT', function() {
    // Positive
    it('It should update a folder with ID', function() {
      const updateFolder = { name: 'hello' };

      let data;
      return Folder.findOne()
        .select('id name')
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateFolder);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(updateFolder.name);
        });
    });
    // Negative
    it('Should respond with 400 for bad ID', function() {
      const updateItem = {
        name: 'What about dogs?!'
      };
      const badId = '99-99-99';

      return chai
        .request(app)
        .put(`/api/folders/${badId}`)
        .send(updateItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The id is not valid');
        });
    });
  });

  /* DELETE */
  describe('DELETE endpoints', function() {
    // Positve
    it('should delete an item with valid id', function() {
      let data;
      return Folder.findOne()
        .select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });
    // Negative
    it('should respond with a 404 for an invalid ID', function() {
      return chai
        .request(app)
        .delete('/api/folders/51251251295812519')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(500);
        });
    });
  });
});
