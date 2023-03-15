import require$$0$1 from 'fs-extra';
import require$$1$2 from 'node:http';
import require$$2 from 'node:https';
import require$$1$1 from 'node:path';
import require$$4 from 'morgan';
import require$$5 from 'express';
import require$$6 from 'minimist';
import require$$7 from 'deepmerge';
import require$$8 from 'consola';
import require$$0$2 from './common/osjs-common.js';
import require$$0 from 'express-session';
import require$$1 from 'express-ws';
import require$$1$3 from 'node:url';
import require$$2$1 from 'sanitize-filename';
import require$$3 from 'formidable';
import require$$4$1 from 'node:stream';
import require$$2$2 from 'filehound';
import require$$2$3 from 'chokidar';
import require$$2$4 from 'uuid';
import require$$3$1 from 'mime';
import require$$1$4 from 'fast-glob';
import require$$3$2 from 'body-parser';
import require$$4$2 from 'express-http-proxy';
import require$$5$1 from 'nocache';

// Example

/*

const {
  Core,
  CoreServiceProvider,
  PackageServiceProvider,
  VFSServiceProvider,
  AuthServiceProvider,
  SettingsServiceProvider
} = require('@osjs/server');

const config = require('./config.js');
const osjs = new Core(config, {});

osjs.register(CoreServiceProvider, {before: true});
osjs.register(PackageServiceProvider);
osjs.register(VFSServiceProvider);
osjs.register(AuthServiceProvider);
osjs.register(SettingsServiceProvider);

const shutdown = signal => (error) => {
  if (error instanceof Error) {
    console.error(error);
  }

  osjs.destroy(() => process.exit(signal));
};

process.on('SIGTERM', shutdown(0));
process.on('SIGINT', shutdown(0));
process.on('exit', shutdown(0));

osjs.boot().catch(shutdown(1));

*/


/**
 *
rollup -p @rollup/plugin-commonjs index.js -o osjs-server.js

index.js → osjs-server.js...
(!) Unresolved dependencies
https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
fs-extra (imported by "fs-extra?commonjs-external")
http (imported by "http?commonjs-external")
https (imported by "https?commonjs-external")
path (imported by "path?commonjs-external")
morgan (imported by "morgan?commonjs-external")
express (imported by "express?commonjs-external")
minimist (imported by "minimist?commonjs-external")
deepmerge (imported by "deepmerge?commonjs-external")
consola (imported by "consola?commonjs-external")
@osjs/common (imported by "@osjs/common?commonjs-external")
uuid (imported by "uuid?commonjs-external")
mime (imported by "mime?commonjs-external")
fast-glob (imported by "fast-glob?commonjs-external")
chokidar (imported by "chokidar?commonjs-external")
body-parser (imported by "body-parser?commonjs-external")
express-http-proxy (imported by "express-http-proxy?commonjs-external")
nocache (imported by "nocache?commonjs-external")
express-session (imported by "express-session?commonjs-external")
express-ws (imported by "express-ws?commonjs-external")
url (imported by "url?commonjs-external")
sanitize-filename (imported by "sanitize-filename?commonjs-external")
formidable (imported by "formidable?commonjs-external")
stream (imported by "stream?commonjs-external")
filehound (imported by "filehound?commonjs-external")
created osjs-server.js in 306ms


"@osjs/common": "^3.0.12",
    "body-parser": "^1.19.0",
    "chokidar": "^3.4.3",
    "connect-loki": "^1.1.0",
    "consola": "^2.15.0",
    "deepmerge": "^4.2.2",
    "express": "^4.17.1",
    "express-http-proxy": "^1.6.2",
    "express-session": "^1.17.1",
    "express-ws": "^4.0.0",
    "fast-glob": "^3.2.12",
    "filehound": "^1.17.4",
    "formidable": "^1.2.2",
    "fs-extra": "^9.0.1",
    "html-webpack-plugin": "5.5.0",
    "mime": "^2.4.6",
    "minimist": "^1.2.5",
    "morgan": "^1.10.0",
    "nocache": "^2.1.0",
    "sanitize-filename": "^1.6.3",
    "uuid": "^8.3.1"

*/

function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

let core$2 = {};



const express_session = require$$0;
const express_ws = require$$1;

/*
 * Converts an input argument to configuration entry
 * Overrides the user-created configuration file
 */
core$2.argvToConfig = {
  'logging': logging => ({logging}),
  'development': development => ({development}),
  'port': port => ({port}),
  'ws-port': port => ({ws: {port}}),
  'secret': secret => ({session: {options: {secret}}}),
  'morgan': morgan => ({morgan}),
  'discovery': discovery => ({packages: {discovery}}),
  'manifest': manifest => ({packages: {manifest}})
};

/*
 * Create session parser
 */
core$2.createSession = (app, configuration) => {
  const Store = commonjsRequire(configuration.session.store.module)(express_session);
  const store = new Store(configuration.session.store.options);

  return express_session({
    store,
    ...configuration.session.options
  });
};

/*
 * Create WebSocket server
 */
core$2.createWebsocket = (app, configuration, session, httpServer) => express_ws(app, httpServer, {
  wsOptions: {
    ...configuration.ws,
    verifyClient: (info, done) => {
      session(info.req, {}, () => {
        done(true);
      });
    }
  }
});

/*
 * Wrapper for parsing json
 */
core$2.parseJson = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

/*
 * Checks groups for a request
 */
const validateGroups$1 = (req, groups, all) => {
  if (groups instanceof Array && groups.length) {
    const userGroups = req.session.user.groups;

    const method = all ? 'every' : 'some';

    return groups[method](g => userGroups.indexOf(g) !== -1);
  }

  return true;
};

/*
 * Authentication middleware wrapper
 */
core$2.isAuthenticated = (groups = [], all = false) => (req, res, next) => {
  if (req.session.user && validateGroups$1(req, groups, all)) {
    return next();
  }

  return res
    .status(403)
    .send('Access denied');
};

/**
 * Closes an array of watches
 */
core$2.closeWatches = (watches) => Promise.all(
  watches.map((w) => {
    return w.close()
      .catch(error => console.warn(error));
  })
);



const path$9 = require$$1$1;
const maxAge = 60 * 60 * 12;
const mb = m => m * 1024 * 1024;

const defaultConfiguration$1 = {
  development: !(process.env.NODE_ENV || '').match(/^prod/i),
  logging: true,
  index: 'index.html',
  bind: '0.0.0.0',
  port: 8000,
  public: null,
  morgan: 'tiny',
  express: {
    maxFieldsSize: mb(20),
    maxFileSize: mb(200),
    maxBodySize: '100kb'
  },
  https: {
    enabled: false,
    options: {
      key: null,
      cert: null
    }
  },
  ws: {
    port: null,
    ping: 30 * 1000
  },
  proxy: [
    /*
    {
      source: 'pattern',
      destination: 'pattern',
      options: {}
    }
    */
  ],
  auth: {
    vfsGroups: [],
    defaultGroups: [],
    requiredGroups: [],
    requireAllGroups: false,
    denyUsers: []
  },
  mime: {
    filenames: {
      // 'filename': 'mime/type'
      'Makefile': 'text/x-makefile',
      '.gitignore': 'text/plain'
    },
    define: {
      // 'mime/type': ['ext']
      'text/x-lilypond': ['ly', 'ily'],
      'text/x-python': ['py'],
      'application/tar+gzip': ['tgz']
    }
  },
  session: {
    store: {
      module: require.resolve('connect-loki'),
      options: {
        autosave: true
        // ttl: maxAge
      }
    },
    options: {
      name: 'osjs.sid',
      secret: 'osjs',
      rolling: true,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: 'auto',
        maxAge: 1000 * maxAge
      }
    }
  },
  packages: {
    // Resolves to root by default
    discovery: 'packages.json',

    // Resolves to dist/ by default
    metadata: 'metadata.json'
  },

  vfs: {
    watch: false,
    root: path$9.join(process.cwd(), 'vfs'),

    mountpoints: [{
      name: 'osjs',
      attributes: {
        root: '{root}/dist',
        readOnly: true
      }
    }, {
      name: 'home',
      attributes: {
        root: '{vfs}/{username}'
      }
    }],

    home: {
      template: [{
        path: '.desktop/.shortcuts.json',
        contents: JSON.stringify([])
      }]
    }
  }
};

let config = {
  defaultConfiguration: defaultConfiguration$1
};



const fs$7 = require$$0$1;
const http = require$$1$2;
const https = require$$2;
const path$8 = require$$1$1;
const morgan = require$$4;
const express$2 = require$$5;
const minimist = require$$6;
const deepmerge = require$$7;
const consola$3 = require$$8;
const {CoreBase} = require$$0$2;
const {argvToConfig, createSession, createWebsocket, parseJson: parseJson$1} = core$2;
const {defaultConfiguration} = config;
const logger$3 = consola$3.withTag('Core');

