
const fs = require('fs-extra');
const globby = require('globby');
const path = require('node:path');
const {spawn} = require('node:child_process');
const commander = require('commander');

const npmPackages = async (root) => {
  const globs = await globby(root.replace(/\\/g, '/') + '/**/package.json', {deep: 3});
  const metafilename = dir => path.resolve(dir, 'metadata.json');

  const promises = globs.map(filename => fs.readJson(filename)
    .then(json => ({filename: path.dirname(filename), json})));

  const results = await Promise.all(promises);

  const packages = results.filter(
    ({json}) => !!json.osjs && json.osjs.type === 'package'
  );

  const list = await Promise.all(packages.map(
    ({filename, json}) => fs.readJson(metafilename(filename))
      .then(meta => ({meta, filename, json}))
      .catch(error => console.warn(error))
  ));

  return list.filter(res => !!res);
};

const spawnAsync = (cmd, args, options) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, {stdio: ['pipe', process.stdout, process.stderr], ...options || {}});
  child.on('close', code => code ? reject(code) : resolve(true));
});

const loadTasks = async (defaults, includes, options) => {
  const tasks = {...defaults};
  const promises = includes.map(fn => fn(options));
  const results = await Promise.all(promises);

  return results.reduce((list, iter) => {
    return {...list, ...iter};
  }, tasks);
};

const createOptions = options => ({
  production: !!(process.env.NODE_ENV || 'development').match(/^prod/),
  cli: path.resolve(options.root, 'src/cli'),
  npm: path.resolve(options.root, 'package.json'),
  packages: path.resolve(options.root, 'packages.json'),
  config: {
    tasks: [],
    discover: [],
    disabled: []
  },
  dist: () => {
    const root = commander.dist
      ? path.resolve(commander.dist)
      : path.resolve(options.root, 'dist');

    return {
      root,
      themes: path.resolve(root, 'themes'),
      sounds: path.resolve(root, 'sounds'),
      icons: path.resolve(root, 'icons'),
      packages: path.resolve(root, 'apps'),
      metadata: path.resolve(root, 'metadata.json')
    };
  },
  ...options
});

const resolveOptions = (options, include) => {
  const newOptions = {...options};

  const config = {
    discover: [
      path.resolve(newOptions.root, 'node_modules')
    ],
    ...newOptions.config,
    ...include
  };

  newOptions.config = config;
  newOptions.config.discover = [
    path.resolve(newOptions.root, 'node_modules'),
    ...newOptions.config.discover
  ].map(d => path.resolve(d));

  return newOptions;
};

module.exports = {
  resolveOptions,
  createOptions,
  npmPackages,
  spawnAsync,
  loadTasks
};
