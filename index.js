
var map = require('map');
var noop = function(){};
var request = require('superagent');
var type = require('type');

/**
 * Expose `http`.
 */

module.exports = http;

/**
 * Return a `plugin` function with `base` path.
 *
 * @param {String} base
 */

function http (base) {
  if (!base) throw new Error('must provide base path');

  return function plugin (Model) {

    /**
     * Expose `request`.
     */

    Model.request = Model.prototype.request = request;

    /**
     * Remove all.
     *
     * @param {Mixed} args... (optional)
     * @param {Function} fn
     */

    Model.removeAll = function () {
      fn = fn || noop;
      var args = [].slice.call(arguments, arguments.length - 1);
      var fn = arguments[arguments.length - 1];
      var url = replace(base, args);
      this.request
        .del(url)
        .end(function (res) {
          if (res.error) return fn(error(res));
          fn(null, []);
        });
    };

    /**
     * Get all.
     *
     * @param {Mixed} args... (optional)
     * @param {Function} fn
     */

    Model.all = function () {
      var args = [].slice.call(arguments, arguments.length - 1);
      var fn = arguments[arguments.length - 1];
      var url = replace(base, args);
      this.request
        .get(url)
        .end(function (res) {
          if (res.error) return fn(error(res));
          fn(null, map(res.body, Model));
        });
    };

    /**
     * Get by `id`.
     *
     * @param {Mixed} args... (optional)
     * @param {Mixed} id
     * @param {Function} fn
     */

    Model.get = function () {
      var args = [].slice.call(arguments, arguments.length - 2);
      var id = arguments[arguments.length - 2];
      var fn = arguments[arguments.length - 1];
      var url = replace(base, args) + '/' + id;
      this.request
        .get(url)
        .end(function (res) {
          if (res.error) return fn(error(res));
          fn(null, Model(res.body));
        });
    };

    /**
     * Noop validate if it doesn't exist.
     *
     * @return {Boolean}
     */

    Model.prototype.validate = Model.prototype.validate || function () {
      return true;
    };

    /**
     * Get the URL for the model.
     *
     * @return {String}
     */

    Model.prototype.url = function () {
      return replace(base, this.attrs) + '/' + this.primary();
    };

    /**
     * Check whether the model has been saved or not.
     *
     * @return {Boolean}
     */

    Model.prototype.isNew = function () {
      var key = Model.primary();
      return ! this.has(key);
    };

    /**
     * Remove the model, and mark it as `removed`.
     *
     * @param {Function} fn
     */

    Model.prototype.remove = function (fn) {
      fn = fn || noop;
      if (this.isNew()) return fn(new Error('not saved'));
      var model = this;
      this.Model.emit('removing', model);
      this.emit('removing');
      this.request
        .del(this.url())
        .end(function (res) {
          if (res.error) return fn(error(res));
          model.removed = true;
          model.Model.emit('remove', model);
          model.emit('remove');
          fn();
        });
    };

    /**
     * Save the model, updating if not new.
     *
     * @param {Function} fn
     */

    Model.prototype.save = function (fn) {
      if (!this.isNew()) return this.update(fn);
      fn = fn || noop;
      if (!this.validate()) return fn(new Error('validation failed'));
      var key = this.Model.primary();
      var model = this;
      this.Model.emit('saving', model);
      this.emit('saving');
      this.request
        .post(replace(base, this.attrs))
        .send(model)
        .end(function (res) {
          if (res.error) return fn(error(res));
          if (res.body) model.primary(res.body[key]);
          model.Model.emit('save', model);
          model.emit('save');
          fn();
        });
    };

    /**
     * Update the model.
     *
     * @param {Function} fn
     * @api private
     */

    Model.prototype.update = function (fn) {
      fn = fn || noop;
      if (!this.validate()) return fn(new Error('validation failed'));
      var model = this;
      this.Model.emit('saving', model);
      this.emit('saving');
      this.request
        .put(this.url())
        .send(model)
        .end(function (res) {
          if (res.error) return fn(error(res));
          model.Model.emit('save', model);
          model.emit('save');
          fn();
        });
    };

  };
}

/**
 * Response error message helper.
 *
 * @param {Response} res
 * @return {Error}
 */

function error (res) {
  return new Error('got a ' + res.status + ' response');
}

/**
 * Given a `path` and `obj` replace the placeholders with the objects contents.
 * If the object is an array, replace in order, otherwise match to placeholders.
 *
 * @param {String} path
 * @param {Object or Array} obj
 */

function replace (path, obj) {
  switch (type(obj)) {
    case 'array':
      for (var i = 0; i < obj.length; i++) path = path.replace(/:\w+/, obj[i]);
      return path;
    case 'object':
      for (var key in obj) path = path.replace(':' + key, obj[key]);
      return path;
  }
}