let _instance;

/**
 * OS.js Server Core
 */
class Core$1 extends CoreBase {

  /**
   * Creates a new instance
   * @param {Object} cfg Configuration tree
   * @param {Object} [options] Options
   */
  constructor(cfg, options = {}) {
    options = {
      argv: process.argv.splice(2),
      root: process.cwd(),
      ...options
    };

    const argv = minimist(options.argv);
    const val = k => argvToConfig[k](parseJson$1(argv[k]));
    const keys = Object.keys(argvToConfig).filter(k => Object.prototype.hasOwnProperty.call(argv, k));
    const argvConfig = keys.reduce((o, k) => {
      logger$3.info(`CLI argument '--${k}' overrides`, val(k));
      return {...o, ...deepmerge(o, val(k))};
    }, {});

    super(defaultConfiguration, deepmerge(cfg, argvConfig), options);

    this.logger = consola$3.withTag('Internal');

    /**
     * @type {Express}
     */
    this.app = express$2();

    if (!this.configuration.public) {
      throw new Error('The public option is required');
    }

    /**
     * @type {http.Server|https.Server}
     */
    this.httpServer = this.config('https.enabled')
      ? https.createServer(this.config('https.options'), this.app)
      : http.createServer(this.app);

    /**
     * @type {object}
     */
    this.session = createSession(this.app, this.configuration);

    /**
     * @type {object}
     */
    this.ws = createWebsocket(this.app, this.configuration, this.session, this.httpServer);

    /**
     * @type {object}
     */
    this.wss = this.ws.getWss();

    _instance = this;
  }

  /**
   * Destroys the instance
   * @param {Function} [done] Callback when done
   * @return {Promise<undefined>}
   */
  async destroy(done = () => {}) {
    if (this.destroyed) {
      return;
    }

    this.emit('osjs/core:destroy');

    logger$3.info('Shutting down...');

    if (this.wss) {
      this.wss.close();
    }

    const finish = (error) => {
      if (error) {
        logger$3.error(error);
      }

      if (this.httpServer) {
        this.httpServer.close(done);
      } else {
        done();
      }
    };

    try {
      await super.destroy();
      finish();
    } catch (e) {
      finish(e);
    }
  }

  /**
   * Starts the server
   * @return {Promise<boolean>}
   */
  async start() {
    if (!this.started) {
      logger$3.info('Starting services...');

      await super.start();

      logger$3.success('Initialized!');

      await this.listen();
    }

    return true;
  }

  /**
   * Initializes the server
   * @return {Promise<boolean>}
   */
  async boot() {
    if (this.booted) {
      return true;
    }

    this.emit('osjs/core:start');

    if (this.configuration.logging) {
      this.wss.on('connection', (c) => {
        logger$3.log('WebSocket connection opened');
        c.on('close', () => logger$3.log('WebSocket connection closed'));
      });

      if (this.configuration.morgan) {
        this.app.use(morgan(this.configuration.morgan));
      }
    }


    logger$3.info('Initializing services...');

    await super.boot();
    this.emit('init');
    await this.start();
    this.emit('osjs/core:started');

    return true;
  }

