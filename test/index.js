
var assert = require('assert');
var superagent = require('superagent');

try {
  var create = require('model');
  var http = require('model-http');
  var validate = require('model-validate');
} catch (e) {
  var create = require('../../model');
  var http = require('..');
  var validate = require('../../model-validate');
}

describe('model-http', function () {

  afterEach(reset);

  var User = create('user')
    .use(http())
    .attr('id')
    .attr('name')
    .attr('projects');

  var Project = create('project')
    .use(validate())
    .use(http('/users/:user/projects'))
    .attr('id')
    .attr('user')
    .validator(function (project) {
      return !! project.user();
    });

  describe('.request', function () {
    it('should be exposed', function () {
      var Model = create('user').use(http('/'));
      assert.equal(superagent, Model.request);
      assert.equal(superagent, Model.prototype.request);
    });
  });

  describe('.get', function () {
    it('should fail if not found', function (done) {
      User.get(function (err, user) {
        assert(err);
        done();
      });
    });

    it('should get a model', function (done) {
      var user = User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        User.get(user.primary(), function (err, res) {
          assert(res instanceof User);
          assert.deepEqual(user.attrs, res.attrs);
          done();
        });
      });
    });
  });

  describe('.getAll', function () {
    it('should get all models', function (done) {
      var one = new User({ name: 'One' });
      var two = new User({ name: 'Two' });
      one.save(function (err) {
        if (err) return done(err);
        two.save(function (err) {
          if (err) return done(err);
          User.getAll(function (err, col) {
            if (err) return done(err);
            assert(col[0] instanceof User);
            assert(col[1] instanceof User);
            assert.deepEqual(col[0].attrs, one.attrs);
            assert.deepEqual(col[1].attrs, two.attrs);
            done();
          });
        });
      });
    });
  });

  describe('.removeAll', function () {
    it('should remove all models', function (done) {
      var one = new User({ name: 'One' });
      var two = new User({ name: 'Two' });
      one.save(function (err) {
        if (err) return done(err);
        two.save(function (err) {
          if (err) return done(err);
          User.removeAll(function (err) {
            if (err) return done(err);
            User.getAll(function (err, col) {
              if (err) return done(err);
              assert.equal(0, col.length);
              done();
            });
          });
        });
      });
    });
  });

  describe('#url', function() {
    it('should fill in the models url', function () {
      var project = new Project({ user: 'user', id: 'id' });
      assert.equal('/users/user/projects/id', project.url());
    });
  });

  describe('#save', function () {
    describe('new', function () {
      it('should fail on invalid', function (done) {
        var project = new Project();
        project.save(function (err) {
          assert(err);
          done();
        });
      });

      it('should save a model', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          assert.equal(0, user.primary());
          done();
        });
      });

      it('should emit "saving"', function (done) {
        var user = new User({ name: 'Name' });
        user.on('saving', function () {
          assert(user.isNew());
          done();
        });
        user.save();
      });

      it('should emit "saving" on the constructor', function (done) {
        var user = new User({ name: 'Name' });
        User.once('saving', function (model) {
          assert.equal(model, user);
          done();
        });
        user.save();
      });

      it('should emit "save"', function (done) {
        var user = new User({ name: 'Name' });
        user.on('save', function () {
          assert(!user.isNew());
          done();
        });
        user.save();
      });

      it('should emit "save" on constructor', function (done) {
        var user = new User({ name: 'Name' });
        User.once('save', function (model) {
          assert.equal(model, user);
          done();
        });
        user.save();
      });
    });

    describe('old', function () {
      it('should fail on invalid', function (done) {
        var user = new User();
        user.save(function (err) {
          if (err) return done(err);
          var project = new Project({ user: user.primary() });
          project.save(function (err) {
            if (err) return done(err);
            project.user(null);
            project.save(function (err) {
              assert(err);
              done();
            });
          });
        });
      });

      it('should update a model', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          user.name('New');
          user.save(function (err) {
            if (err) return done(err);
            User.get(user.primary(), function (err, model) {
              if (err) return done(err);
              assert.equal('New', model.name());
              done();
            });
          });
        });
      });

      it('should emit "saving"', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          user.on('saving', function () {
            assert(!user.isNew());
            done();
          });
          user.save();
        });
      });

      it('should emit "saving" on the constructor', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          User.once('saving', function (model) {
            assert.equal(model, user);
            done();
          });
          user.save();
        });
      });

      it('should emit "save"', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          user.on('save', function () {
            assert(!user.isNew());
            done();
          });
          user.save();
        });
      });

      it('should emit "save" on constructor', function (done) {
        var user = new User({ name: 'Name' });
        user.save(function (err) {
          if (err) return done(err);
          User.once('save', function (model) {
            assert.equal(model, user);
            done();
          });
          user.save();
        });
      });
    });
  });

  describe('#remove', function () {
    it('should fail when new', function (done) {
      var user = new User({ name: 'Name' });
      user.remove(function (err) {
        assert(err);
        done();
      });
    });

    it('should remove a model', function (done) {
      var user = new User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        user.remove(function (err) {
          if (err) return done(err);
          User.get(user.primary(), function (err) {
            assert(err);
            done();
          });
        });
      });
    });

    it('should emit "removing"', function (done) {
      var user = new User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        user.on('removing', function () {
          assert(!user.removed);
          done();
        });
        user.remove();
      });
    });

    it('should emit "removing" on the constructor', function (done) {
      var user = new User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        User.once('removing', function (model) {
          assert.equal(model, user);
          done();
        });
        user.remove();
      });
    });

    it('should emit "remove"', function (done) {
      var user = new User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        user.on('remove', function () {
          assert(user.removed);
          done();
        });
        user.remove();
      });
    });

    it('should emit "remove" on the constructor', function (done) {
      var user = new User({ name: 'Name' });
      user.save(function (err) {
        if (err) return done(err);
        User.once('remove', function (model) {
          assert.equal(model, user);
          done();
        });
        user.remove();
      });
    });
  });

});

/**
 * Reset the database.
 *
 * @param {Function} done
 */

function reset (done) {
  superagent
    .del('/')
    .end(function (res) {
      done();
    });
}