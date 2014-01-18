
var express = require('express');
var hbs = require('hbs');

/**
 * Middleware.
 */

var app = express();
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/..'));
app.engine('html', hbs.__express);
app.set('views', __dirname);

/**
 * Database.
 */

var db = [];

/**
 * Page.
 */

app.get('/', function (req, res) {
  res.render('index.html');
});

/**
 * Reset.
 */

app.del('/', function (req, res) {
  db = [];
  res.send(200);
});

/**
 * Users API.
 */

// get all
app.get('/users', function (req, res) {
  res.send(200, db);
});

// delete all
app.del('/users', function (req, res) {
  db = [];
  res.send(200);
});

// create
app.post('/users', function (req, res) {
  var obj = req.body;
  obj.id = db.push(obj) - 1;
  res.send(200, obj);
});

// get
app.get('/users/:id', function (req, res) {
  var id = req.params.id;
  var obj = db[id];
  if (!obj) return res.send(404);
  res.send(200, obj);
});

// update
app.put('/users/:id', function (req, res) {
  var id = req.params.id;
  if (!db[id]) return res.send(404);
  var user = req.body;
  user.projects = user.projects || [];
  db[id] = user;
  res.send(200, user);
});

// delete
app.del('/users/:id', function (req, res) {
  var id = req.params.id;
  var obj = db[id];
  if (!obj) return res.send(404);
  db.splice(id, 1);
  res.send(200);
});

/**
 * Projects API.
 */

// get all
app.get('/users/:user/projects', function (req, res) {
  var id = req.params.user;
  var user = db[id];
  if (!user) return res.send(404);
  res.send(200, user.projects || []);
});

// remove all
app.del('/users/:user/projects', function (req, res) {
  var id = req.params.user;
  var user = db[id];
  if (!user) return res.send(404);
  delete user.projects;
});

// create
app.post('/users/:user/projects', function (req, res) {
  var user = db[req.params.user];
  console.log(db);
  if (!user) return res.send(404);
  user.projects = user.projects || [];
  var project = req.body;
  project.id = user.projects.push(project) - 1;
  res.send(200, project);
});

// get
app.get('/users/:user/projects/:id', function (req, res) {
  var user = db[req.params.user];
  if (!user || user.projects) return res.send(404);
  var project = user.projects[req.params.id];
  if (!project) return res.send(404);
  res.send(200, user);
});

// update
app.put('/users/:user/projects/:id', function (req, res) {
  var user = db[req.params.user];
  if (!user || user.projects) return res.send(404);
  var id = req.params.id;
  if (!user.projects[id]) return res.send(404);
  var project = req.body;
  user.projects[id] = project;
  res.send(200, project);
});

// delete
app.del('/users/:user/projects/:id', function (req, res) {
  var user = db[req.params.user];
  if (!user || user.projects) return res.send(404);
  var id = req.params.id;
  if (!user.projects[id]) return res.send(404);
  user.projects.splice(id, 1);
  res.send(200);
});

/**
 * Listen.
 */

app.listen(4200);
console.log('test server listening on port 4200');