  /**
   * Opens HTTP server
   */
  async listen() {
    const httpPort = this.config('port');
    const httpHost = this.config('bind');
    const wsPort = this.config('ws.port') || httpPort;
    const pub = this.config('public');
    const session = path$8.basename(path$8.dirname(this.config('session.store.module')));
    const dist = pub.replace(process.cwd(), '');
    const secure = this.config('https.enabled', false);
    const proto = prefix => `${prefix}${secure ? 's' : ''}://`;
    const host = port => `${httpHost}:${port}`;

    logger$3.info('Opening server connection');

    const checkFile = path$8.join(pub, this.configuration.index);
    if (!fs$7.existsSync(checkFile)) {
      logger$3.warn('Missing files in "dist/" directory. Did you forget to run "npm run build" ?');
    }

    return new Promise((resolve, reject) => {
      try {
        this.httpServer.listen(httpPort, httpHost, (e) => {
          if (e) {
            reject(e);
          } else {
            logger$3.success(`Using '${session}' sessions`);
            logger$3.success(`Serving '${dist}'`);
            logger$3.success(`WebSocket listening on ${proto('ws')}${host(wsPort)}`);
            logger$3.success(`Server listening on ${proto('http')}${host(httpPort)}`);
            resolve();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Broadcast given event to client
   * @param {string} name Event name
   * @param {Array} params A list of parameters to send to client
   * @param {Function} [filter] A function to filter clients
   */
  broadcast(name, params, filter) {
    filter = filter || (() => true);

    if (this.ws) {
      this.wss.clients // This is a Set
        .forEach(client => {
          if (!client._osjs_client) {
            return;
          }

          if (filter(client)) {
            client.send(JSON.stringify({
              params,
              name
            }));
          }
        });
    }
  }

  /**
   * Broadcast given event to all clients
   * @param {string} name Event name
   * @param {Array} ...params A list of parameters to send to client
   */
  broadcastAll(name, ...params) {
    return this.broadcast(name, params);
  }

  /**
   * Broadcast given event to client filtered by username
   * @param {String} username Username to send to
   * @param {string} name Event name
   * @param {Array} ...params A list of parameters to send to client
   */
  broadcastUser(username, name, ...params) {
    return this.broadcast(name, params, client => {
      return client._osjs_client.username === username;
    });
  }

  /**
   * Gets the server instance
   * @return {Core}
   */
  static getInstance() {
    return _instance;
  }
}

let core$1 = Core$1;



let _null$1;
let hasRequired_null;

function require_null() {
  if (hasRequired_null) {
    return _null$1;
  }
  hasRequired_null = 1;
  /**
 * Null Auth adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
  _null$1 = (core, options) => ({
    init: async () => true,
    destroy: async () => true,
    register: async (req, res) => ({username: req.body.username}),
    login: async (req, res) => ({id: 0, username: req.body.username}),
    logout: async (req, res) => true
  });
  return _null$1;
}



const fs$6 = require$$0$1;
const pathLib = require$$1$1;
const consola$2 = require$$8;
const logger$2 = consola$2.withTag('Auth');
const nullAdapter$1 = require_null();

/**
 * TODO: typedef
 * @typedef {Object} AuthAdapter
 */

/**
 * Authentication User Profile
 * @typedef {Object} AuthUserProfile
 * @property {number} id
 * @property {string} username
 * @property {string} name
 * @property {string[]} groups
 */

/**
 * Authentication Service Options
 * @typedef {Object} AuthOptions
 * @property {AuthAdapter} [adapter]
 * @property {string[]} [requiredGroups]
 * @property {string[]} [denyUsers]
 */

/**
 * Authentication Handler
 */
class Auth$2 {

  /**
   * Creates a new instance
   * @param {Core} core Core instance reference
   * @param {AuthOptions} [options={}] Service Provider arguments
   */
  constructor(core, options = {}) {
    const {requiredGroups, denyUsers} = core.configuration.auth;

    /**
     * @type {Core}
     */
    this.core = core;

    /**
     * @type {AuthOptions}
     */
    this.options = {
      adapter: nullAdapter$1,
      requiredGroups,
      denyUsers,
      ...options
    };

    /**
     * @type {AuthAdapter}
     */
    this.adapter = nullAdapter$1(core, this.options.config);

    try {
      this.adapter = this.options.adapter(core, this.options.config);
    } catch (e) {
      this.core.logger.warn(e);
    }
  }

  /**
   * Destroys instance
   */
  destroy() {
    if (this.adapter.destroy) {
      this.adapter.destroy();
    }
  }

  /**
   * Initializes adapter
   * @return {Promise<boolean>}
   */
  async init() {
    if (this.adapter.init) {
      return this.adapter.init();
    }

    return true;
  }

  /**
   * Performs a login request
   * @param {Request} req HTTP request
   * @param {Response} res HTTP response
   * @return {Promise<undefined>}
   */
  async login(req, res) {
    const result = await this.adapter.login(req, res);

    if (result) {
      const profile = this.createUserProfile(req.body, result);

      if (profile && this.checkLoginPermissions(profile)) {
        await this.createHomeDirectory(profile, req, res);
        req.session.user = profile;
        req.session.save(() => {
          this.core.emit('osjs/core:logged-in', Object.freeze({
            ...req.session
          }));

          res.status(200).json(profile);
        });
        return;
      }
    }

    res.status(403)
      .json({error: 'Invalid login or permission denied'});
  }

  /**
   * Performs a logout request
   * @param {Request} req HTTP request
   * @param {Response} res HTTP response
   * @return {Promise<undefined>}
   */
  async logout(req, res) {
    this.core.emit('osjs/core:logging-out', Object.freeze({
      ...req.session
    }));

    await this.adapter.logout(req, res);

    try {
      req.session.destroy();
    } catch (e) {
      logger$2.warn(e);
    }

    res.json({});
  }

  /**
   * Performs a register request
   * @param {Request} req HTTP request
   * @param {Response} res HTTP response
   * @return {Promise<undefined>}
   */
  async register(req, res) {
    if (this.adapter.register) {
      const result = await this.adapter.register(req, res);

      return res.json(result);
    }

    return res.status(403)
      .json({error: 'Registration unavailable'});
  }

  /**
   * Checks if login is allowed for this user
   * @param {AuthUserProfile} profile User profile
   * @return {boolean}
   */
  checkLoginPermissions(profile) {
    const {requiredGroups, denyUsers} = this.options;

    if (denyUsers.indexOf(profile.username) !== -1) {
      return false;
    }

    if (requiredGroups.length > 0) {
      const passes = requiredGroups.every(name => {
        return profile.groups.indexOf(name) !== -1;
      });

      return passes;
    }

    return true;
  }

  /**
   * Creates user profile object
   * @param {object} fields Input fields
   * @param {object} result Login result
   * @return {AuthUserProfile|boolean}
   */
  createUserProfile(fields, result) {
    const ignores = ['password'];
    const required = ['username', 'id'];
    const template = {
      id: 0,
      username: fields.username,
      name: fields.username,
      groups: this.core.config('auth.defaultGroups', [])
    };

    const missing = required
      .filter(k => typeof result[k] === 'undefined');

    if (missing.length) {
      logger$2.warn('Missing user attributes', missing);
    } else {
      const values = Object.keys(result)
        .filter(k => ignores.indexOf(k) === -1)
        .reduce((o, k) => ({...o, [k]: result[k]}), {});

      return {...template, ...values};
    }

    return false;
  }

  /**
   * Tries to create home directory for a user
   * @param {AuthUserProfile} profile User profile
   * @return {Promise<undefined>}
   */
  async createHomeDirectory(profile) {
    const vfs = this.core.make('osjs/vfs');
    const template = this.core.config('vfs.home.template', []);

    if (typeof template === 'string') {
      // If the template is a string, it is a path to a directory
      // that should be copied to the user's home directory
      const root = await vfs.realpath('home:/', profile);

      await fs$6.copy(template, root, {overwrite: false});
    } else if (Array.isArray(template)) {
      await this.createHomeDirectoryFromArray(template, vfs, profile);
    }
  }

  /**
   * If the template is an array, it is a list of files that should be copied
   * to the user's home directory
   * @param {Object[]} template Array of objects with a specified path,
   * optionally with specified content but defaulting to an empty string
   * @param {VFSServiceProvider} vfs An instance of the virtual file system
   * @param {AuthUserProfile} profile User profile
   */
  async createHomeDirectoryFromArray(template, vfs, profile) {
    for (const file of template) {
      try {
        const {path, contents = ''} = file;
        const shortcutsFile = await vfs.realpath(`home:/${path}`, profile);
        const dir = pathLib.dirname(shortcutsFile);

        if (!await fs$6.pathExists(shortcutsFile)) {
          await fs$6.ensureDir(dir);
          await fs$6.writeFile(shortcutsFile, contents);
        }
      } catch (e) {
        console.warn(`There was a problem writing '${file.path}' to the home directory template`);
        console.error('ERROR:', e);
      }
    }
  }
}

let auth$1 = Auth$2;



const fs$5 = require$$0$1;
const url = require$$1$3;
const sanitizeFilename = require$$2$1;
const formidable = require$$3;
const {Stream: Stream$1} = require$$4$1;

/**
 * A map of error codes
 */
const errorCodes$1 = {
  ENOENT: 404,
  EACCES: 401
};

/**
 * Gets prefix of a VFS path
 */
const getPrefix = path => String(path).split(':')[0];

/**
 * Sanitizes a path
 */
const sanitize$1 = filename => {
  const [name, str] = (filename.replace(/\/+/g, '/')
    .match(/^([\w-_]+):+(.*)/) || [])
    .slice(1);

  const sane = str.split('/')
    .map(s => sanitizeFilename(s))
    .join('/')
    .replace(/\/+/g, '/');

  return name + ':' + sane;
};

/**
 * Gets the stream from a HTTP request
 */
const streamFromRequest$1 = req => {
  const isStream = req.files.upload instanceof Stream$1;
  return isStream
    ? req.files.upload
    : fs$5.createReadStream(req.files.upload.path);
};

const validateAll = (arr, compare, strict = true) => arr[strict ? 'every' : 'some'](g => compare.indexOf(g) !== -1);

/**
 * Validates array groups
 */
const validateNamedGroups = (groups, userGroups, strict) => {
  const namedGroups = groups
    .filter(g => typeof g === 'string');

  return namedGroups.length
    ? validateAll(namedGroups, userGroups, strict)
    : true;
};

/**
 * Validates matp of groups based on method:[group,...]
 */
const validateMethodGroups = (groups, userGroups, method, strict) => {
  const methodGroups = groups
    .find(g => typeof g === 'string' ? false : (method in g));

  return methodGroups
    ? validateAll(methodGroups[method], userGroups, strict)
    : true;
};

/**
 * Validates groups
 */
const validateGroups = (userGroups, method, mountpoint, strict) => {
  const groups = mountpoint.attributes.groups || [];
  if (groups.length) {
    const namedValid = validateNamedGroups(groups, userGroups, strict);
    const methodValid = validateMethodGroups(groups, userGroups, method, strict);

    return namedValid && methodValid;
  }

  return true;
};

/**
 * Checks permissions for given mountpoint
 */
const checkMountpointPermission$1 = (req, res, method, readOnly, strict) => {
  const userGroups = req.session.user.groups;

  return ({mount}) => {
    if (readOnly) {
      const {attributes, name} = mount;

      if (attributes.readOnly) {
        const failed = typeof readOnly === 'function'
          ? getPrefix(readOnly(req, res)) === name
          : readOnly;

        if (failed) {
          return Promise.reject(createError(403, `Mountpoint '${name}' is read-only`));
        }
      }
    }

    if (validateGroups(userGroups, method, mount, strict)) {
      return Promise.resolve(true);
    }

    return Promise.reject(createError(403, `Permission was denied for '${method}' in '${mount.name}'`));
  };
};

/**
 * Creates a new custom Error
 */
const createError = (code, message) => {
  const e = new Error(message);
  e.code = code;
  return e;
};

/**
 * Resolves a mountpoint
 */
const mountpointResolver$1 = core => async (path) => {
  const {adapters, mountpoints} = core.make('osjs/vfs');
  const prefix = getPrefix(path);
  const mount = mountpoints.find(m => m.name === prefix);

  if (!mount) {
    throw createError(403, `Mountpoint not found for '${prefix}'`);
  }

  const adapter = await (mount.adapter
    ? adapters[mount.adapter]
    : adapters.system);

  return Object.freeze({mount, adapter});
};

/*
 * Assembles a given object query
 */
const assembleQueryData = (data) => {
  const entries = Object
    .entries(data)
    .map(([k, v]) => {
      try {
        return [k, JSON.parse(v)];
      } catch (e) {
        return [k, v];
      }
    });

  return Object.fromEntries(entries);
};

/*
 * Parses URL Body
 */
const parseGet = req => {
  const {query} = url.parse(req.url, true);
  const assembledQuery = assembleQueryData(query);
  return Promise.resolve({fields: assembledQuery, files: {}});
};

/*
 * Parses Json Body
 */
const parseJson = req => {
  const isJson = req.headers['content-type'] &&
    req.headers['content-type'].indexOf('application/json') !== -1;

  if (isJson) {
    return {fields: req.body, files: {}};
  }

  return false;
};

/*
 * Parses Form Body
 */
const parseFormData = (req, {maxFieldsSize, maxFileSize}) => {
  const form = new formidable.IncomingForm();
  form.maxFieldsSize = maxFieldsSize;
  form.maxFileSize = maxFileSize;

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      return err ? reject(err) : resolve({fields, files});
    });
  });
};

/**
 * Middleware for handling HTTP requests
 */
const parseFields$1 = config => (req, res) => {
  if (['get', 'head'].indexOf(req.method.toLowerCase()) !== -1) {
    return Promise.resolve(parseGet(req));
  }

  const json = parseJson(req);
  if (json) {
    return Promise.resolve(json);
  }

  return parseFormData(req, config);
};

/**
 * A map of methods and their arguments.
 * Used for direct access via API
 */
const methodArguments$1 = {
  realpath: ['path'],
  exists: ['path'],
  stat: ['path'],
  readdir: ['path'],
  readfile: ['path'],
  writefile: ['path', upload => ({upload})],
  mkdir: ['path'],
  unlink: ['path'],
  touch: ['path'],
  search: ['root', 'pattern'],
  copy: ['from', 'to'],
  rename: ['from', 'to']
};

let vfs$3 = {
  mountpointResolver: mountpointResolver$1,
  createError,
  checkMountpointPermission: checkMountpointPermission$1,
  validateGroups,
  streamFromRequest: streamFromRequest$1,
  sanitize: sanitize$1,
  getPrefix,
  parseFields: parseFields$1,
  errorCodes: errorCodes$1,
  methodArguments: methodArguments$1,
  assembleQueryData
};



const fs$4 = require$$0$1;
const path$7 = require$$1$1;
const fh = require$$2$2;
const chokidar$3 = require$$2$3;

/*
 * Creates an object readable by client
 */
const createFileIter = (core, realRoot, file) => {
  const filename = path$7.basename(file);
  const realPath = path$7.join(realRoot, filename);
  const {mime} = core.make('osjs/vfs');

  const createStat = stat => ({
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    mime: stat.isFile() ? mime(realPath) : null,
    size: stat.size,
    path: file,
    filename,
    stat
  });

  return fs$4.stat(realPath)
    .then(createStat)
    .catch(error => {
      core.logger.warn(error);

      return createStat({
        isDirectory: () => false,
        isFile: () => true,
        size: 0
      });
    });
};

/*
 * Segment value map
 */
const segments = {
  root: {
    dynamic: false,
    fn: () => process.cwd()
  },

  vfs: {
    dynamic: false,
    fn: core => core.config('vfs.root', process.cwd())
  },

  username: {
    dynamic: true,
    fn: (core, session) => session.user.username
  }
};

/*
 * Gets a segment value
 */
const getSegment = (core, session, seg) => segments[seg] ? segments[seg].fn(core, session) : '';

/*
 * Matches a string for segments
 */
const matchSegments = str => (str.match(/(\{\w+\})/g) || []);

/*
 * Resolves a string with segments
 */
const resolveSegments = (core, session, str) => matchSegments(str)
  .reduce((result, current) => result.replace(current, getSegment(core, session, current.replace(/(\{|\})/g, ''))), str);

/*
 * Resolves a given file path based on a request
 * Will take out segments from the resulting string
 * and replace them with a list of defined variables
 */
const getRealPath = (core, session, mount, file) => {
  const root = resolveSegments(core, session, mount.attributes.root);
  const str = file.substr(mount.root.length - 1);
  return path$7.join(root, str);
};

/**
 * System VFS adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
let system = (core) => {
  const wrapper = (method, cb, ...args) => vfs => (file, options = {}) => {
    const promise = Promise.resolve(getRealPath(core, options.session, vfs.mount, file))
      .then(realPath => fs$4[method](realPath, ...args));

    return typeof cb === 'function'
      ? cb(promise, options)
      : promise.then(() => true);
  };

  const crossWrapper = method => (srcVfs, destVfs) => (src, dest, options = {}) => Promise.resolve({
    realSource: getRealPath(core, options.session, srcVfs.mount, src),
    realDest: getRealPath(core, options.session, destVfs.mount, dest)
  })
    .then(({realSource, realDest}) => fs$4[method](realSource, realDest))
    .then(() => true);

  return {
    watch: (mount, callback) => {
      const dest = resolveSegments(core, {
        user: {
          username: '**'
        }
      }, mount.attributes.root);

      const watch = chokidar$3.watch(dest, mount.attributes.chokidar || {});
      const restr = dest.replace(/\*\*/g, '([^/]*)');
      const re = new RegExp(restr + '/(.*)');
      const seg =  matchSegments(mount.attributes.root)
        .map(s => s.replace(/\{|\}/g, ''))
        .filter(s => segments[s].dynamic);

      const handle = name => file => {
        const test = re.exec(file);

        if (test && test.length > 0) {
          const args = seg.reduce((res, k, i) => ({[k]: test[i + 1]}), {});
          callback(args, test[test.length - 1], name);
        }
      };

      const events = ['add', 'addDir', 'unlinkDir', 'unlink'];
      events.forEach(name => watch.on(name, handle(name)));

      return watch;
    },

    /**
     * Get filesystem capabilities
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {Object[]}
     */
    capabilities: vfs => (file, options = {}) =>
      Promise.resolve({
        sort: false,
        pagination: false
      }),

    /**
     * Checks if file exists
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {Promise<boolean, Error>}
     */
    exists: wrapper('access', promise => {
      return promise.then(() => true)
        .catch(() => false);
    }, fs$4.F_OK),

    /**
     * Get file statistics
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {Object}
     */
    stat: vfs => (file, options = {}) =>
      Promise.resolve(getRealPath(core, options.session, vfs.mount, file))
        .then(realPath => {
          return fs$4.access(realPath, fs$4.F_OK)
            .then(() => createFileIter(core, path$7.dirname(realPath), realPath));
        }),

    /**
     * Reads directory
     * @param {String} root The file path from client
     * @param {Object} [options={}] Options
     * @return {Object[]}
     */
    readdir: vfs => (root, options) =>
      Promise.resolve(getRealPath(core, options.session, vfs.mount, root))
        .then(realPath => fs$4.readdir(realPath).then(files => ({realPath, files})))
        .then(({realPath, files}) => {
          const promises = files.map(f => createFileIter(core, realPath, root.replace(/\/?$/, '/') + f));
          return Promise.all(promises);
        }),

    /**
     * Reads file stream
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {stream.Readable}
     */
    readfile: vfs => (file, options = {}) =>
      Promise.resolve(getRealPath(core, options.session, vfs.mount, file))
        .then(realPath => fs$4.stat(realPath).then(stat => ({realPath, stat})))
        .then(({realPath, stat}) => {
          if (!stat.isFile()) {
            return false;
          }

          const range = options.range || [];
          return fs$4.createReadStream(realPath, {
            flags: 'r',
            start: range[0],
            end: range[1]
          });
        }),

    /**
     * Creates directory
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {boolean}
     */
    mkdir: wrapper('mkdir', (promise, options = {}) => {
      return promise
        .then(() => true)
        .catch(e => {
          if (options.ensure && e.code === 'EEXIST') {
            return true;
          }

          return Promise.reject(e);
        });
    }),

    /**
     * Writes file stream
     * @param {String} file The file path from client
     * @param {stream.Readable} data The stream
     * @param {Object} [options={}] Options
     * @return {Promise<boolean, Error>}
     */
    writefile: vfs => (file, data, options = {}) => new Promise((resolve, reject) => {
      // FIXME: Currently this actually copies the file because
      // formidable will put this in a temporary directory.
      // It would probably be better to do a "rename()" on local filesystems
      const realPath = getRealPath(core, options.session, vfs.mount, file);

      const write = () => {
        const stream = fs$4.createWriteStream(realPath);
        data.on('error', err => reject(err));
        data.on('end', () => resolve(true));
        data.pipe(stream);
      };

      fs$4.stat(realPath).then(stat => {
        if (stat.isDirectory()) {
          resolve(false);
        } else {
          write();
        }
      }).catch((err) => err.code === 'ENOENT' ? write()  : reject(err));
    }),

    /**
     * Renames given file or directory
     * @param {String} src The source file path from client
     * @param {String} dest The destination file path from client
     * @param {Object} [options={}] Options
     * @return {boolean}
     */
    rename: crossWrapper('rename'),

    /**
     * Copies given file or directory
     * @param {String} src The source file path from client
     * @param {String} dest The destination file path from client
     * @param {Object} [options={}] Options
     * @return {boolean}
     */
    copy: crossWrapper('copy'),

    /**
     * Removes given file or directory
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {boolean}
     */
    unlink: wrapper('remove'),

    /**
     * Searches for files and folders
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {Promise<Object>}
     */
    search: vfs => (root, pattern, options = {}) =>
      Promise.resolve(getRealPath(core, options.session, vfs.mount, root))
        .then(realPath => {
          return fh.create()
            .paths(realPath)
            .match(pattern)
            .find()
            .then(files => ({realPath, files}))
            .catch(err => {
              core.logger.warn(err);

              return {realPath, files: []};
            });
        })
        .then(({realPath, files}) => {
          const promises = files.map(f => {
            const rf = f.substr(realPath.length);
            return createFileIter(
              core,
              path$7.dirname(realPath.replace(/\/?$/, '/') + rf),
              root.replace(/\/?$/, '/') + rf
            );
          });
          return Promise.all(promises);
        }),

    /**
     * Touches a file
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {boolean}
     */
    touch: wrapper('ensureFile'),

    /**
     * Gets the real filesystem path (internal only)
     * @param {String} file The file path from client
     * @param {Object} [options={}] Options
     * @return {string}
     */
    realpath: vfs => (file, options = {}) =>
      Promise.resolve(getRealPath(core, options.session, vfs.mount, file))
  };
};



