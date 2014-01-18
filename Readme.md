
# hades-http

  A plugin that adds an HTTP transport to Hades models.

## Installation

    $ npm install segmentio/hades-http
    $ component install segmentio/hades-http

## Example

```js
var hades = require('hades');
var http = require('hades-http');

/**
 * User model.
 */

var User = hades()
  .use(http('/users'))
  .attr('id')
  .attr('name');

/**
 * Usage...
 */

var user = new User({ name: 'Fred' });

user.save(function (err) {
  if (err) throw err;
  store('user', id);
});

/**
 * Later...
 */

var id = store('user');

User.get(id, function (err, user) {
  if (err) throw err;
  render(user);  
});
```

## API

#### http(base)

  Return a plugin function for a given `base` URL. For HTTP calls that required an identifier, the model's `primary` key will be appended to the `base` URL.

#### .get(id, fn)

  Get a model by `id` and invoke `fn(err, model)`.

#### .all(fn)
 
  Get all models and invoke `fn(err, models)`.

#### .removeAll([fn])
 
  Remove all models and optionally invoke `fn(err)`.

#### #url()

  Return the URL for a given model instance.

#### #isNew()

  Check whether a model has been saved yet.

#### #save([fn])

  Save a model, optionally invoking `fn(err)`.

#### #remove([fn])

  Remove a model, optionally invoking `fn(err)`.