
# model-http

  A plugin that adds an HTTP transport to a model.

## Installation

    $ component install component/model-http

## Example

```js
var model = require('model');
var http = require('model-http');

/**
 * User model.
 */

var User = model('user')
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

#### .remove(id, fn)

  Remove a model by `id` and invoke `fn(err, model)`.

#### .getAll(fn)
 
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