const fs$3 = require$$0$1;
const path$6 = require$$1$1;
const express$1 = require$$5;
const {Stream} = require$$4$1;
const {
  mountpointResolver,
  checkMountpointPermission,
  streamFromRequest,
  sanitize,
  parseFields,
  errorCodes
} = vfs$3;

const respondNumber = result => typeof result === 'number' ? result : -1;
const respondBoolean = result => typeof result === 'boolean' ? result : !!result;
const requestPath = req => ([sanitize(req.fields.path)]);
const requestSearch = req => ([sanitize(req.fields.root), req.fields.pattern]);
const requestCross = req => ([sanitize(req.fields.from), sanitize(req.fields.to)]);
const requestFile = req => ([sanitize(req.fields.path), streamFromRequest(req)]);

/*
 * Parses the range request headers
 */
const parseRangeHeader = (range, size) => {
  const [pstart, pend] = range.replace(/bytes=/, '').split('-');
  const start = parseInt(pstart, 10);
  const end = pend ? parseInt(pend, 10) : undefined;
  return [start, end];
};

/**
 * A "finally" for our chain
 */
const onDone = (req, res) => {
  if (req.files) {
    for (let fieldname in req.files) {
      fs$3.unlink(req.files[fieldname].path, () => ({}));
    }
  }
};

