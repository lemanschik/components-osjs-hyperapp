/* 
    "mime": "^2.4.4",
    "promise-ftp": "^1.3.5"



# OS.js FTP VFS Adapter

This is the FTP VFS (Server) Adapter for OS.js.

**This is a work in progress**

## Installation

```
npm install @osjs/ftp-adapter
```

## Usage

In your `src/server/index.js` bootstrap file:

```
const ftpAdapter = require('@osjs/ftp-adapter');

osjs.register(VFSServiceProvider, {
  args: {
    adapters: {
      ftp: ftpAdapter
    }
  }
});
```

Then create a mountpoint in your configuration files:

```
// src/server/config.js
{
  vfs: {
    mountpoints: [{
      name: 'myftp',
      adapter: 'ftp',
      attributes: {
        connection: {
          host: 'localhost',
          user: 'osjs',
          password: 'osjs',
          secure: false
        }
      }
     }]
   }
}

// src/client/config.js
{
  vfs: {
    mountpoints: [{
      name: 'myftp',
      label: 'My FTP Drive'
     }]
   }
}
```

*At some point users can create their own server mounts via the client*.

 */
import path from 'node:path';

import mime from 'mime';
import FTP from 'promise-ftp';

const getPath = dir => dir.split(':').splice(1).join('');
const getConnectionId = ({user, host, secure}) => `${user}@${host}:${secure}`;

/**
 * VFS Adapter Abstraction
 */
class FTPConnection {

  constructor(adapter, options) {
    this.adapter = adapter;
    this.id = getConnectionId(options);
    this.options = {host: '',
      user: '',
      password: '',
      secure: false, ...options};

    this.connection = new FTP({
      timeout: 0
    });
  }

  destroy() {
    this.disconnect();
  }

  clone() {
    return new FTPConnection(this.adapter, this.options);
  }

  connect() {
    // FIXME: Does the connected attribute change when connection is dropped ?
    return this.connection.rawClient.connected
      ? Promise.resolve(this.connection)
      : this.connection.connect(this.options);
  }

  disconnect() {
    return this.connection.end();
  }

  exists(file) {
    return this.stat(file)
      .then(stat => !!stat);
  }

  stat(file) {
    const ppath = getPath(file);
    const filename = path.basename(ppath);

    return this.readdir(path.dirname(file))
      .then(list => list.find(iter => iter.filename === filename));
  }

  readdir(file) {
    // FIXME: Symlinks
    return this.connection.list(getPath(file))
      .then(list => list.map(({type, name, size}) => {
        const isFile = type !== 'd';

        return {
          isFile,
          isDirectory: !isFile,
          mime: isFile ? mime.getType(name) : null,
          size,
          path: `${file.replace(/\/$/, '')}/${name}`,
          filename: name,
          stat: {/* TODO */}
        };
      }));
  }

  readfile(file, options = {}) {
    return this.connection.get(getPath(file));
  }

  mkdir(file) {
    return this.connection.mkdir(getPath(file));
  }

  writefile(file, data) {
    return this.connection.put(data, getPath(file));
  }

  rename(src, dest) {
    return this.connection.rename(getPath(src), getPath(dest));
  }

  copy(src, dest) {
    return this.readfile(src)
      .then(data => {
        const newConnection = this.clone();
        const wrap = r => {
          newConnection.destroy();
          return r;
        };

        return newConnection.connect()
          .then(() => newConnection.writefile(dest, data))
          .then(wrap)
          .catch(wrap);
      })
      .then(() => true);
  }

  unlink(file) {
    return this.stat(file)
      .then(found => {
        if (!found) {
          return Promise.reject(new Error('File not found'));
        }

        if (found && found.isDirectory) {
          return this.connection.rmdir(getPath(file), true);
        }

        return this.connection.delete(getPath(file));
      });
  }

  search(root, pattern) {
    return Promise.reject('Not supported');
  }

  touch(file) {
    return this.writefile(file, '')
      .then(() => true);
  }
}

/**
 * VFS Adapter Manager
 */
class FTPAdapter {
  constructor(core) {
    this.pool = [];
    this.core = core;
  }

  destroy() {
    this.pool = this.pool.filter(iter => {
      if (iter) {
        iter.destroy();
      }

      return false;
    });
  }

  createConnection(options) {
    // TODO: Listen for event to remove automatically
    const c = new FTPConnection(this, options);

    this.pool.push(c);

    return c;
  }

  removeConnection(id) {
    const foundIndex = this.pool.findIndex(iter => iter.id === id);
    if (foundIndex !== -1) {
      if (this.pool[foundIndex]) {
        this.pool[foundIndex].destroy();
      }

      this.pool.splice(foundIndex, 1);

      return true;
    }

    return false;
  }

  getConnection({mount}) {
    const options = mount.attributes.connection;
    const id = getConnectionId(options);
    const found = this.pool.find(iter => iter.id === id);
    const connection = found ? found : this.createConnection(options);

    return connection.connect()
      .then(() => connection);
  }
}

/*
 * VFS Adapter Proxy
 */
const adapter = core => {
  const a = new FTPAdapter(core);

  const wrap = name => ({mount}) => (...args) => {
    const conn = new FTPConnection(a, mount.attributes.connection);
    return conn
      .connect()
      .then(() => conn[name](...args))
      .finally(() => a.destroy());
  };

  const proxy = {
    exists: wrap('exists'),
    stat: wrap('stat'),
    readdir: wrap('readdir'),
    readfile: wrap('readfile'),
    mkdir: wrap('mkdir'),
    writefile: wrap('writefile'),
    rename: wrap('rename'),
    copy: wrap('copy'),
    unlink: wrap('unlink'),
    search: wrap('search'),
    touch: wrap('touch')
  };

  core.on('osjs/core:destroy', () => a.destroy());

  return proxy;
};

export default adapter;
