const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Tag = require('../models/tags');

const { notes, folders, tags } = require('../db/seed/data.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Test each of the tag endpoints', () => {
  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Tag.insertMany(tags);
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
        Promise.all([Tag.find(), chai.request(app).get('/api/tags')])
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
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'createdAt', 'id', 'updatedAt');
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
        .send({})
        .then(res => {
          expect(res.body).to.have.status(400);
          expect(res.body).to.have.keys('message', 'status');
        });
    });
  });

  describe('PUT request testing', function() {
    it('should update a note based on id', function() {
      /* POSITIVE */
      it('should update a tag in the database', function() {
        const updateTag = { name: 'hurp' };

        return Tag.findOne()
          .then(data => {
            return chai
              .request(app)
              .put(`/api/notes/${data.id}`)
              .send(updateTag);
          })
          .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'title');
            return res.body.id;
          })
          .then(id => {
            return chai.request(app.get(`/api/notes/${id}`));
          })
          .then(res => {
            expect(res.body.name).to.equal(updateTag.name);
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
  });

  describe('DELETE request testing', function() {
    /* POSITIVE */
    it('Successfully deletes tag from DB', function() {
      let id;
      return Tag.findOne()
        .then(data => {
          id = data.id;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        })
        .then(() => {
          return chai.request(app).get(`/api/notes/${id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
        });
    });
    /* NEGATIVE */
    it('Fails to delete a tag from the database if it doesnt exist', function() {
      return chai
        .request(app)
        .delete('/api/tags/25105215')
        .then(res => {
          expect(res).to.have.status(500);
        })
        .then(() => {
          return chai.request(app).get('/api/tags/25105215');
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });
});