/**
 * Wraps a vfs adapter request
 */
const wrapper = fn => (req, res, next) => fn(req, res)
  .then(result => {
    if (result instanceof Stream) {
      result.pipe(res);
    } else {
      res.json(result);
    }

    onDone(req);
  })
  .catch(error => {
    onDone(req);

    next(error);
  });

/**
 * Creates the middleware
 */
const createMiddleware = core => {
  const parse = parseFields(core.config('express'));

  return (req, res, next) => parse(req, res)
    .then(({fields, files}) => {
      req.fields = fields;
      req.files = files;

      next();
    })
    .catch(error => {
      core.logger.warn(error);
      req.fields = {};
      req.files = {};

      next(error);
    });
};

const createOptions = req => {
  const options = req.fields.options;
  const range = req.headers && req.headers.range;
  const session = {...req.session || {}};
  let result = options || {};

  if (typeof options === 'string') {
    try {
      result = JSON.parse(req.fields.options) || {};
    } catch (e) {
      // Allow to fall through
    }
  }

  if (range) {
    result.range = parseRangeHeader(req.headers.range);
  }

  return {
    ...result,
    session
  };
};

// Standard request with only a target
const createRequestFactory = findMountpoint => (getter, method, readOnly, respond) => async (req, res) => {
  const options = createOptions(req);
  const args = [...getter(req, res), options];

  const found = await findMountpoint(args[0]);
  if (method === 'search') {
    if (found.mount.attributes && found.mount.attributes.searchable === false) {
      return [];
    }
  }

  const {attributes} = found.mount;
  const strict = attributes.strictGroups !== false;
  const ranges = (!attributes.adapter || attributes.adapter === 'system') || attributes.ranges === true;
  const vfsMethodWrapper = m => found.adapter[m]
    ? found.adapter[m](found)(...args)
    : Promise.reject(new Error(`Adapter does not support ${m}`));
  const readstat = () => vfsMethodWrapper('stat').catch(() => ({}));
  await checkMountpointPermission(req, res, method, readOnly, strict)(found);

  const result = await vfsMethodWrapper(method);
  if (method === 'readfile') {
    const stat = await readstat();

    if (ranges && options.range) {
      try {
        if (stat.size) {
          const size = stat.size;
          const [start, end] = options.range;
          const realEnd = end ? end : size - 1;
          const chunksize = (realEnd - start) + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${realEnd}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': stat.mime
          });
        }
      } catch (e) {
        console.warn('Failed to send a ranged response', e);
      }
    } else if (stat.mime) {
      res.append('Content-Type', stat.mime);
    }

    if (options.download) {
      const filename = encodeURIComponent(path$6.basename(args[0]));
      res.append('Content-Disposition', `attachment; filename*=utf-8''${filename}`);
    }
  }

  return respond ? respond(result) : result;
};

// Request that has a source and target
const createCrossRequestFactory = findMountpoint => (getter, method, respond) => async (req, res) => {
  const [from, to, options] = [...getter(req, res), createOptions(req)];

  const srcMount = await findMountpoint(from);
  const destMount = await findMountpoint(to);
  const sameAdapter = srcMount.adapter === destMount.adapter;

  const srcStrict = srcMount.mount.attributes.strictGroups !== false;
  const destStrict = destMount.mount.attributes.strictGroups !== false;
  await checkMountpointPermission(req, res, 'readfile', false, srcStrict)(srcMount);
  await checkMountpointPermission(req, res, 'writefile', true, destStrict)(destMount);

  if (sameAdapter) {
    const result = await srcMount
      .adapter[method](srcMount, destMount)(from, to, options);

    return !!result;
  }

  // Simulates a copy/move
  const stream = await srcMount.adapter
    .readfile(srcMount)(from, options);

  const result = await destMount.adapter
    .writefile(destMount)(to, stream, options);

  if (method === 'rename') {
    await srcMount.adapter
      .unlink(srcMount)(from, options);
  }

  return !!result;
};

/*
 * VFS Methods
 */
const vfs$2 = core => {
  const findMountpoint = mountpointResolver(core);
  const createRequest = createRequestFactory(findMountpoint);
  const createCrossRequest = createCrossRequestFactory(findMountpoint);

  // Wire up all available VFS events
  return {
    capabilities: createRequest(requestPath, 'capabilities', false),
    realpath: createRequest(requestPath, 'realpath', false),
    exists: createRequest(requestPath, 'exists', false, respondBoolean),
    stat: createRequest(requestPath, 'stat', false),
    readdir: createRequest(requestPath, 'readdir', false),
    readfile: createRequest(requestPath, 'readfile', false),
    writefile: createRequest(requestFile, 'writefile', true, respondNumber),
    mkdir: createRequest(requestPath, 'mkdir', true, respondBoolean),
    unlink: createRequest(requestPath, 'unlink', true, respondBoolean),
    touch: createRequest(requestPath, 'touch', true, respondBoolean),
    search: createRequest(requestSearch, 'search', false),
    copy: createCrossRequest(requestCross, 'copy'),
    rename: createCrossRequest(requestCross, 'rename')
  };
};

/*
 * Creates a new VFS Express router
 */
let vfs_1 = core => {
  const router = express$1.Router();
  const methods = vfs$2(core);
  const middleware = createMiddleware(core);
  const {isAuthenticated} = core.make('osjs/express');
  const vfsGroups = core.config('auth.vfsGroups', []);
  const logEnabled = core.config('development');

  // Middleware first
  router.use(isAuthenticated(vfsGroups));
  router.use(middleware);

  // Then all VFS routes (needs implementation above)
  router.get('/capabilities', wrapper(methods.capabilities));
  router.get('/exists', wrapper(methods.exists));
  router.get('/stat', wrapper(methods.stat));
  router.get('/readdir', wrapper(methods.readdir));
  router.get('/readfile', wrapper(methods.readfile));
  router.post('/writefile', wrapper(methods.writefile));
  router.post('/rename', wrapper(methods.rename));
  router.post('/copy', wrapper(methods.copy));
  router.post('/mkdir', wrapper(methods.mkdir));
  router.post('/unlink', wrapper(methods.unlink));
  router.post('/touch', wrapper(methods.touch));
  router.post('/search', wrapper(methods.search));

  // Finally catch promise exceptions
  router.use((error, req, res, next) => {
    // TODO: Better error messages
    const code = typeof error.code === 'number'
      ? error.code
      : (errorCodes[error.code] || 400);

    if (logEnabled) {
      console.error(error);
    }

    res.status(code)
      .json({
        error: error.toString(),
        stack: logEnabled ? error.stack : undefined
      });
  });

  return {router, methods};
};



const {methodArguments} = vfs$3;
const systemAdapter = system;
const {v1: uuid} = require$$2$4;
const mime = require$$3$1;
const path$5 = require$$1$1;
const vfs$1 = vfs_1;
const {closeWatches: closeWatches$2} = core$2;
const consola$1 = require$$8;
const logger$1 = consola$1.withTag('Filesystem');

/**
 * @typedef {Object} Mountpoint
 * @property {string} [uuid]
 * @property {string} [root]
 * @property {object} [attributes]
 */

/**
 * TODO: typedef
 * @typedef {Object} FilesystemAdapter
 */

/**
 * Filesystem Service Adapter Option Map
 * @typedef {{name: FilesystemAdapter}} FilesystemAdapterMap
 */

/**
 * Filesystem Service Options
 * @typedef {Object} FilesystemOptions
 * @property {FilesystemAdapterMap} [adapters]
 */

/**
 * Filesystem Internal Call Options
 * @typedef {Object} FilesystemCallOptions
 * @property {string} method VFS Method name
 * @property {object} [user] User session data
 * @property {object} [session] Session data
 */

/**
 * OS.js Virtual Filesystem
 */
class Filesystem$2 {

