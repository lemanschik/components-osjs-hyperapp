export {EventEmitter} from './osjs-eventemitter.js';

import {Graph, Node} from 'async-dependency-graph';
import merge from 'deepmerge';
import omitDeep from 'omit-deep';

/**
 * rollup index.js -o osjs-common.js

index.js → osjs-common.js...
(!) Unresolved dependencies
https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
@osjs/event-emitter (imported by "index.js" and "src/core.js")
deepmerge (imported by "src/core.js")
omit-deep (imported by "src/core.js")
async-dependency-graph (imported by "src/utils.js")
created osjs-common.js in 72ms

    "@osjs/event-emitter": "^1.0.10",
    "async-dependency-graph": "^1.1.4",
    "deepmerge": "^4.2.2",
    "omit-deep": "^0.3.0"
 */


const resolveTreeByKey = (tree, key, defaultValue) => {
  let result;

  try {
    result = key
      .split(/\./g)
      .reduce((result, key) => result[key], {...tree});
  } catch (e) { /* noop */ }

  return typeof result === 'undefined' ? defaultValue : result;
};

const each = (list, method) => Promise.all(list.map(p => {
  try {
    return p.provider[method]();
  } catch (e) {
    return Promise.reject(e);
  }
}))
  .catch(err => console.warn(err));

const providerHandler = (core) => {
  let instances = {};
  let providers = [];
  let registry = [];

  const createGraph = (list, method) => {
    const graph = new Graph();
    const provides = list.map(p => typeof p.provider.provides === 'function' ? p.provider.provides() : []);
    const dependsOnIndex = wants => provides.findIndex(arr => arr.some(a => wants.indexOf(a) !== -1));

    list.forEach((p, i) => {
      graph.addNode(new Node(String(i), () => {
        try {
          return Promise.resolve(p.provider[method]());
        } catch (e) {
          return Promise.reject(e);
        }
      }));
    });

    list.forEach((p, i) => {
      const dependsOptions = p.options.depends instanceof Array
        ? p.options.depends
        : [];

      const dependsInstance = typeof p.provider.depends === 'function'
        ? p.provider.depends()
        : [];

      const depends = [...dependsOptions, ...dependsInstance];
      if (depends.length > 0) {
        const dindex = dependsOnIndex(depends);
        if (dindex !== -1) {
          graph.addDependency(String(i), String(dindex));
        }
      }
    });

    return graph.traverse()
      .catch(e => console.warn(e));
  };

  const handle = list => createGraph(list, 'init')
    .then(() => createGraph(list, 'start'));


  const has = name => registry.findIndex(p => p.name === name) !== -1;

  const destroy = () => {
    const result = each(providers, 'destroy');

    instances = {};
    registry = [];

    return result;
  };

  const init = (before) =>
    handle(before
      ? providers.filter(p => p.options.before)
      : providers.filter(p => !p.options.before));

  const register = (ref, options) => {
    try {
      providers.push({
        provider: new ref(core, options.args),
        options
      });
    } catch (e) {
      console.error('Provider register error', e);
    }
  };

  const bind = (name, singleton, callback) => {
    core.logger.info('Provider binding', name);

    registry.push({
      singleton,
      name,
      make(...args) {
        return callback(...args);
      }
    });
  };

  const make = (name, ...args) => {
    const found = registry.find(p => p.name === name);
    if (!found) {
      throw new Error(`Provider '${name}' not found`);
    }

    if (!found.singleton) {
      return found.make(...args);
    }

    if (!instances[name]) {
      if (found) {
        instances[name] = found.make(...args);
      }
    }

    return instances[name];
  };

  return {register, init, bind, has, make, destroy};
};


/**
 * Core
 *
 * @desc Main class for OS.js service providers and bootstrapping.
 */
class CoreBase extends EventEmitter {

  /**
   * Create core instance
   * @param {Object} defaultConfiguration Default configuration
   * @param {Object} configuration Configuration given
   * @param {Object} options Options
   */
  constructor(defaultConfiguration, configuration, options) {
    super('Core');

    // https://github.com/KyleAMathews/deepmerge#webpack-bug
    const merger = merge.default ? merge.default : merge;
    const omitted = omitDeep(defaultConfiguration, options.omit || []);

    this.logger = console;
    this.configuration = merger(omitted, configuration);
    this.options = options;
    this.booted = false;
    this.started = false;
    this.destroyed = false;
    this.providers = providerHandler(this);
  }

  /**
   * Destroy core instance
   */
  destroy() {
    if (this.destroyed) {
      return false;
    }

    this.booted = false;
    this.destroyed = true;
    this.started = false;

    const promises = this.providers.destroy();

    super.destroy();

    return promises;
  }

  /**
   * Boots up OS.js
   */
  boot() {
    if (this.booted) {
      return Promise.resolve(true);
    }

    this.started = false;
    this.destroyed = false;
    this.booted = true;

    return this.providers.init(true)
      .then(() => true);
  }

  /**
   * Starts all core services
   */
  start() {
    if (this.started) {
      return Promise.resolve(true);
    }

    this.started = true;

    return this.providers.init(false)
      .then(() => true);
  }

  /**
   * Gets a configuration entry by key
   *
   * @param {String} key The key to get the value from
   * @param {*} [defaultValue] If result is undefined, return this instead
   * @see {resolveTreeByKey}
   * @return {*}
   */
  config(key, defaultValue) {
    return key
      ? resolveTreeByKey(this.configuration, key, defaultValue)
      : ({...this.configuration});
  }

  /**
   * Register a service provider
   *
   * @param {Class} ref A class reference
   * @param {Object} [options] Options for handling of provider
   * @param {Boolean} [options.before] Load this provider early
   * @param {Object} [options.args] Arguments to send to the constructor
   */
  register(ref, options = {}) {
    this.providers.register(ref, options);
  }

  /**
   * Register a instanciator provider
   *
   * @param {String} name Provider name
   * @param {Function} callback Callback that returns an instance
   */
  instance(name, callback) {
    this.providers.bind(name, false, callback);
  }

  /**
   * Register a singleton provider
   *
   * @param {String} name Provider name
   * @param {Function} callback Callback that returns an instance
   */
  singleton(name, callback) {
    this.providers.bind(name, true, callback);
  }

  /**
   * Create an instance of a provided service
   *
   * @param {String} name Service name
   * @param {*} args Constructor arguments
   * @return {*} An instance of a service
   */
  make(name, ...args) {
    return this.providers.make(name, ...args);
  }

  /**
   * Check if a service exists
   * @param {String} name Provider name
   * @return {Boolean}
   */
  has(name) {
    return this.providers.has(name);
  }
}


/**
 * Service Provider Interface
 *
 * @desc Provides a basic Service Provider interface for OS.js
 *
 * @interface
 */
class ServiceProvider {

  /**
   * Constructor
   * @param {Core} core Core reference
   */
  constructor(core, options = {}) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;
    this.options = options;
  }

  /**
   * A list of services this provider can create
   * @return {string[]}
   */
  provides() {
    return [];
  }

  /**
   * A list of services this provider depends on
   * @return {string[]}
   */
  depends() {
    return [];
  }

  /**
   * Initializes provider
   */
  async init() {
  }

  /**
   * Starts provider
   */
  start() {
  }

  /**
   * Destroys provider
   */
  destroy() {
  }

}

export {CoreBase, ServiceProvider};