  /**
   * Create new instance
   * @param {Core} core Core reference
   * @param {FilesystemOptions} [options] Instance options
   */
  constructor(core, options = {}) {
    /**
     * @type {Core}
     */
    this.core = core;

    /**
     * @type {Mountpoint[]}
     */
    this.mountpoints = [];

    /**
     * @type {FilesystemAdapterMap}
     */
    this.adapters = {};

    this.watches = [];

    this.router = null;

    this.methods = {};

    /**
     * @type {FilesystemOptions}
     */
    this.options = {
      adapters: {},
      ...options
    };
  }

  /**
   * Destroys instance
   * @return {Promise<undefined>}
   */
  async destroy() {
    const watches = this.watches.filter(({watch}) => {
      return watch && typeof watch.close === 'function';
    }).map(({watch}) => watch);

    await closeWatches$2(watches);

    this.watches = [];
  }

  /**
   * Initializes Filesystem
   * @return {Promise<boolean>}
   */
  async init() {
    const adapters = {
      system: systemAdapter,
      ...this.options.adapters
    };

    this.adapters = Object.keys(adapters).reduce((result, iter) => {
      return {
        [iter]: adapters[iter](this.core),
        ...result
      };
    }, {});

    // Routes
    const {router, methods} = vfs$1(this.core);
    this.router = router;
    this.methods = methods;

    // Mimes
    const {define} = this.core.config('mime', {define: {}, filenames: {}});
    mime.define(define, {force: true});

    // Mountpoints
    await Promise.all(this.core.config('vfs.mountpoints')
      .map(mount => this.mount(mount)));

    return true;
  }

  /**
   * Gets MIME
   * @param {string} filename Input filename or path
   * @return {string}
   */
  mime(filename) {
    const {filenames} = this.core.config('mime', {
      define: {},
      filenames: {}
    });

    return filenames[path$5.basename(filename)]
      ? filenames[path$5.basename(filename)]
      : mime.getType(filename) || 'application/octet-stream';
  }

  /**
   * Crates a VFS request
   * @param {Request|object} req HTTP Request object
   * @param {Response|object} [res] HTTP Response object
   * @return {Promise<*>}
   */
  request(name, req, res = {}) {
    return this.methods[name](req, res);
  }

  /**
   * Performs a VFS request with simulated HTTP request
   * @param {FilesystemCallOptions} options Request options
   * @param {*} ...args Arguments to pass to VFS method
   * @return {Promise<*>}
   */
  call(options, ...args) {
    const {method, user, session} = {
      user: {},
      session: null,
      ...options
    };

    const req = methodArguments[method]
      .reduce(({fields, files}, key, index) => {
        const arg = args[index];
        if (typeof key === 'function') {
          files = Object.assign(key(arg), files);
        } else {
          fields = {
            [key]: arg,
            ...fields
          };
        }

        return {fields, files};
      }, {fields: {}, files: {}});

    req.session = session ? session : {user};

    return this.request(method, req);
  }

  /**
   * Creates realpath VFS request
   * @param {string} filename The path
   * @param {AuthUserProfile} [user] User session object
   * @return {Promise<string>}
   */
  realpath(filename, user = {}) {
    return this.methods.realpath({
      session: {
        user: {
          groups: [],
          ...user
        }
      },
      fields: {
        path: filename
      }
    });
  }

  /**
   * Mounts given mountpoint
   * @param {Mountpoint} mount Mountpoint
   * @return {Mountpoint} the mountpoint
   */
  async mount(mount) {
    const mountpoint = {
      id: uuid(),
      root: `${mount.name}:/`,
      attributes: {},
      ...mount
    };

    this.mountpoints.push(mountpoint);

    logger$1.success('Mounted', mountpoint.name);

    await this.watch(mountpoint);

    return mountpoint;
  }

  /**
   * Unmounts given mountpoint
   * @param {Mountpoint} mount Mountpoint
   * @return {Promise<boolean>}
   */
  async unmount(mountpoint) {
    const found = this.watches.find(w => w.id === mountpoint.id);

    if (found && found.watch) {
      await found.watch.close();
    }

    const index = this.mountpoints.indexOf(mountpoint);

    if (index !== -1) {
      this.mountpoints.splice(index, 1);

      return true;
    }

    return false;
  }

  /**
   * Set up a watch for given mountpoint
   * @param {Mountpoint} mountpoint The mountpoint
   * @return {Promise<undefined>}
   */
  async watch(mountpoint) {
    if (
      !mountpoint.attributes.watch ||
      this.core.config('vfs.watch') === false ||
      !mountpoint.attributes.root
    ) {
      return;
    }

    const adapter = await (mountpoint.adapter
      ? this.adapters[mountpoint.adapter]
      : this.adapters.system);

    if (typeof adapter.watch === 'function') {
      await this._watch(mountpoint, adapter);
    }
  }

  /**
   * Internal method for setting up watch for given mountpoint adapter
   * @param {Mountpoint} mountpoint The mountpoint
   * @param {FilesystemAdapter} adapter The adapter
   * @return {Promise<undefined>}
   */
  async _watch(mountpoint, adapter) {
    const watch = await adapter.watch(mountpoint, (args, dir, type) => {
      const target = mountpoint.name + ':/' + dir;
      const keys = Object.keys(args);
      const filter = keys.length === 0
        ? () => true
        : ws => keys.every(k => ws._osjs_client[k] === args[k]);

      this.core.emit('osjs/vfs:watch:change', {
        mountpoint,
        target,
        type
      });

      this.core.broadcast('osjs/vfs:watch:change', [{
        path: target,
        type
      }, args], filter);
    });

    watch.on('error', error => logger$1.warn('Mountpoint watch error', error));

    this.watches.push({
      id: mountpoint.id,
      watch
    });

    logger$1.info('Watching mountpoint', mountpoint.name);
  }
}

let filesystem = Filesystem$2;



/**
 * Null Settings adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
let _null = (core, options) => ({
  init: async () => true,
  destroy: async () => true,
  save: async () => true,
  load: async () => ({})
});



const fs$2 = require$$0$1;
const path$4 = require$$1$1;

/**
 * FS Settings adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
let fs_1 = (core, options) => {
  const fsOptions = {
    system: false,
    path: 'home:/.osjs/settings.json',
    ...options || {}
  };

  const getRealFilename = (req) => fsOptions.system
    ? Promise.resolve(fsOptions.path)
    : core.make('osjs/vfs')
      .realpath(fsOptions.path, req.session.user);

  const before = req => getRealFilename(req)
    .then(filename => fs$2.ensureDir(path$4.dirname(filename))
      .then(() => filename));

  const save = req => before(req)
    .then(filename => fs$2.writeJson(filename, req.body))
    .then(() => true);

  const load = req => before(req)
    .then(filename => fs$2.readJson(filename))
    .catch(error => {
      core.logger.warn(error);
      return {};
    });

  return {save, load};
};



const nullAdapter = _null;
const fsAdapter = fs_1;

/**
 * TODO: typedef
 * @typedef {Object} SettingsAdapter
 */

/**
 * Settings Service Options
 * @typedef {Object} SettingsOptions
 * @property {SettingsAdapter|string} [adapter]
 */

/**
 * OS.js Settings Manager
 */
class Settings$2 {

  /**
   * Create new instance
   * @param {Core} core Core reference
   * @param {SettingsOptions} [options] Instance options
   */
  constructor(core, options = {}) {
    /**
     * @type {Core}
     */
    this.core = core;

    this.options = {
      adapter: nullAdapter,
      ...options
    };

    if (this.options.adapter === 'fs') {
      this.options.adapter = fsAdapter;
    }

    this.adapter = nullAdapter(core, this.options.config);

    try {
      this.adapter = this.options.adapter(core, this.options.config);
    } catch (e) {
      this.core.logger.warn(e);
    }
  }

  /**
   * Destroy instance
   */
  destroy() {
    if (this.adapter.destroy) {
      this.adapter.destroy();
    }
  }

  /**
   * Initializes adapter
   * @return {Promise<boolean>}
   */
  async init() {
    if (this.adapter.init) {
      return this.adapter.init();
    }

    return true;
  }

  /**
   * Sends save request to adapter
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @return {Promise<undefined>}
   */
  async save(req, res) {
    const result = await this.adapter.save(req, res);
    res.json(result);
  }

  /**
   * Sends load request to adapter
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @return {Promise<undefined>}
   */
  async load(req, res) {
    const result = await this.adapter.load(req, res);
    res.json(result);
  }
}


let settings$1 = Settings$2;



const path$3 = require$$1$1;
const chokidar$2 = require$$2$3;

/**
 * TODO: typedef
 * @typedef {Object} PackageMetadata
 */

/**
 * Package Options
 * @typedef {Object} PackageOptions
 * @property {string} filename
 * @property {PackageMetadata} metadata
 */

/**
 * OS.js Package Abstraction
 */
class Package$1 {

  /**
   * Create new instance
   * @param {Core} core Core reference
   * @param {PackageOptions} [options] Instance options
   */
  constructor(core, options = {}) {
    /**
     * @type {Core}
     */
    this.core = core;

    this.script = options.metadata.server
      ? path$3.resolve(path$3.dirname(options.filename), options.metadata.server)
      : null;

    /**
     * @type {string}
     */
    this.filename = options.filename;

    /**
     * @type {PackageMetadata}
     */
    this.metadata = options.metadata;

    this.handler = null;

    this.watcher = null;
  }

  /**
   * Destroys instance
   */
  async destroy() {
    this.action('destroy');

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Run method on package script
   * @param {string} method Method name
   * @param {*} [...args] Pass arguments
   * @return {boolean}
   */
  action(method, ...args) {
    try {
      if (this.handler && typeof this.handler[method] === 'function') {
        this.handler[method](...args);

        return true;
      }
    } catch (e) {
      this.core.logger.warn(e);
    }

    return false;
  }

  /**
   * Validates this package
   * @param {PackageMetadata[]} manifest Global manifest
   * @return {boolean}
   */
  validate(manifest) {
    return this.script &&
      this.metadata &&
      !!manifest.find(iter => iter.name === this.metadata.name);
  }

  /**
   * Initializes this package
   * @return {Promise<undefined>}
   */
  init() {
    const mod = commonjsRequire(this.script);
    const handler = typeof mod.default === 'function' ? mod.default : mod;

    this.handler = handler(this.core, this);

    if (typeof this.handler.init === 'function') {
      return this.handler.init();
    }

    return Promise.resolve();
  }

  /**
   * Starts server scripts
   * @return {Promise<undefined>}
   */
  start() {
    return this.action('start');
  }

  /**
   * Creates a watch in package dist
   * @param {Function} cb Callback function on watch changes
   * @return {string} Watched path
   */
  watch(cb) {
    const pub = this.core.config('public');
    const dist = path$3.join(pub, 'apps', this.metadata.name);

    this.watcher = chokidar$2.watch(dist);
    this.watcher.on('change', () => cb(this.metadata));

    return dist;
  }

  /**
   * Resolve an URL for resource
   * @param {string} path Input path
   * @return {string}
   */
  resource(path) {
    if (path.substr(0, 1) !== '/') {
      path = '/' + path;
    }

    return `/apps/${this.metadata.name}${path}`;
  }
}

let _package = Package$1;



const fs$1 = require$$0$1;
const fg = require$$1$4;
const path$2 = require$$1$1;
const Package = _package;
const consola = require$$8;
const logger = consola.withTag('Packages');

const relative = filename => filename.replace(process.cwd(), '');

const readOrDefault = filename => fs$1.existsSync(filename)
  ? fs$1.readJsonSync(filename)
  : [];

/**
 * Package Service Options
 * @typedef {Object} PackagesOptions
 * @property {string} [manifestFile] Manifest filename
 * @property {string} [discoveredFile] Discovery output file
 */

/**
 * OS.js Package Management
 */
class Packages$2 {

  /**
   * Create new instance
   * @param {Core} core Core reference
   * @param {PackagesOptions} [options] Instance options
   */
  constructor(core, options = {}) {
    /**
     * @type {Core}
     */
    this.core = core;

    /**
     * @type {Package[]}
     */
    this.packages = [];

    this.hotReloading = {};

    /**
     * @type {PackagesOptions}
     */
    this.options = {
      manifestFile: null,
      discoveredFile: null,
      ...options
    };
  }

  /**
   * Initializes packages
   */
  init() {
    this.core.on('osjs/application:socket:message', (ws, ...params) => {
      this.handleMessage(ws, params);
    });

    return this.load();
  }

  /**
   * Loads package manager
   * @return {Promise<boolean>}
   */
  load() {
    return this.createLoader()
      .then(packages => {
        this.packages = this.packages.concat(packages);

        return true;
      });
  }

  /**
   * Loads all packages
   * @return {Promise<Package[]>}
   */
  createLoader() {
    let result = [];
    const {discoveredFile, manifestFile} = this.options;
    const discovered = readOrDefault(discoveredFile);
    const manifest = readOrDefault(manifestFile);
    const sources = discovered.map(d => path$2.join(d, 'metadata.json'));

    logger.info('Using package discovery file', relative(discoveredFile));
    logger.info('Using package manifest file', relative(manifestFile));

    const stream = fg.stream(sources, {
      extension: false,
      brace: false,
      deep: 1,
      case: false
    });

    stream.on('error', error => logger.error(error));
    stream.on('data', filename => {
      result.push(this.loadPackage(filename, manifest));
    });

    return new Promise((resolve, reject) => {
      stream.once('end', () => {
        Promise.all(result)
          .then(result => result.filter(iter => !!iter.handler))
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * When a package dist has changed
   * @param {Package} pkg Package instance
   */
  onPackageChanged(pkg) {
    clearTimeout(this.hotReloading[pkg.metadata.name]);

    this.hotReloading[pkg.metadata.name] = setTimeout(() => {
      logger.debug('Sending reload signal for', pkg.metadata.name);
      this.core.broadcast('osjs/packages:package:changed', [pkg.metadata.name]);
    }, 500);
  }

  /**
   * Loads package data
   * @param {string} filename Filename
   * @param {PackageMetadata} manifest Manifest
   * @return {Promise<Package>}
   */
  loadPackage(filename, manifest) {
    const done = (pkg, error) => {
      if (error) {
        logger.warn(error);
      }

      return Promise.resolve(pkg);
    };

    return fs$1.readJson(filename)
      .then(metadata => {
        const pkg = new Package(this.core, {
          filename,
          metadata
        });

        return this.initializePackage(pkg, manifest, done);
      });
  }

  /**
   * Initializes a package
   * @return {Promise<Package>}
   */
  initializePackage(pkg, manifest, done) {
    if (pkg.validate(manifest)) {
      logger.info(`Loading ${relative(pkg.script)}`);

      try {
        if (this.core.configuration.development) {
          pkg.watch(() => {
            this.onPackageChanged(pkg);
          });
        }

        return pkg.init()
          .then(() => done(pkg))
          .catch(e => done(pkg, e));
      } catch (e) {
        return done(pkg, e);
      }
    }

    return done(pkg);
  }

  /**
   * Starts packages
   */
  start() {
    this.packages.forEach(pkg => pkg.start());
  }

  /**
   * Destroys packages
   * @return {Promise<undefined>}
   */
  async destroy() {
    await Promise.all(this.packages.map(pkg => pkg.destroy()));

    this.packages = [];
  }

  /**
   * Handles an incoming message and signals an application
   *
   * This will call the 'onmessage' event in your application server script
   *
   * @param {WebSocket} ws Websocket Connection client
   * @param {Array} params A list of incoming parameters
   */
  handleMessage(ws, params) {
    const {pid, name, args} = params[0];
    const found = this.packages.findIndex(({metadata}) => metadata.name === name);

    if (found !== -1) {
      const {handler} = this.packages[found];
      if (handler && typeof handler.onmessage === 'function') {
        const respond = (...respondParams) => ws.send(JSON.stringify({
          name: 'osjs/application:socket:message',
          params: [{
            pid,
            args: respondParams
          }]
        }));

        handler.onmessage(ws, respond, args);
      }
    }
  }
}

let packages$1 = Packages$2;



const path$1 = require$$1$1;
const express = require$$5;
const chokidar$1 = require$$2$3;
const bodyParser = require$$3$2;
const proxy = require$$4$2;
const nocache = require$$5$1;
const {ServiceProvider: ServiceProvider$4} = require$$0$2;
const {isAuthenticated, closeWatches: closeWatches$1} = core$2;

/**
 * OS.js Core Service Provider
 */
class CoreServiceProvider$1 extends ServiceProvider$4 {

  constructor(core, options) {
    super(core, options);

    this.watches = [];
  }

  async destroy() {
    await closeWatches$1(this.watches);
    super.destroy();
  }

  async init() {
    this.initService();
    this.initExtensions();
    this.initResourceRoutes();
    this.initSocketRoutes();
    this.initProxies();
  }

  start() {
    if (this.core.configuration.development) {
      this.initDeveloperTools();
    }
  }

  provides() {
    return [
      'osjs/express'
    ];
  }

  /**
   * Initializes the service APIs
   */
  initService() {
    const {app} = this.core;
    const {requireAllGroups} = this.core.configuration.auth;

    const middleware = {
      route: [],
      routeAuthenticated: []
    };

    this.core.singleton('osjs/express', () => ({
      isAuthenticated,

      call: (method, ...args) => app[method](...args),
      use: (arg) => app.use(arg),

      websocket: (p, cb) => app.ws(p, cb),

      middleware: (authentication, cb) => {
        middleware[authentication ? 'routeAuthenticated' : 'route'].push(cb);
      },

      route: (method, uri, cb) => app[method.toLowerCase()](uri, [
        ...middleware.route
      ], cb),

      routeAuthenticated: (method, uri, cb, groups = [], strict = requireAllGroups) =>
        app[method.toLowerCase()](uri, [
          ...middleware.routeAuthenticated,
          isAuthenticated(groups, strict)
        ], cb),

      router: () => {
        const router = express.Router();
        router.use(...middleware.route);
        return router;
      },

      routerAuthenticated: (groups = [], strict = requireAllGroups) => {
        const router = express.Router();
        router.use(...middleware.routeAuthenticated);
        router.use(isAuthenticated(groups, strict));
        return router;
      }
    }));
  }

  /**
   * Initializes Express extensions
   */
  initExtensions() {
    const {app, session, configuration} = this.core;
    const limit = configuration.express.maxBodySize;

    if (configuration.development) {
      app.use(nocache());
    } else {
      app.disable('x-powered-by');
    }

    // Handle sessions
    app.use(session);

    // Handle bodies
    app.use(bodyParser.urlencoded({
      extended: false,
      limit
    }));

    app.use(bodyParser.json({
      limit
    }));

    app.use(bodyParser.raw({
      limit
    }));
  }

  /**
   * Initializes Express base routes, etc
   */
  initResourceRoutes() {
    const {app, configuration} = this.core;
    const indexFile = path$1.join(configuration.public, configuration.index);

    app.get('/', (req, res) => res.sendFile(indexFile));
    app.use('/', express.static(configuration.public));

    // Internal ping
    app.get('/ping', (req, res) => {
      this.core.emit('osjs/core:ping', req);

      try {
        req.session.touch();
      } catch (e) {
        this.core.logger.warn(e);
      }

      res.status(200).send('ok');
    });
  }

  /**
   * Initializes Socket routes
   */
  initSocketRoutes() {
    const {app} = this.core;

    app.ws('/', (ws, req) => {
      ws.upgradeReq = ws.upgradeReq || req;
      ws._osjs_client = {...req.session.user};

      const interval = this.core.config('ws.ping', 0);

      const pingInterval = interval ? setInterval(() => {
        ws.send(JSON.stringify({
          name: 'osjs/core:ping'
        }));
      }, interval) : undefined;

      ws.on('close', () => {
        clearInterval(pingInterval);
      });

      ws.on('message', msg => {
        try {
          const {name, params} = JSON.parse(msg);

          if (typeof name === 'string' && params instanceof Array) {
            // We don't wanna allow any internal signals from the outside!
            if (name.match(/^osjs/) && name !== 'osjs/application:socket:message') {
              return;
            }

            this.core.emit(name, ws, ...params);
          }
        } catch (e) {
          this.core.logger.warn(e);
        }
      });

      ws.send(JSON.stringify({
        name: 'osjs/core:connected',
        params: [{
          cookie: {
            maxAge: this.core.config('session.options.cookie.maxAge')
          }
        }]
      }));
    });
  }

  /**
   * Initializes Express proxies
   */
  initProxies() {
    const {app, configuration} = this.core;
    const proxies = (configuration.proxy || []).map(item => ({
      source: null,
      destination: null,
      options: {},
      ...item
    })).filter(item => item.source && item.destination);

    proxies.forEach(item => {
      this.core.logger.info(`Proxying ${item.source} -> ${item.destination}`);
      app.use(item.source, proxy(item.destination, item.options));
    });
  }

  /**
   * Initializes some developer features
   */
  initDeveloperTools() {
    try {
      const watchdir = path$1.resolve(this.core.configuration.public);
      const watcher = chokidar$1.watch(watchdir);

      watcher.on('change', filename => {
        // NOTE: 'ignored' does not work as expected with callback
        // ignored: str => str.match(/\.(js|css)$/) === null
        // for unknown reasons
        if (!filename.match(/\.(js|css)$/)) {
          return;
        }

        const relative = filename.replace(watchdir, '');
        this.core.broadcast('osjs/dist:changed', [relative]);
      });

      this.watches.push(watcher);
    } catch (e) {
      this.core.logger.warn(e);
    }
  }
}

let core = CoreServiceProvider$1;



const fs = require$$0$1;
const path = require$$1$1;
const chokidar = require$$2$3;
const {ServiceProvider: ServiceProvider$3} = require$$0$2;
const Packages$1 = packages$1;
const {closeWatches} = core$2;

/**
 * OS.js Package Service Provider
 */
class PackageServiceProvider$1 extends ServiceProvider$3 {
  constructor(core) {
    super(core);

    const {configuration} = this.core;
    const manifestFile = path.join(configuration.public, configuration.packages.metadata);
    const discoveredFile = path.resolve(configuration.root, configuration.packages.discovery);

    this.watches = [];
    this.packages = new Packages$1(core, {
      manifestFile,
      discoveredFile
    });
  }

  provides() {
    return [
      'osjs/packages'
    ];
  }

  init() {
    this.core.singleton('osjs/packages', () => this.packages);

    return this.packages.init();
  }

  start() {
    this.packages.start();

    if (this.core.configuration.development) {
      this.initDeveloperTools();
    }
  }

  async destroy() {
    await closeWatches(this.watches);
    await this.packages.destroy();
    super.destroy();
  }

  /**
   * Initializes some developer features
   */
  initDeveloperTools() {
    const {manifestFile} = this.packages.options;

    if (fs.existsSync(manifestFile)) {
      const watcher = chokidar.watch(manifestFile);
      watcher.on('change', () => {
        this.core.broadcast('osjs/packages:metadata:changed');
      });
      this.watches.push(watcher);
    }
  }
}

let packages = PackageServiceProvider$1;



const {ServiceProvider: ServiceProvider$2} = require$$0$2;
const Filesystem$1 = filesystem;

/**
 * OS.js Virtual Filesystem Service Provider
 */
class VFSServiceProvider$1 extends ServiceProvider$2 {

  constructor(core, options = {}) {
    super(core, options);

    this.filesystem = new Filesystem$1(core, options);
  }

  async destroy() {
    await this.filesystem.destroy();
    super.destroy();
  }

  depends() {
    return [
      'osjs/express'
    ];
  }

  provides() {
    return [
      'osjs/fs',
      'osjs/vfs'
    ];
  }

  async init() {
    const filesystem = this.filesystem;

    await filesystem.init();

    this.core.singleton('osjs/fs', () => this.filesystem);

    this.core.singleton('osjs/vfs', () => ({
      realpath: (...args) => this.filesystem.realpath(...args),
      request: (...args) => this.filesystem.request(...args),
      call: (...args) => this.filesystem.call(...args),
      mime: (...args) => this.filesystem.mime(...args),

      get adapters() {
        return filesystem.adapters;
      },

      get mountpoints() {
        return filesystem.mountpoints;
      }
    }));

    this.core.app.use('/vfs', filesystem.router);
  }
}

let vfs = VFSServiceProvider$1;



const {ServiceProvider: ServiceProvider$1} = require$$0$2;
const Auth$1 = auth$1;

/**
 * OS.js Auth Service Provider
 */
class AuthServiceProvider$1 extends ServiceProvider$1 {

  constructor(core, options) {
    super(core, options);

    this.auth = new Auth$1(core, options);
  }

  destroy() {
    this.auth.destroy();

    super.destroy();
  }

  async init() {
    const {route, routeAuthenticated} = this.core.make('osjs/express');

    route('post', '/register', (req, res) => this.auth.register(req, res));
    route('post', '/login', (req, res) => this.auth.login(req, res));
    routeAuthenticated('post', '/logout', (req, res) => this.auth.logout(req, res));

    await this.auth.init();
  }
}

let auth = AuthServiceProvider$1;



const Settings$1 = settings$1;
const {ServiceProvider} = require$$0$2;

/**
 * OS.js Settings Service Provider
 */
class SettingsServiceProvider$1 extends ServiceProvider {

  constructor(core, options) {
    super(core, options);

    this.settings = new Settings$1(core, options);
  }

  destroy() {
    super.destroy();
    this.settings.destroy();
  }

  async init() {
    this.core.make('osjs/express')
      .routeAuthenticated('post', '/settings', (req, res) => this.settings.save(req, res));

    this.core.make('osjs/express')
      .routeAuthenticated('get', '/settings', (req, res) => this.settings.load(req, res));

    return this.settings.init();
  }
}

let settings = SettingsServiceProvider$1;



const Core = core$1;
const Auth = auth$1;
const Filesystem = filesystem;
const Settings = settings$1;
const Packages = packages$1;
const CoreServiceProvider = core;
const PackageServiceProvider = packages;
const VFSServiceProvider = vfs;
const AuthServiceProvider = auth;
const SettingsServiceProvider = settings;

export {
  Core,
  Auth,
  Filesystem,
  Settings,
  Packages,
  CoreServiceProvider,
  PackageServiceProvider,
  VFSServiceProvider,
  AuthServiceProvider,
  SettingsServiceProvider
};
