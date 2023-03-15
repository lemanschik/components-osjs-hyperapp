import merge from 'deepmerge';
import { EventEmitter } from './eventemitter/osjs-eventemitter.js';
import * as mediaQuery from 'css-mediaquery';
import { CoreBase, ServiceProvider } from './common/osjs-common.js';
import dateformat from 'dateformat';
import { app, h } from './hyperapp.js';
import Cookies from 'js-cookie';
import simplejsonconf from 'simplejsonconf';

// Example
/*
import {
  Core,
  CoreServiceProvider,
  DesktopServiceProvider,
  VFSServiceProvider,
  NotificationServiceProvider,
  SettingsServiceProvider,
  AuthServiceProvider
} from '@osjs/client';

import {PanelServiceProvider} from '@osjs/panels';
import {GUIServiceProvider} from '@osjs/gui';
import {DialogServiceProvider} from '@osjs/dialogs';

import './index.scss';

const init = () => {
  const osjs = new Core({
  auth: {
    login: {
      username: 'demo',
      password: 'demo'
    }
  }
}, {});

  // Register your service providers
  osjs.register(CoreServiceProvider);
  osjs.register(DesktopServiceProvider);
  osjs.register(VFSServiceProvider);
  osjs.register(NotificationServiceProvider);
  osjs.register(SettingsServiceProvider, {before: true});
  osjs.register(AuthServiceProvider, {before: true});
  osjs.register(PanelServiceProvider);
  osjs.register(DialogServiceProvider);
  osjs.register(GUIServiceProvider);

  osjs.boot();
};

window.addEventListener('DOMContentLoaded', () => init());

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <!--
    OS.js - Copyright (c) 2011-2020
    Anders Evenrud (andersevenrud@gmail.com)
    https://github.com/os-js/
    -->
    <meta name="google" content="notranslate" />
    <meta name="description" content="OS.js - JavaScript Cloud/Web Desktop Platform" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
  </body>
</html>


@import "~typeface-roboto/index.css";
@import "~@osjs/client/dist/main.css";
@import "~@osjs/gui/dist/main.css";
@import "~@osjs/dialogs/dist/main.css";
@import "~@osjs/panels/dist/main.css";

body,
html {
  width: 100%;
  height: 100%;
}
*/


// "@osjs/common": "^3.0.12",
// "@osjs/event-emitter": "^1.0.10",
// "css-mediaquery": "^0.1.2",
// "dateformat": "^3.0.3",
// "deepmerge": "^4.2.2",
// "hyperapp": "^1.2.10",
// "js-cookie": "^2.2.1",
// "simplejsonconf": "^2.0.7"

import { defaultIcon, defaultWallpaper } from './theme.js';

const methods$1 = ['debug', 'log', 'info', 'warn', 'error'];
let middleware = [];

const reduce = (name, input) => middleware
  .reduce((current, m) => m(name, ...current), input);

const bind = (fn, thisArg) =>
  typeof thisArg[fn].bind === 'function'
    ? thisArg[fn].bind(thisArg)
    : Function.prototype.bind.apply(thisArg[fn], thisArg);

const bindMethod = fn => {
  const log = bind(fn, console);
  if (middleware.length > 0) {
    return (...args) => log(...reduce(fn, args));
  }

  return log;
};

const assignMethods = (thisArg) => methods$1
  .forEach(m => thisArg[m] = bindMethod(m));

const instance = {
  addMiddleware: m => {
    middleware.push(m);
    assignMethods(instance);
  },
  clearMiddleware: () => {
    middleware = [];
    assignMethods(instance);
  }
};

assignMethods(instance);


const CASCADE_DISTANCE = 10;
const MINIMUM_WIDTH = 100;
const MINIMUM_HEIGHT = 100;
const ONTOP_ZINDEX = 8388635;
const BOTTOM_ZINDEX = 10;

/*
 * Creates window attributes from an object
 */
const createAttributes$1 = attrs => ({
  classNames: [],
  modal: false,
  ontop: false,
  gravity: false,
  moveable: true,
  resizable: true,
  focusable: true,
  maximizable: true,
  minimizable: true,
  sessionable: true,
  closeable: true,
  header: true,
  controls: true,
  visibility: 'global',
  shadowDOM: false,
  clamp: true,
  droppable: true,
  mediaQueries: {
    small: 'screen and (max-width: 640px)',
    medium: 'screen and (min-width: 640px) and (max-width: 1024px)',
    big: 'screen and (min-width: 1024px)'
  },
  minDimension: {
    width: MINIMUM_WIDTH,
    height: MINIMUM_HEIGHT
  },
  maxDimension: {
    width: -1,
    height: -1
  },
  ...attrs
});

/*
 * Creates window state from an object
 */
const createState = (state, options, attrs) => ({
  title: options.title || options.id,
  icon: options.icon || defaultIcon,
  media: null,
  moving: false,
  resizing: false,
  loading: false,
  focused: false,
  maximized: false,
  minimized: false,
  zIndex: 1,
  styles: {},
  position: {
    left: null,
    top: null,
    ...options.position
  },
  dimension: {
    width: Math.max(attrs.minDimension.width, MINIMUM_WIDTH),
    height: Math.max(attrs.minDimension.height, MINIMUM_HEIGHT),
    ...options.dimension
  },
  ...state
});

/**
 * Creates data attributes for window DOM
 * @param {string} id
 * @param {WindowState} state
 * @param {WindowAttributes} attributes
 * @return {object}
 */
const createDOMAttributes = (id, state, attributes) => ({
  id: id,
  media: state.media,
  moving: state.moving,
  resizing: state.resizing,
  loading: state.loading,
  focused: state.focused,
  maximized: state.maximized,
  minimized: state.minimized,
  modal: attributes.modal,
  ontop: attributes.ontop,
  resizable: attributes.resizable,
  moveable: attributes.moveable,
  maximizable: attributes.maximizable,
  minimizable: attributes.minimizable
});

/**
 * Creates styles for window DOM
 * @param {WindowState} state
 * @param {WindowAttributes} attributes
 * @return {object}
 */
const createDOMStyles = (
  {
    zIndex,
    styles,
    position: {
      top,
      left
    },
    dimension: {
      width,
      height
    }
  },
  {
    ontop
  }
) => ({
  top: String(top) + 'px',
  left: String(left) + 'px',
  height: String(height) + 'px',
  width: String(width) + 'px',
  zIndex: BOTTOM_ZINDEX + (ontop ? ONTOP_ZINDEX : 0) + zIndex,
  ...styles
});

/*
 * Clamps position to viewport
 */
const clampPosition = (rect, {dimension, position}) => {
  const maxLeft = rect.width - dimension.width;
  const maxTop = rect.height - dimension.height + rect.top;

  // TODO: Make these an argument ?!
  const minLeft = 0;
  const minTop = 0;

  return {
    left: Math.max(minLeft, Math.min(maxLeft, position.left)),
    top: Math.max(minTop, Math.max(rect.top, Math.min(maxTop, position.top)))
  };
};

/*
 * Window rendering callback function
 */
const renderCallback = (win, callback) => {
  if (typeof callback === 'function') {
    if (win.attributes.shadowDOM) {
      try {
        const mode = typeof win.attributes.shadowDOM === 'string'
          ? win.attributes.shadowDOM
          : 'open';

        const shadow = win.$content.attachShadow({mode});

        callback(shadow, win);

        return;
      } catch (e) {
        instance.warn('Shadow DOM not supported?', e);
      }
    }

    callback(win.$content, win);
  }
};

/*
 * Gets new position based on "gravity"
 */
const positionFromGravity = (win, rect, gravity) => {
  let {left, top} = win.state.position;

  if (gravity === 'center') {
    left = (rect.width / 2) - (win.state.dimension.width / 2);
    top = (rect.height / 2) - (win.state.dimension.height / 2);
  } else if (gravity) {
    let hasVertical =  gravity.match(/top|bottom/);
    let hasHorizontal = gravity.match(/left|rigth/);

    if (gravity.match(/top/)) {
      top = rect.top;
    } else if (gravity.match(/bottom/)) {
      top = rect.height - (win.state.dimension.height) + rect.top;
    }

    if (gravity.match(/left/)) {
      left = rect.left;
    } else if (gravity.match(/right/)) {
      left = rect.width - (win.state.dimension.width);
    }

    if (!hasVertical && gravity.match(/center/)) {
      top = (rect.height / 2) - (win.state.dimension.height / 2);
    } else if (!hasHorizontal && gravity.match(/center/)) {
      left = (rect.width / 2) - (win.state.dimension.width / 2);
    }
  }

  return {left, top};
};

/*
 * Gets new dimension based on container
 */
const dimensionFromElement = (win, rect, container) => {
  const innerBox = (container.parentNode.classList.contains('osjs-gui')
    ? container.parentNode
    : container).getBoundingClientRect();

  const outerBox = win.$content.getBoundingClientRect();
  const diffY = Math.ceil(outerBox.height - innerBox.height);
  const diffX = Math.ceil(outerBox.width - innerBox.width);
  const topHeight = win.$header.offsetHeight;

  const {left, top} = win.state.position;
  const min = win.attributes.minDimension;
  const max = win.attributes.maxDimension;

  let width = Math.max(container.offsetWidth + diffX, min.width);
  let height = Math.max(container.offsetHeight + diffY + topHeight, min.height);

  if (max.width > 0) {
    width = Math.min(width, max.width);
  }

  if (max.height > 0) {
    height = Math.min(height, max.height);
  }

  width = Math.max(width, container.offsetWidth);
  height = Math.max(height, container.offsetHeight);

  if (rect) {
    width = Math.min(width, rect.width - left);
    height = Math.min(height, rect.height - top);
  }

  return {width, height};
};

/*
 * Transforms vector values (ex float to integer)
 */
const transformVectors = (rect, {width, height}, {top, left}) => {
  const transform = (val, attr) => {
    if (!isNaN(val)) {
      return val > 1 && Number.isInteger(val)
        ? val
        : Math.round(rect[attr] * parseFloat(val));
    }

    return val;
  };

  return {
    dimension: {
      width: transform(width, 'width'),
      height: transform(height, 'height')
    },
    position: {
      top: transform(top, 'height'),
      left: transform(left, 'width')
    }
  };
};

/*
 * Creates a clamper for resize/move
 */
const clamper = win => {
  const {maxDimension, minDimension} = win.attributes;
  const {position, dimension} = win.state;

  const maxPosition = {
    left: position.left + dimension.width - minDimension.width,
    top: position.top + dimension.height - minDimension.height
  };

  const clamp = (min, max, current) => {
    const value = min === -1 ? current : Math.max(min, current);
    return max === -1 ? value : Math.min(max, value);
  };

  return (width, height, top, left) => ({
    width: clamp(minDimension.width, maxDimension.width, width),
    height: clamp(minDimension.height, maxDimension.height, height),
    top: clamp(-1, maxPosition.top, top),
    left: clamp(-1, maxPosition.left, left)
  });
};

/*
 * Creates a resize handler
 */
const resizer = (win, handle) => {
  const clamp = clamper(win);
  const {position, dimension} = win.state;
  const directions = handle.getAttribute('data-direction').split('');
  const going = dir => directions.indexOf(dir) !== -1;
  const xDir = going('e') ? 1 : (going('w') ? -1 : 0);
  const yDir = going('s') ? 1 : (going('n') ? -1 : 0);

  return (diffX, diffY) => {
    const width = dimension.width + (diffX * xDir);
    const height = dimension.height + (diffY * yDir);
    const top = yDir === -1 ? position.top + diffY : position.top;
    const left = xDir === -1 ? position.left + diffX : position.left;

    return clamp(width, height, top, left);
  };
};

/*
 * Creates a movement handler
 */
const mover = (win, rect) => {
  const {position} = win.state;

  return (diffX, diffY) => {
    const top = Math.max(position.top + diffY, rect.top);
    const left = position.left + diffX;

    return {top, left};
  };
};

/*
 * Calculates a new initial position for window
 */
const getCascadePosition = (win, rect, pos) => {
  const startX = CASCADE_DISTANCE + rect.left;
  const startY = CASCADE_DISTANCE + rect.top;
  const distance = CASCADE_DISTANCE;
  const wrap = CASCADE_DISTANCE * 2;

  const newX = startX + ((win.wid % wrap) * distance);
  const newY = startY + ((win.wid % wrap) * distance);
  const position = (key, value) => typeof pos[key] === 'number' && Number.isInteger(pos[key])
    ? Math.max(rect[key], pos[key])
    : value;

  return {top: position('top', newY), left: position('left', newX)};
};

const getScreenOrientation = screen => screen && screen.orientation
  ? screen.orientation.type
  : window.matchMedia('(orientation: portrait)') ? 'portrait' : 'landscape';

/*
 * Gets a media query name from a map
 */
const getMediaQueryName = (win) => Object.keys(win.attributes.mediaQueries)
  .filter(name => mediaQuery.match(win.attributes.mediaQueries[name], {
    type: 'screen',
    orientation: getScreenOrientation(window.screen),
    width: win.$element.offsetWidth || win.state.dimension.width,
    height: win.$element.offsetHeight || win.state.dimension.height
  }))
  .pop();

/**
 * Loads [certain] window options from configuration
 */
const loadOptionsFromConfig = (config, appName, windowId) => {
  const matchStringOrRegex = (str, matcher) => matcher instanceof RegExp
    ? !!str.match(matcher)
    : str === matcher;

  const found = config.find(({application, window}) => {
    if (!application && !window) {
      return false;
    } else if (application && !matchStringOrRegex(appName, application)) {
      return false;
    } else if (window && !matchStringOrRegex(windowId || '', window)) {
      return false;
    }

    return true;
  });

  const foundOptions = found && found.options ? found.options : {};
  const allowedProperties = ['position', 'dimension', 'attributes'];

  return allowedProperties.reduce((obj, key) => (foundOptions[key]
    ? {...obj, [key]: foundOptions[key]}
    : obj),
  {});
};


const eventNames = ['open', 'close', 'message', 'error'];

/**
 * Websocket options
 * @typedef {Object} WebsocketOptions
 * @property {boolean} [reconnect=true] Enable reconnection
 * @property {number} [interval=1000] Reconnect interval
 * @property {boolean} [open=true] Immediately open socket after creation
 */

/**
 * Application Socket
 *
 * This is just an abstraction above the standard browser provided `WebSocket` class.
 * Since this class implements the EventHandler, use the `.on('event')` pattern instead of `.onevent`.
 */
class Websocket extends EventEmitter {

  /**
   * Create a new Websocket
   * @param {string} name Instance name
   * @param {string} uri Connection URI
   * @param {WebsocketOptions} [options={}] Websocket options
   */
  constructor(name, uri, options = {}) {
    instance.debug('Websocket::constructor()', name, uri);

    super('Websocket@' + name);

    /**
     * Socket URI
     * @type {string}
     * @readonly
     */
    this.uri = uri;

    /**
     * If socket is closed
     * @type {boolean}
     */
    this.closed = false;

    /**
     * If socket is connected
     * @type {boolean}
     */
    this.connected = false;

    /**
     * If socket is connecting
     * @type {boolean}
     */
    this.connecting = false;

    /**
     * If socket is reconnecting
     * @type {boolean}
     */
    this.reconnecting = false;

    /**
     * If socket failed to connect
     * @type {boolean}
     */
    this.connectfailed = false;

    /**
     * Options
     * @type {WebsocketOptions}
     * @readonly
     */
    this.options = {
      reconnect: true,
      interval: 1000,
      open: true,
      ...options
    };

    /**
     * The Websocket
     * @type {WebSocket}
     */
    this.connection = null;

    this._attachEvents();

    if (this.options.open) {
      this.open();
    }
  }

  /**
   * Destroys the current connection
   * @return {void}
   * @private
   */
  _destroyConnection() {
    if (!this.connection) {
      return;
    }

    eventNames.forEach(name => {
      this.connection[`on${name}`] = () => {};
    });

    this.reconnecting = clearInterval(this.reconnecting);
    this.connection = null;
  }

  /**
   * Attaches internal events
   * @private
   */
  _attachEvents() {
    this.on('open', ev => {
      const reconnected = !!this.reconnecting;

      this.connected = true;
      this.reconnecting = false;
      this.connectfailed = false;
      this.reconnecting = clearInterval(this.reconnecting);

      this.emit('connected', ev, reconnected);
    });

    this.on('close', ev => {
      if (!this.connected && !this.connectfailed) {
        this.emit('failed', ev);

        this.connectfailed = true;
      }

      clearInterval(this.reconnecting);

      this._destroyConnection();

      this.connected = false;

      if (this.options.reconnect) {
        this.reconnecting = setInterval(() => {
          if (!this.closed) {
            this.open();
          }
        }, this.options.interval);
      }

      this.emit('disconnected', ev, this.closed);
    });
  }

  /**
   * Opens the connection
   * @param {boolean} [reconnect=false] Force reconnection
   */
  open(reconnect = false) {
    if (this.connection && !reconnect) {
      return;
    }

    this._destroyConnection();

    this.reconnecting = clearInterval(this.reconnecting);
    this.connection = new WebSocket(this.uri);
    this.closed = false;

    eventNames.forEach(name => {
      this.connection[`on${name}`] = (...args) => this.emit(name, ...args);
    });
  }

  /**
   * Wrapper for sending data
   */
  send(...args) {
    return this.connection.send(...args);
  }

  /**
   * Wrapper for closing
   */
  close(...args) {
    this.closed = true;

    return this.connection.close(...args);
  }

}


/**
 * @callback DraggableEvent
 * @param {MouseEvent} ev
 */

/**
 * @callback DroppableEvent
 * @param {MouseEvent} ev
 */

/**
 * @callback DroppedEvent
 * @param {MouseEvent} ev
 * @param {Object} data
 * @param {File[]} [files=[]]
 */

/**
 * @typedef {Object} DroppableOptions
 * @property {string} [type=application/json] Content Type
 * @property {string} [effect=move] DnD effect (cursor)
 * @property {DroppableEvent} [ondragenter] Callback to event (ev) => {}
 * @property {DroppableEvent} [ondragover] Callback to event (ev) => {}
 * @property {DroppableEvent} [ondragleave] Callback to event (ev) => {}
 * @property {DroppedEvent} [ondrop] Callback to event (ev, data, files) => {}
 * @property {boolean} [strict=false] Drop element must match exactly
 */

/**
 * @typedef {Object} DroppableInstance
 * @property {Function} destroy
 */

/**
 * @typedef {Object} DraggableOptions
 * @property {string} [type=application/json] Content Type
 * @property {string} [effect=move] DnD effect (cursor)
 * @property {DraggableEvent} [ondragstart] Callback to event (ev) => {}
 * @property {DraggableEvent} [ondragend] Callback to event (ev) => {}
 * @property {DraggableEvent} [setDragImage] Set custom drag image (browser dependent)
 */

/**
 * @typedef {Object} DraggableInstance
 * @property {Function} destroy
 */

const retval = (fn, ...args) => {
  try {
    const result = fn(...args);
    if (typeof result === 'boolean') {
      return result;
    }
  } catch (e) {
    instance.warn('droppable value parsing error', e);
  }

  return true;
};

const getDataTransfer = (ev, type) => {
  let files = [];
  let data;

  if (ev.dataTransfer) {
    files = ev.dataTransfer.files
      ? Array.from(ev.dataTransfer.files)
      : [];

    try {
      const transfer = ev.dataTransfer.getData(type);

      try {
        if (type === 'application/json') {
          data = typeof transfer === 'undefined' ? transfer : JSON.parse(transfer);
        } else {
          data = transfer;
        }
      } catch (e) {
        data = transfer;
        instance.warn('droppable dataTransfer parsing error', e);
      }
    } catch (e) {
      instance.warn('droppable dataTransfer parsing error', e);
    }
  }

  return {files, data};
};

const setDataTransfer = (type, effect, data, setDragImage) => {
  const hasDragImage = typeof setDragImage === 'function';
  const transferData = type === 'application/json'
    ? JSON.stringify(data)
    : data;

  return (ev, el, options) => {
    if (ev.dataTransfer) {
      if (ev.dataTransfer.setDragImage && hasDragImage) {
        try {
          setDragImage(ev, el, options);
        } catch (e) {
          instance.warn('draggable dragstart setDragImage error', e);
        }
      }

      try {
        ev.dataTransfer.effectAllowed = effect;
        ev.dataTransfer.setData(type, transferData);
      } catch (e) {
        instance.warn('draggable dragstart dataTransfer error', e);
      }
    }
  };
};

/**
 * Creates a "draggable" element
 * @param {Element} el The DOM element to apply to
 * @param {DraggableOptions} [options={}] Options
 * @return {DraggableInstance}
 */
const draggable = (el, options = {}) => {
  const {type, effect, data, ondragstart, ondragend, setDragImage} = {
    type: 'application/json',
    effect: 'move',
    ondragstart: () => true,
    ondragend: () => true,
    setDragImage: null,
    ...options
  };

  const setter = setDataTransfer(type, effect, data, setDragImage);

  const dragstart = ev => {
    el.setAttribute('aria-grabbed', 'true');
    setter(ev, el, options);
    return ondragstart(ev);
  };

  const dragend = ev => {
    el.setAttribute('aria-grabbed', 'false');

    return ondragend(ev);
  };

  const destroy = () => {
    el.removeAttribute('draggable');
    el.removeAttribute('aria-grabbed');
    el.removeEventListener('dragstart', dragstart);
    el.removeEventListener('dragend', dragend);
    el.classList.remove('osjs__draggable');
  };

  el.setAttribute('draggable', 'true');
  el.setAttribute('aria-grabbed', 'false');
  el.addEventListener('dragstart', dragstart);
  el.addEventListener('dragend', dragend);
  el.classList.add('osjs__draggable');

  return {destroy};
};

/**
 * Creates a "droppable" element
 * @param {Element} el The DOM element to apply to
 * @param {DroppableOptions} [options={}] Options
 * @return {DroppableInstance}
 */
const droppable = (el, options = {}) => {
  const {strict, type, effect, ondragenter, ondragover, ondragleave, ondrop} = {
    type: 'application/json',
    effect: 'move',
    ondragenter: () => true,
    ondragover: () => true,
    ondragleave: () => true,
    ondrop: () => true,
    strict: false,
    ...options
  };

  const dragenter = ev => ondragenter(ev);

  const dragleave = ev => {
    el.classList.remove('osjs__drop');

    return retval(ondragleave, ev);
  };

  const dragover = ev => {
    ev.preventDefault();

    const inside = el.contains(ev.target);

    if (!inside) {
      el.classList.remove('osjs__drop');
      return false;
    }

    ev.stopPropagation();
    ev.dataTransfer.dropEffect = effect;
    el.classList.add('osjs__drop');

    return retval(ondragover, ev);
  };

  const drop = ev => {
    if (strict && ev.target !== el) {
      return false;
    }

    const {files, data} = getDataTransfer(ev, type);

    ev.stopPropagation();
    ev.preventDefault();
    el.classList.remove('osjs__drop');

    return retval(ondrop, ev, data, files);
  };

  const destroy = () => {
    el.removeAttribute('aria-dropeffect', effect);
    el.removeEventListener('dragenter', dragenter);
    el.removeEventListener('dragover', dragover);
    el.removeEventListener('dragleave', dragleave);
    el.removeEventListener('drop', drop);
    el.classList.remove('osjs__droppable');
  };

  el.setAttribute('aria-dropeffect', effect);
  el.addEventListener('dragenter', dragenter);
  el.addEventListener('dragover', dragover);
  el.addEventListener('dragleave', dragleave);
  el.addEventListener('drop', drop);
  el.classList.add('osjs__droppable');

  return {destroy};
};

var dnd = /*#__PURE__*/Object.freeze({
  __proto__: null,
  draggable: draggable,
  droppable: droppable
});


const supportsNativeNotification = 'Notification' in window;

/**
 * Creates a new CSS DOM element
 * @param {Element} root Root node
 * @param {string} src Source
 * @return {Promise<ScriptElement>}
 */
const style = (root, src) => new Promise((resolve, reject) => {
  const el = document.createElement('link');
  el.setAttribute('rel', 'stylesheet');
  el.setAttribute('type', 'text/css');
  el.onload = () => resolve(el);
  el.onerror = (err) => reject(err);
  el.setAttribute('href', src);

  root.appendChild(el);

  return el;
});

/**
 * Creates a new Script DOM element
 * @param {Element} root Root node
 * @param {string} src Source
 * @param {Object} [options={}] Options
 * @return {Promise<StyleElement>}
 */
const script = (root, src, options = {}) => new Promise((resolve, reject) => {
  const opts = {
    async: false,
    defer: false,
    ...options,
    src,
    onerror: (err) => reject(err),
    onload: () => resolve(el),
  };

  const el = document.createElement('script');
  el.onreadystatechange = function() {
    if ((this.readyState === 'complete' || this.readyState === 'loaded')) {
      resolve(el);
    }
  };
  Object.assign(el, opts);
  root.appendChild(el);

  return el;
});


/**
 * Escape text so it is "safe" for HTML usage
 * @param {string} text Input text
 * @return {string}
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent;
};

/**
 * Serialize an object to CSS
 * @param {object} obj Object
 * @return {string} CSS text
 */
const createCssText = (obj) => Object.keys(obj)
  .map(k => [k, k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()])
  .map(k => `${k[1]}: ${obj[k[0]]}`)
  .join(';');

/**
 * Inserts a tab in the given event target
 * @param {Event} ev DOM Event
 */
const handleTabOnTextarea = ev => {
  const input = ev.target;
  let {selectionStart, selectionEnd, value} = input;

  input.value = value.substring(0, selectionStart)
    + '\t'
    + value.substring(selectionEnd, value.length);

  selectionStart++;

  input.selectionStart = selectionStart;
  input.selectionEnd = selectionStart;
};

/*
 * Get active element if belonging to root
 * @param {Element} root DOM Element
 * @return {Element|null}
 */
const getActiveElement = (root) => {
  if (root) {
    const ae = document.activeElement;

    return root.contains(ae) ? ae : null;
  }

  return null;
};

/**
 * Checks if passive events is supported
 * @link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 * @return {boolean}
 */
const supportsPassive = (function() {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => (supportsPassive = true)
    });

    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {/* noop */}

  return () => supportsPassive;
})();

/**
 * Plays a sound
 * @param {string} src Sound source
 * @param {object} [options] Options
 * @return {Promise<HTMLAudioElement>}
 */
const playSound = (src, options = {}) => {
  const opts = {
    volume: 1.0,
    ...options
  };

  const audio = new Audio();
  audio.volume = opts.volume;
  audio.src = src;

  try {
    const p = audio.play();
    if (p instanceof Promise) {
      return p.then(() => audio)
        .catch(err => instance.warn('Failed to play sound', src, err));
    }
  } catch (e) {
    instance.warn('Failed to play sound', src, e);
  }

  return Promise.resolve(audio);
};

/**
 * Gets supported media types
 * @return {object}
 */
const supportedMedia = () => {
  const videoFormats = {
    mp4: 'video/mp4',
    ogv: 'video/ogg'
  };

  const audioFormats = {
    mp3: 'audio/mpeg',
    mp4: 'audio/mp4',
    oga: 'audio/ogg'
  };

  const reduce = (list, elem) => Object.keys(list)
    .reduce((result, format) => {
      return {
        [format]: elem.canPlayType(list[format]) === 'probably',
        ...result
      };
    }, {});

  return {
    audio: reduce(audioFormats, document.createElement('audio')),
    video: reduce(videoFormats, document.createElement('video'))
  };
};

/**
 * Gets if CSS transitions is supported
 * @return {boolean}
 */
const supportsTransition = (function() {
  const el = document.createElement('div');
  const tests = ['WebkitTransition', 'MozTransition', 'OTransition', 'transition'];
  const supported = tests.some(name => typeof el.style[name] !== 'undefined');

  return () => supported;
})();

/**
 * Creates a native notification
 * @param {object} options Notification options
 * @param {Function} [onclick] Callback on click
 * @return {Promise<window.Notification>}
 */
const createNativeNotification = (options, onclick) => {
  const Notif = window.Notification;

  const create = () => {
    const notification = new Notif(
      options.title,
      {
        body: options.message,
        icon: options.icon
      }
    );

    notification.onclick = onclick;

    return notification;
  };

  if (supportsNativeNotification) {
    if (Notif.permission === 'granted') {
      return Promise.resolve(create());
    } else if (Notif.permission !== 'denied') {
      return new Promise((resolve, reject) => {
        Notif.requestPermission(permission => {
          return permission === 'granted' ? resolve(true) : reject(permission);
        });
      }).then(create);
    }
  }

  return Promise.reject('Unsupported');
};


/**
 * Window dimension definition
 * @typedef {Object} WindowDimension
 * @property {number} width Width in pixels (or float for percentage in setters)
 * @property {number} height Height in pixels (or float for percentage in setters)
 */

/**
 * Window position definition
 * @typedef {Object} WindowPosition
 * @property {number} left Left in pixels (or float for percentage in setters)
 * @property {number} top Top in pixels (or float for percentage in setters)
 */

/**
 * Window session
 * @typedef {Object} WindowSession
 * @property {number} id
 * @property {boolean} maximized
 * @property {boolean} minimized
 * @property {WindowPosition} position
 * @property {WindowDimension} dimension
 */

/**
 * Window attributes definition
 *
 * @typedef {Object} WindowAttributes
 * @property {string[]} [classNames=[]] A list of class names
 * @property {boolean} [ontop=false] If always on top
 * @property {string} [gravity] Gravity (center/top/left/right/bottom or any combination)
 * @property {boolean} [resizable=true] If resizable
 * @property {boolean} [focusable=true] If focusable
 * @property {boolean} [maximizable=true] If window if maximizable
 * @property {boolean} [minimizable=true] If minimizable
 * @property {boolean} [moveable=true] If moveable
 * @property {boolean} [closeable=true] If closeable
 * @property {boolean} [header=true] Show header
 * @property {boolean} [controls=true] Show controls
 * @property {string} [visibility=global] Global visibility, 'restricted' to hide from window lists etc.
 * @property {boolean} [clamp=true] Clamp the window position upon creation
 * @property {boolean} [droppable=true] If window should have the default drop action
 * @property {WindowDimension} [minDimension] Minimum dimension
 * @property {WindowDimension} [maxDimension] Maximum dimension
 * @property {{name: string}} [mediaQueries] A map of matchMedia to name
 */

/**
 * Window state definition
 *
 * @typedef {Object} WindowState
 * @property {string} title Title
 * @property {string} icon Icon
 * @property {boolean} [moving=false] If moving
 * @property {boolean} [resizing=false] If resizing
 * @property {boolean} [loading=false] If loading
 * @property {boolean} [focused=false] If focused
 * @property {boolean} [maximized=false] If maximized
 * @property {boolean} [mimimized=false] If mimimized
 * @property {boolean} [modal=false] If modal to the parent
 * @property {number} [zIndex=10] The z-index (auto calculated)
 * @property {WindowPosition} [position] Position
 * @property {WindowDimension} [dimension] Dimension
 */

/**
 * Window options definition
 *
 * @typedef {Object} WindowOptions
 * @property {string} id Window Id (not globaly unique)
 * @property {string} [title] Window Title
 * @property {string} [icon] Window Icon
 * @property {Window} [parent] The parent Window reference
 * @property {string|Function} [template] The Window HTML template (or function with signature (el, win) for programatic construction)
 * @property {Function} [ondestroy] A callback function when window destructs to interrupt the procedure
 * @property {WindowPosition|string} [position] Window position
 * @property {WindowDimension} [dimension] Window dimension
 * @property {WindowAttributes} [attributes] Apply Window attributes
 * @property {WindowState} [state] Apply Window state
 */

let windows = [];
let windowCount = 0;
let nextZindex = 1;
let lastWindow = null;

/*
 * Default window template
 */
const TEMPLATE = `<div class="osjs-window-inner">
  <div class="osjs-window-header">
    <div class="osjs-window-icon">
      <div></div>
    </div>
    <div class="osjs-window-title"></div>
    <div class="osjs-window-button" data-action="minimize">
      <div></div>
    </div>
    <div class="osjs-window-button" data-action="maximize">
      <div></div>
    </div>
    <div class="osjs-window-button" data-action="close">
      <div></div>
    </div>
  </div>
  <div class="osjs-window-content">
  </div>
  <div class="osjs-window-resize" data-direction="n"></div>
  <div class="osjs-window-resize" data-direction="nw"></div>
  <div class="osjs-window-resize" data-direction="w"></div>
  <div class="osjs-window-resize" data-direction="sw"></div>
  <div class="osjs-window-resize" data-direction="s"></div>
  <div class="osjs-window-resize" data-direction="se"></div>
  <div class="osjs-window-resize" data-direction="e"></div>
  <div class="osjs-window-resize" data-direction="ne"></div>
</div>`.replace(/\n\s+/g, '').trim();

/**
 * Window Implementation
 */
class Window extends EventEmitter {

  /**
   * Create window
   *
   * @param {Core} core Core reference
   * @param {WindowOptions} [options={}] Options
   */
  constructor(core, options = {}) {
    options = {
      id: null,
      title: null,
      parent: null,
      template: null,
      ondestroy: null,
      attributes: {},
      position: {},
      dimension: {},
      state: {},
      ...options
    };

    instance.debug('Window::constructor()', options);

    super('Window@' + options.id);

    if (typeof options.position === 'string') {
      options.attributes.gravity = options.position;
      options.position = {};
    }

    /**
     * The Window ID
     * @type {string}
     * @readonly
     */
    this.id = options.id;

    /**
     * The Window ID
     * @type {Number}
     * @readonly
     */
    this.wid = ++windowCount;

    /**
     * Parent Window reference
     * @type {Window}
     * @readonly
     */
    this.parent = options.parent;

    /**
     * Child windows (via 'parent')
     * @type {Window[]}
     */
    this.children = [];

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * The window destruction state
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * The window rendered state
     * @type {boolean}
     */
    this.rendered = false;

    /**
     * The window was inited
     * @type {boolean}
     */
    this.inited = false;

    /**
     * The window attributes
     * @type {WindowAttributes}
     */
    this.attributes = createAttributes$1(options.attributes);

    /**
     * The window state
     * @type {WindowState}
     */
    this.state = createState(options.state, options, this.attributes);

    /**
     * The window container
     * @type {Element}
     * @readonly
     */
    this.$element = document.createElement('div');

    /**
     * The content container
     * @type {Element}
     */
    this.$content = null;

    /**
     * The header container
     * @type {Element}
     */
    this.$header = null;

    /**
     * The icon container
     * @type {Element}
     */
    this.$icon = null;

    /**
     * The title container
     * @type {Element}
     */
    this.$title = null;

    /**
     * Internal variable to signal not to use default position
     * given by user (used for restore)
     * @private
     * @type {boolean}
     */
    this._preventDefaultPosition = false;

    /**
     * Internal timeout reference used for triggering the loading
     * overlay.
     * @private
     * @type {boolean}
     */
    this._loadingDebounce = null;

    /**
     * The window template
     * @private
     * @type {string|Function}
     */
    this._template = options.template;

    /**
     * Custom destructor callback
     * @private
     * @type {Function}
     * @readonly
     */
    this._ondestroy = options.ondestroy || (() => true);

    /**
     * Last DOM update CSS text
     * @private
     * @type {string}
     */
    this._lastCssText = '';

    /**
     * Last DOM update data attributes
     * @private
     * @type {WindowAttributes}
     */
    this._lastAttributes = {};

    windows.push(this);
  }

  /**
   * Destroy window
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    if (typeof this._ondestroy === 'function' && this._ondestroy() === false) {
      return;
    }

    this.destroyed = true;

    instance.debug('Window::destroy()');

    this.emit('destroy', this);
    this.core.emit('osjs/window:destroy', this);

    this.children.forEach(w => w.destroy());

    if (this.$element) {
      this.$element.remove();
    }

    if (lastWindow === this) {
      lastWindow = null;
    }

    const foundIndex = windows.findIndex(w => w === this);
    if (foundIndex !== -1) {
      windows.splice(foundIndex, 1);
    }

    this.children = [];
    this.parent = null;
    this.$element = null;
    this.$content = null;
    this.$header = null;
    this.$icon = null;
    this.$title = null;

    super.destroy();
  }

  /**
   * Initialize window
   */
  init() {
    if (this.inited) {
      return this;
    }

    if (this.parent) {
      // Assign the window if it is a child
      this.on('destroy', () => {
        const foundIndex = this.parent.children.findIndex(w => w === this);
        if (foundIndex !== -1) {
          this.parent.children.splice(foundIndex, 1);
        }
      });

      this.parent.children.push(this);
    }

    this._initTemplate();
    this._initBehavior();


    this.inited = true;
    this.emit('init', this);
    this.core.emit('osjs/window:create', this);

    return this;
  }

  /**
   * Initializes window template
   * @private
   */
  _initTemplate() {
    const tpl = this.core.config('windows.template') || TEMPLATE;
    if (this._template) {
      this.$element.innerHTML = typeof this._template === 'function'
        ? this._template(this, tpl)
        : this._template;
    } else {
      this.$element.innerHTML = tpl;
    }

    this.$content = this.$element.querySelector('.osjs-window-content');
    this.$header = this.$element.querySelector('.osjs-window-header');
    this.$icon = this.$element.querySelector('.osjs-window-icon > div');
    this.$title = this.$element.querySelector('.osjs-window-title');
  }

  /**
   * Initializes window behavior
   * @private
   */
  _initBehavior() {
    // Transform percentages in dimension to pixels etc
    if (this.core.has('osjs/desktop')) {
      const rect = this.core.make('osjs/desktop').getRect();
      const {dimension, position} = transformVectors(rect, this.state.dimension, this.state.position);
      this.state.dimension = dimension;
      this.state.position = position;
    }

    // Behavior
    const behavior = this.core.make('osjs/window-behavior');
    if (behavior) {
      behavior.init(this);
    }

    // DnD functionality
    if (this.attributes.droppable) {
      const d = droppable(this.$element, {
        ondragenter: (...args) => this.emit('dragenter', ...args, this),
        ondragover: (...args) => this.emit('dragover', ...args, this),
        ondragleave: (...args) => this.emit('dragleave', ...args, this),
        ondrop: (...args) => this.emit('drop', ...args, this)
      });

      this.on('destroy', () => d.destroy());
    }
  }

  /**
   * Checks the modal state of the window upon render
   * @private
   */
  _checkModal() {
    // TODO: Global modal
    if (this.parent) {
      if (this.attributes.modal) {
        this.on('render', () => this.parent.setState('loading', true));
        this.on('destroy', () => this.parent.setState('loading', false));
      }

      this.on('destroy', () => this.parent.focus());
    }
  }

  /**
   * Sets the initial class names
   * @private
   */
  _setClassNames() {
    const classNames = ['osjs-window', ...this.attributes.classNames];
    if (this.id) {
      classNames.push(`Window_${this.id}`);
    }

    classNames.filter(val => !!val)
      .forEach((val) => this.$element.classList.add(val));
  }

  /**
   * Render window
   * @param {Function} [callback] Callback when window DOM has been constructed
   * @return {Window} this instance
   */
  render(callback = function() {}) {
    if (this.rendered) {
      return this;
    } else if (!this.inited) {
      this.init();
    }

    this._setClassNames();
    this._updateButtons();
    this._updateAttributes();
    this._updateStyles();
    this._updateTitle();
    this._updateIconStyles();
    this._updateHeaderStyles();
    this._checkModal();

    if (!this._preventDefaultPosition) {
      this.gravitate(this.attributes.gravity);
    }

    // Clamp the initial window position to viewport
    if (this.attributes.clamp) {
      this.clampToViewport(false);
    }

    this.setNextZindex(true);

    this.core.$contents.appendChild(this.$element);

    renderCallback(this, callback);

    this.rendered = true;

    setTimeout(() => {
      this.emit('render', this);
      this.core.emit('osjs/window:render', this);
    }, 1);

    return this;
  }

  /**
   * Close the window
   * @return {boolean}
   */
  close() {
    if (this.destroyed) {
      return false;
    }

    this.emit('close', this);

    this.destroy();

    return true;
  }

  /**
   * Focus the window
   * @return {boolean}
   */
  focus() {
    if (!this.state.minimized && this._toggleState('focused', true, 'focus')) {
      this._focus();

      return true;
    }

    return false;
  }

  /**
   * Internal for focus
   * @private
   */
  _focus() {
    if (lastWindow && lastWindow !== this) {
      lastWindow.blur();
    }

    lastWindow = this;

    this.setNextZindex();
  }

  /**
   * Blur (un-focus) the window
   * @return {boolean}
   */
  blur() {
    // Forces blur-ing of browser input element belonging to this window
    const activeElement = getActiveElement(this.$element);
    if (activeElement) {
      activeElement.blur();
    }

    return this._toggleState('focused', false, 'blur');
  }

  /**
   * Minimize (hide) the window
   * @return {boolean}
   */
  minimize() {
    if (this.attributes.minimizable) {
      if (this._toggleState('minimized', true, 'minimize')) {
        this.blur();

        return true;
      }
    }

    return false;
  }

  /**
   * Raise (un-minimize) the window
   * @return {boolean}
   */
  raise() {
    return this._toggleState('minimized', false, 'raise');
  }

  /**
   * Maximize the window
   * @return {boolean}
   */
  maximize() {
    if (this.attributes.maximizable) {
      return this._maximize(true);
    }

    return false;
  }

  /**
   * Restore (un-maximize) the window
   * @return {boolean}
   */
  restore() {
    return this._maximize(false);
  }

  /**
   * Internal for Maximize or restore
   * @private
   * @param {boolean} toggle Maximize or restore
   * @return {boolean}
   */
  _maximize(toggle) {
    if (this._toggleState('maximized', toggle, toggle ? 'maximize' : 'restore')) {
      const emit = () => this.emit('resized', {
        width: this.$element ? this.$element.offsetWidth : -1,
        height: this.$element ? this.$element.offsetHeight : -1
      }, this);

      if (supportsTransition()) {
        this.once('transitionend', emit);
      } else {
        emit();
      }

      return true;
    }

    return false;
  }

  /**
   * Resize to fit to current container
   * @param {Element} [container] The DOM element to use
   */
  resizeFit(container) {
    container = container || this.$content.firstChild;

    if (container) {
      const rect = this.core.has('osjs/desktop')
        ? this.core.make('osjs/desktop').getRect()
        : null;

      const {width, height} = dimensionFromElement(this, rect, container);
      if (!isNaN(width) && !isNaN(height)) {
        this.setDimension({width, height});
      }
    }
  }

  /**
   * Clamps the position to viewport
   * @param {boolean} [update=true] Update DOM
   */
  clampToViewport(update = true) {
    if (!this.core.has('osjs/desktop')) {
      return;
    }

    const rect = this.core.make('osjs/desktop').getRect();

    this.state.position = {
      ...this.state.position,
      ...clampPosition(rect, this.state)
    };

    if (update) {
      this._updateStyles();
    }
  }

  /**
   * Set the Window icon
   * @param {string} uri Icon URI
   */
  setIcon(uri) {
    this.state.icon = uri;

    this._updateIconStyles();
  }

  /**
   * Set the Window title
   * @param {string} title Title
   */
  setTitle(title) {
    this.state.title = title || '';

    this._updateTitle();

    this.core.emit('osjs/window:change', this, 'title', title);
  }

  /**
   * Set the Window dimension
   * @param {WindowDimension} dimension The dimension
   */
  setDimension(dimension) {
    const {width, height} = {...this.state.dimension, ...dimension || {}};

    this.state.dimension.width = width;
    this.state.dimension.height = height;

    this._updateStyles();
  }

  /**
   * Set the Window position
   * @param {WindowPosition} position The position
   * @param {boolean} [preventDefault=false] Prevents any future position setting in init procedure
   */
  setPosition(position, preventDefault = false) {
    const {left, top} = {...this.state.position, ...position || {}};

    this.state.position.top = top;
    this.state.position.left = left;

    if (preventDefault) {
      this._preventDefaultPosition = true;
    }

    this._updateStyles();
  }

  /**
   * Set the Window z index
   * @param {Number} zIndex the index
   */
  setZindex(zIndex) {
    this.state.zIndex = zIndex;
    instance.debug('Window::setZindex()', zIndex);

    this._updateStyles();
  }

  /**
   * Sets the Window to next z index
   * @param {boolean} [force] Force next index
   */
  setNextZindex(force) {
    const setNext = force || this._checkNextZindex();

    if (setNext) {
      this.setZindex(nextZindex);
      nextZindex++;
    }
  }

  /**
   * Set a state by value
   * @param {string} name State name
   * @param {*} value State value
   * @param {boolean} [update=true] Update the DOM
   * @see {WindowState}
   */
  setState(name, value, update = true) {
    const set = () => this._setState(name, value, update);

    // Allows for some "grace time" so the overlay does not
    // "blink"
    if (name === 'loading' && update) {
      clearTimeout(this._loadingDebounce);

      if (value === true) {
        this._loadingDebounce = setTimeout(() => set(), 250);
        return;
      }
    }

    set();
  }

  /**
   * Gravitates window towards a certain area
   * @param {string} gravity Gravity
   */
  gravitate(gravity) {
    if (!this.core.has('osjs/desktop')) {
      return;
    }

    const rect = this.core.make('osjs/desktop').getRect();
    const position = positionFromGravity(this, rect, gravity);

    this.setPosition(position);
  }

  /**
   * Gets a astate
   * @return {*}
   */
  getState(n) {
    const value = this.state[n];

    return ['position', 'dimension', 'styles'].indexOf(n) !== -1
      ? {...value}
      : value;
  }

  /**
   * Get a snapshot of the Window session
   * @return {WindowSession}
   */
  getSession() {
    return this.attributes.sessionable === false ? null : {
      id: this.id,
      maximized: this.state.maximized,
      minimized: this.state.minimized,
      position: {...this.state.position},
      dimension: {...this.state.dimension}
    };
  }

  /**
   * Get a list of all windows
   *
   * @return {Window[]}
   */
  static getWindows() {
    return windows;
  }

  /**
   * Gets the lastly focused Window
   * @return {Window}
   */
  static lastWindow() {
    return lastWindow;
  }

  /**
   * Internal method for setting state
   * @private
   * @param {string} name State name
   * @param {*} value State value
   * @param {boolean} [update=true] Update the DOM
   * @param {boolean} [updateAll=true] Update the entire DOM
   */
  _setState(name, value, update = true) {
    const oldValue = this.state[name];
    this.state[name] = value;

    if (update) {
      if (oldValue !== value) {
        instance.debug('Window::_setState()', name, value);
      }

      this._updateAttributes();
      this._updateStyles();
    }
  }

  /**
   * Internal method for toggling state
   * @private
   * @param {string} name State name
   * @param {any} value State value
   * @param {string} eventName Name of event to emit
   * @param {boolean} [update=true] Update the DOM
   */
  _toggleState(name, value, eventName, update = true) {
    if (this.state[name] === value) {
      return false;
    }

    instance.debug('Window::_toggleState()', name, value, eventName, update);

    this.state[name] = value;
    this.emit(eventName, this);
    this.core.emit('osjs/window:change', this, name, value);

    if (update) {
      this._updateAttributes();
    }

    return true;
  }

  /**
   * Check if we have to set next zindex
   * @private
   * @return {boolean}
   */
  _checkNextZindex() {
    const {ontop} = this.attributes;
    const {zIndex} = this.state;

    const windexes = windows
      .filter(w => w.attributes.ontop === ontop)
      .filter(w => w.wid !== this.wid)
      .map(w => w.state.zIndex);

    const max = windexes.length > 0
      ? Math.max.apply(null, windexes)
      : 0;

    return zIndex < max;
  }

  /*
   * Updates window styles and attributes
   * FIXME: Backward compability with themes
   * @deprecated
   */
  _updateDOM() {
    this._updateAttributes();
    this._updateStyles();
  }

  /**
   * Updates the window buttons in DOM
   * @private
   */
  _updateButtons() {
    const hideButton = action =>
      this.$header.querySelector(`.osjs-window-button[data-action=${action}]`)
        .style.display = 'none';

    const buttonmap = {
      maximizable: 'maximize',
      minimizable: 'minimize',
      closeable: 'close'
    };

    if (this.attributes.controls) {
      Object.keys(buttonmap)
        .forEach(key => {
          if (!this.attributes[key]) {
            hideButton(buttonmap[key]);
          }
        });
    } else {
      Array.from(this.$header.querySelectorAll('.osjs-window-button'))
        .forEach(el => el.style.display = 'none');
    }
  }

  /**
   * Updates window title in DOM
   * @private
   */
  _updateTitle() {
    if (this.$title) {
      const escapedTitle = escapeHtml(this.state.title);
      if (this.$title.innerHTML !== escapedTitle) {
        this.$title.innerHTML = escapedTitle;
      }
    }
  }

  /**
   * Updates window icon decoration in DOM
   * @private
   */
  _updateIconStyles() {
    if (this.$icon) {
      const iconSource = `url(${this.state.icon})`;
      if (this.$icon.style.backgroundImage !== iconSource) {
        this.$icon.style.backgroundImage = iconSource;
      }
    }
  }

  /**
   * Updates window header decoration in DOM
   * @private
   */
  _updateHeaderStyles() {
    if (this.$header) {
      const headerDisplay = this.attributes.header ? undefined : 'none';
      if (this.$header.style.display !== headerDisplay) {
        this.$header.style.display = headerDisplay;
      }
    }
  }

  /**
   * Updates window data in DOM
   * @private
   */
  _updateAttributes() {
    if (this.$element) {
      const attrs = createDOMAttributes(this.id, this.state, this.attributes);
      const applyAttrs = Object.keys(attrs).filter(k => attrs[k] !== this._lastAttributes[k]);

      if (applyAttrs.length > 0) {
        applyAttrs.forEach(a => this.$element.setAttribute(`data-${a}`, String(attrs[a])));
        this._lastAttributes = attrs;
      }
    }
  }

  /**
   * Updates window style in DOM
   * @private
   */
  _updateStyles() {
    if (this.$element) {
      const cssText = createCssText(createDOMStyles(this.state, this.attributes));
      if (cssText !== this._lastCssText) {
        this.$element.style.cssText = cssText;
        this._lastCssText = cssText;
      }
    }
  }
}


const applications = [];
let applicationCount = 0;

const getSettingsKey = metadata =>
  'osjs/application/' + metadata.name;

/**
 * Application Options
 *
 * @typedef {Object} ApplicationOptions
 * @property {object} [settings] Initial settings
 * @property {object} [restore] Restore data
 * @property {boolean} [windowAutoFocus=true] Auto-focus first created window
 * @property {boolean} [sessionable=true] Allow session storage
 */

/**
 * Application Data
 *
 * @typedef {Object} ApplicationData
 * @property {{foo: *}} args Launch arguments
 * @property {ApplicationOptions} [options] Options
 * @property {PackageMetadata} [metadata] Package Metadata
 */

/**
 * Application Session
 *
 * @typedef {Object} ApplicationSession
 * @property {{foo: string}} args
 * @property {string} name
 * @property {WindowSession[]} windows
 */

/**
 * Base class for an Application
 */
class Application extends EventEmitter {

  /**
   * Create application
   *
   * @param {Core} core Core reference
   * @param {ApplicationData} data Application data
   */
  constructor(core, data) {
    data = {
      args: {},
      options: {},
      metadata: {},
      ...data
    };

    instance.debug('Application::constructor()', data);

    const defaultSettings = data.options.settings
      ? {...data.options.settings}
      : {};

    const name = data.metadata && data.metadata.name
      ? 'Application@' + data.metadata.name
      : 'Application' + String(applicationCount);

    super(name);

    /**
     * The Application ID
     * @type {Number}
     * @readonly
     */
    this.pid = applicationCount;

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Application arguments
     * @type {{foo: *}}
     */
    this.args = data.args;

    /**
     * Application options
     * @type {ApplicationOptions}
     */
    this.options = {
      sessionable: true,
      windowAutoFocus: true,
      ...data.options
    };

    /**
     * Application metadata
     * @type {PackageMetadata}
     * @readonly
     */
    this.metadata = data.metadata;

    /**
     * Window list
     * @type {Window[]}
     */
    this.windows = [];

    /**
     * Worker instances
     * @type {Worker[]}
     */
    this.workers = [];

    /**
     * Options for internal fetch/requests
     * @type {object}
     */
    this.requestOptions = {};

    /**
     * The application destruction state
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * Application settings
     * @type {{foo: *}}
     */
    this.settings = core.make('osjs/settings')
      .get(getSettingsKey(this.metadata), null, defaultSettings);

    /**
     * Application started time
     * @type {Date}
     * @readonly
     */
    this.started = new Date();

    /**
     * Application WebSockets
     * @type {Websocket[]}
     */
    this.sockets = [];

    applications.push(this);
    applicationCount++;

    this.core.emit('osjs/application:create', this);
  }

  /**
   * Destroy application
   */
  destroy(remove = true) {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.emit('destroy');
    this.core.emit('osjs/application:destroy', this);

    const destroy = (list, fn) => {
      try {
        list.forEach(fn);
      } catch (e) {
        instance.warn('Exception on application destruction', e);
      }

      return [];
    };

    this.windows = destroy(this.windows, window => window.destroy());
    this.sockets = destroy(this.sockets, ws => ws.close());
    this.workers = destroy(this.workers, worker => worker.terminate());

    if (remove) {
      const foundIndex = applications.findIndex(a => a === this);
      if (foundIndex !== -1) {
        applications.splice(foundIndex, 1);
      }
    }

    super.destroy();
  }

  /**
   * Re-launch this application
   */
  relaunch() {
    const windows = this.windows.map(w => w.getSession());

    this.destroy();

    setTimeout(() => {
      this.core.run(this.metadata.name, {...this.args}, {
        ...this.options,
        forcePreload: this.core.config('development'),
        restore: {windows}
      });
    }, 1);
  }

  /**
   * Gets a URI to a resource for this application
   *
   * If given path is an URI it will just return itself.
   *
   * @param {string} path The path
   * @param {object} [options] Options for url() in core
   * @return {string} A complete URI
   */
  resource(path = '/', options = {}) {
    return this.core.url(path, options, this.metadata);
  }

  /**
   * Performs a request to the OS.js server with the application
   * as the endpoint.
   * @param {string} [path=/] Append this to endpoint
   * @param {Options} [options] fetch options
   * @param {string} [type='json'] Request / Response type
   * @return {Promise<*>} ArrayBuffer or JSON
   */
  request(path = '/', options = {}, type = 'json') {
    const uri = this.resource(path);

    return this.core.request(uri, options, type);
  }

  /**
   * Creates a new Websocket
   * @param {string} [path=/socket] Append this to endpoint
   * @param {WebsocketOptions} [options={}] Connection options
   * @return {Websocket}
   */
  socket(path = '/socket', options = {}) {
    options = {
      socket: {},
      ...options
    };

    const uri = this.resource(path, {type: 'websocket'});
    const ws = new Websocket(this.metadata.name, uri, options.socket);

    this.sockets.push(ws);

    return ws;
  }

  /**
   * Sends a message over websocket via the core connection.
   *
   * This does not create a new connection, but rather uses the core connection.
   * For subscribing to messages from the server use the 'ws:message' event
   *
   * @param {*} ...args Arguments to pass to message
   */
  send(...args) {
    this.core.send('osjs/application:socket:message', {
      pid: this.pid,
      name: this.metadata.name,
      args
    });
  }

  /**
   * Creates a new Worker
   * @param {string} filename Worker filename
   * @param {object} [options] Worker options
   * @return {Worker}
   */
  worker(filename, options = {}) {
    const uri = this.resource(filename);
    const worker =  new Worker(uri, {
      credentials: 'same-origin',
      ...options
    });

    this.workers.push(worker);

    return worker;
  }

  /**
   * Create a new window belonging to this application
   * @param {WindowOptions} [options={}] Window options
   * @return {Window}
   */
  createWindow(options = {}) {
    const found = this.windows.find(w => w.id === options.id);
    if (found) {
      const msg = this.core.make('osjs/locale')
        .translate('ERR_WINDOW_ID_EXISTS', options.id);

      throw new Error(msg);
    }

    const configWindows = this.core.config('application.windows', []);
    const applyOptions = loadOptionsFromConfig(configWindows, this.metadata.name, options.id);
    const instance = new Window(this.core, merge(options, applyOptions));

    if (this.options.restore) {
      const windows = this.options.restore.windows || [];
      const found = windows.findIndex(r => r.id === instance.id);

      if (found !== -1) {
        const restore = windows[found];
        instance.setPosition(restore.position, true);
        instance.setDimension(restore.dimension);

        if (restore.minimized) {
          instance.minimize();
        } else if (restore.maximized) {
          instance.maximize();
        }

        this.options.restore.windows.splice(found, 1);
      }
    }

    instance.init();

    this.windows.push(instance);

    this.emit('create-window', instance);
    instance.on('destroy', () => {
      if (!this.destroyed) {
        const foundIndex = this.windows.findIndex(w => w === instance);
        if (foundIndex !== -1) {
          this.windows.splice(foundIndex, 1);
        }
      }

      this.emit('destroy-window', instance);
    });

    if (this.options.windowAutoFocus) {
      instance.focus();
    }

    return instance;
  }

  /**
   * Removes window(s) based on given filter
   * @param {Function} filter Filter function
   */
  removeWindow(filter) {
    const found = this.windows.filter(filter);
    found.forEach(win => win.destroy());
  }

  /**
   * Gets a snapshot of the application session
   * @return {ApplicationSession}
   */
  getSession() {
    const session = {
      args: {...this.args},
      name: this.metadata.name,
      windows: this.windows
        .map(w => w.getSession())
        .filter(s => s !== null)
    };

    return session;
  }

  /**
   * Emits an event across all (or filtered) applications
   *
   * @deprecated
   * @param {Function} [filter] A method to filter what applications to send to
   * @return {Function} Function with 'emit()' signature
   */
  emitAll(filter) {
    instance.warn('Application#emitAll is deprecated. Use Core#broadcast instead');

    const defaultFilter = proc => proc.pid !== this.pid;
    const filterFn = typeof filter === 'function'
      ? filter
      : typeof filter === 'string'
        ? proc => defaultFilter(proc) && proc.metadata.name === filter
        : defaultFilter;

    return (name, ...args) => applications.filter(filterFn)
      .map(proc => proc.emit(name, ...args));
  }

  /**
   * Saves settings
   * @return {Promise<boolean>}
   */
  saveSettings() {
    const service = this.core.make('osjs/settings');
    const name = getSettingsKey(this.metadata);

    service.set(name, null, this.settings);

    return service.save();
  }

  /**
   * Get a list of all running applications
   *
   * @return {Application[]}
   */
  static getApplications() {
    return applications;
  }

  /**
   * Kills all running applications
   */
  static destroyAll() {
    applications.forEach(proc => {
      try {
        proc.destroy(false);
      } catch (e) {
        instance.warn('Exception on destroyAll', e);
      }
    });

    applications.splice(0, applications.length);
  }

}


/**
 * Splash Screen UI
 */
class Splash {
  /**
   * Create Splash
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Splash root element
     * @type {Element}
     * @readonly
     */
    this.$loading = document.createElement('div');
    this.$loading.className = 'osjs-boot-splash';

    core.on('osjs/core:boot', () => this.show());
    core.on('osjs/core:booted', () => this.destroy());
    core.on('osjs/core:logged-in', () => this.show());
    core.on('osjs/core:started', () => this.destroy());
  }

  /**
   * Initializes splash
   */
  init() {
    this.$loading.appendChild(document.createTextNode('Loading...'));
  }

  /**
   * Shows splash
   */
  show() {
    if (!this.$loading.parentNode) {
      this.core.$root.appendChild(this.$loading);
    }
  }

  /**
   * Destroys splash
   */
  destroy() {
    if (this.$loading.parentNode) {
      this.$loading.remove();
    }
  }
}


const FALLBACK_LOCALE = 'en_EN';

// TODO
const prefixMap = {
  nb: 'nb_NO'
};

const sprintfRegex = /\{(\d+)\}/g;

const sprintfMatcher = args => (m, n) =>
  n in args ? args[n] : m;

const getDefaultLocale = (core, key) => core.config('locale.' + key);

const getUserLocale = (core, key, defaultLocale) => core.make('osjs/settings')
  .get('osjs/locale', key, defaultLocale);

/**
 * Gest the set localization
 * @param {Core} core OS.js Core IoC
 * @param {string} key Settings key (locales.*)
 * @return {object} An object with defaultLocale and userLocale
 */
const getLocale = (core, key) => {
  const defaultLocale = getDefaultLocale(core, key);
  const userLocale = getUserLocale(core, key, defaultLocale);
  return {defaultLocale, userLocale};
};

/**
 * Gets a raw string from a tree of translations based on key
 *
 * Note that this function will fall back to a pre-configured locale
 * if the given locale names were not found.
 *
 * @private
 * @param {object}  list      The tree of translations
 * @param {string}  ul        User locale name
 * @param {string}  dl        Default locale name
 * @param {string}  k         The key to translate from tree
 * @return {string}           The raw string
 */
const getFromList = (list, ul, dl, k) => {
  const fallbackList = list[FALLBACK_LOCALE] || {};
  const localizedList = list[ul] || list[dl] || {};

  if (typeof localizedList[k] === 'undefined') {
    return fallbackList[k] || k;
  }

  return localizedList[k];
};

/**
 * Translates a key + arguments from a tree of translations
 *
 * @example
 *  translate({en_EN: {foo: 'Hello {0}'}}, 'nb_NO', 'en_EN', 'foo', 'World') => 'Hello World'
 *
 * @private
 * @param {object}  list      The tree of translations
 * @param {string}  ul        User locale name
 * @param {string}  dl        Default locale name
 * @param {string}  k         The key to translate from tree
 * @param {...*}    args      A list of arguments that are defined in the translation string
 * @return {string}           The translated string
 */
const translate = (list, ul, dl, k, ...args) => {
  const fmt = getFromList(list, ul, dl, k);
  return fmt.replace(sprintfRegex, sprintfMatcher(args));
};

/**
 * Translates a given flat tree of locales
 *
 * Will automatically detect the current locale from the user.
 *
 * Returns a function that takes a key and returns the correct string.
 *
 * @example
 *  translatableFlat({en_EN: 'Hello World'}); // => 'Hello World'
 *
 * @param {object} list The tree of translations
 * @param {string} defaultValue Default value if none found
 * @return {string} The translated string
 */
const translatableFlat = core => (list, defaultValue) => {
  const {defaultLocale, userLocale} = getLocale(core, 'language');

  return list[userLocale] || list[defaultLocale] || list[FALLBACK_LOCALE] || defaultValue;
};

/**
 * Translates a given tree of locales.
 *
 * Will automatically detect the current locale from the user.
 *
 * Returns a `translate` function that takes a key and list of arguments.
 *
 * @see translate
 * @example
 *  translatable({en_EN: {foo: 'Hello {0}'}})
 *    ('foo', 'World'); // => 'Hello World'
 * @param {string} k List key
 * @param {...args} Format arguments
 * @return {Function} A translation function
 */
const translatable = core => list => {
  const {defaultLocale, userLocale} = getLocale(core, 'language');

  return (k, ...args) => translate(
    list,
    userLocale,
    defaultLocale,
    k,
    ...args
  );
};

/**
 * Formats a given Date to a specified format
 *
 * Will automatically detect the current locale from the user.
 *
 * Formats are 'shortDate', 'mediumDate', 'longDate', 'fullDate',
 *       'shortTime' and 'longTime'
 *
 * @param {Date} date Date object
 * @param {string} fmt Format
 * @return {string}
 */
const format = core => (date, fmt) => {
  const {defaultLocale, userLocale} = getLocale(core, 'format.' + fmt);
  const useFormat = userLocale || defaultLocale || fmt;

  return dateformat(date, useFormat);
};

/**
 * Returns the navigator language
 * @param {object} [nav]
 * @return {string}
 */
const browserLocale = (nav = {}) => {
  const browserLanguage = nav.userLanguage || nav.language || '';
  const get = l => prefixMap[l] ? prefixMap[l] : (l.match(/_/)
    ? l
    : (l ? `${l}_${l.toUpperCase()}` : ''));

  const langs = (nav.languages || [browserLanguage])
    .map(l => get(l.replace('-', '_')))
    .filter(str => !!str);

  return langs[langs.length - 1];
};

/**
 * Figures out what locale the browser is running as
 *
 * @param {string} [defaultLocale=en_EN] Default locale if none found
 * @return {string} The browser locale
 */
const clientLocale = (() => {
  const lang = browserLocale(navigator);

  return (defaultLocale = FALLBACK_LOCALE, acceptedLocales = []) => {
    const found = lang || defaultLocale;

    if (acceptedLocales.lenght > 0 && acceptedLocales.indexOf(lang) === -1) {
      return defaultLocale;
    }

    return found;
  };
})();



/**
 * TODO: typedef
 * @typedef {Object} CoreConfig
 */

const createUri = str => str
  .replace(/(index\.(html?|php))$/, '')
  .replace(/\/?$/, '/');

const pathname$1 = createUri(window.location.pathname);

const href = createUri(window.location.href);

const languages = {
  en_EN: 'English',
  nb_NO: 'Norwegian, Norsk (bokmål)',
  vi_VN: 'Vietnamese, Vietnamese',
  fr_FR: 'French',
  de_DE: 'German',
  sl_SI: 'Slovenian, Slovenščina',
  zh_CN: 'Chinese (simplified)',
  fa_FA: 'Persian',
  pt_BR: 'Português (Brasil)',
  ru_RU: 'Русский (Russian)',
  tr_TR: 'Türkçe (Turkish)',
  sv_SE: 'Svenska (Swedish)'
};

const defaultConfiguration = {
  development: !(process.env.NODE_ENV || '').match(/^prod/i),
  standalone: false,
  languages,

  http: {
    ping: true,
    public: pathname$1,
    uri: href
  },

  ws: {
    connectInterval: 5000,
    uri: href.replace(/^http/, 'ws'),
    disabled: false
  },

  packages: {
    manifest: '/metadata.json',
    metadata: [],
    hidden: [],
    permissions: {},
    overrideMetadata: {}
  },

  // FIXME: Move into packages above ?!
  application: {
    pinned: [],
    autostart: [],
    categories: {
      development: {
        label: 'LBL_APP_CAT_DEVELOPMENT',
        icon: 'applications-development'
      },
      science: {
        label: 'LBL_APP_CAT_SCIENCE',
        icon: 'applications-science'
      },
      games: {
        label: 'LBL_APP_CAT_GAMES',
        icon: 'applications-games'
      },
      graphics: {
        label: 'LBL_APP_CAT_GRAPHICS',
        icon: 'applications-graphics'
      },
      network: {
        label: 'LBL_APP_CAT_NETWORK',
        icon: 'applications-internet'
      },
      multimedia: {
        label: 'LBL_APP_CAT_MULTIMEDIA',
        icon: 'applications-multimedia'
      },
      office: {
        label: 'LBL_APP_CAT_OFFICE',
        icon: 'applications-office'
      },
      system: {
        label: 'LBL_APP_CAT_SYSTEM',
        icon: 'applications-system'
      },
      utilities: {
        label: 'LBL_APP_CAT_UTILITIES',
        icon: 'applications-utilities'
      },
      other: {
        label: 'LBL_APP_CAT_OTHER',
        icon: 'applications-other'
      }
    },
    windows: [
      /*
      {
        application: string | RegExp | undefined,
        window: string | RegExp | undefined,
        options: {
          dimension: object | undefined,
          position: object | undefined,
          attributes: object | undefined
        }
      }
      */
    ]
  },

  auth: {
    ui: {},

    cookie: {
      name: 'osjs.auth',
      expires: 7,
      enabled: false,
      secure: false
    },

    login: {
      username: null,
      password: null
    },

    // NOTE: These are the fallback default values
    defaultUserData: {
      id: null,
      username: 'osjs',
      groups: []
    }
  },

  settings: {
    lock: [],
    prefix: 'osjs__', // localStorage settings adapter key prefix

    defaults: {
      'osjs/default-application': {},
      'osjs/session': [],
      'osjs/desktop': {},
      'osjs/locale': {}
    }
  },

  search: {
    enabled: true
  },

  notifications: {
    native: false
  },

  desktop: {
    lock: false,
    contextmenu: {
      enabled: true,
      defaults: true
    },

    settings: {
      font: 'Roboto',
      theme: 'StandardTheme',
      sounds: 'FreedesktopSounds',
      icons: 'GnomeIcons',
      animations: false,
      panels: [{
        position: 'top',
        items: [
          {name: 'menu'},
          {name: 'windows'},
          {name: 'tray'},
          {name: 'clock'}
        ]
      }],
      widgets: [],
      keybindings: {
        'open-application-menu': 'shift+alt+a',
        'close-window': 'shift+alt+w'
      },
      notifications: {
        position: 'top-right'
      },
      background: {
        src: defaultWallpaper,
        color: '#572a79',
        style: 'cover'
      },
      iconview: {
        enabled: true,
        path: 'home:/.desktop',
        fontColorStyle: 'system',
        fontColor: '#ffffff'
      }
    }
  },

  locale: {
    language: clientLocale('en_EN', Object.keys(languages)),
    rtl: ['az', 'fa', 'he', 'uz', 'ar'],
    format: {
      shortDate: 'yyyy-mm-dd',
      mediumDate: 'dS mmm yyyy',
      longDate: 'dS mmmm yyyy',
      fullDate: 'dddd dS mmmm yyyy',
      shortTime: 'HH:MM',
      longTime: 'HH:MM:ss'
    }
  },

  windows: {
    lofi: false,
    mobile: false, // Trigger for setting mobile UI
    template: null, // A string. See 'window.js' for example
    clampToViewport: true, // Clamp windows to viewport on resize
    moveKeybinding: 'ctrl'
  },

  vfs: {
    watch: true,
    defaultPath: 'home:/',
    defaultAdapter: 'system',
    adapters: {},
    mountpoints: [{
      name: 'apps',
      label: 'Applications',
      adapter: 'apps',
      icon: defaultIcon,
      attributes: {
        visibility: 'restricted',
        readOnly: true
      }
    }, {
      name: 'osjs',
      label: 'OS.js',
      adapter: 'system',
      icon: {name: 'folder-publicshare'}
    }, {
      name: 'home',
      label: 'Home',
      adapter: 'system',
      icon: {name: 'user-home'}
    }],
    icons: {
      '^application/zip': {name: 'package-x-generic'},
      '^application/javascript': {name: 'text-x-script'},
      '^application/json': {name: 'text-x-script'},
      '^application/x-python': {name: 'text-x-script'},
      '^application/php': {name: 'text-x-script'},
      '^application/pdf': {name: 'x-office-document'},
      '^application/rtf': {name: 'x-office-document'},
      '^application/msword': {name: 'x-office-document'},
      '^application/(xz|tar|gzip)': {name: 'package-x-generic'},
      '^text/css': {name: 'text-x-script'},
      '^text/html': {name: 'text-html'},
      '^(application|text)/xml': {name: 'text-html'},
      '^application': {name: 'application-x-executable'},
      '^text': {name: 'text-x-generic'},
      '^audio': {name: 'audio-x-generic'},
      '^video': {name: 'video-x-generic'},
      '^image': {name: 'image-x-generic'}
    }
  },

  providers: {
    globalBlacklist: [
      'osjs/websocket',
      'osjs/clipboard',
      'osjs/gapi'
    ],
    globalWhitelist: []
  }
};



/*
 * Creates URL request path
 */
const encodeQueryData = (data) => {
  const pairs = Object.entries(data)
    .filter(([, val]) => val !== null && val !== undefined)
    .map(([key, val]) => {
      const value = typeof val === 'object' ? JSON.stringify(val) : val;
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });

  return pairs.join('&');
};

const bodyTypes = [
  window.ArrayBuffer,
  window.ArrayBufferView,
  window.Blob,
  window.File,
  window.URLSearchParams,
  window.FormData
].filter(t => !!t);

/*
 * Creates fetch() options
 */
const createFetchOptions = (url, options, type) => {
  const fetchOptions = {
    credentials: 'same-origin',
    method: 'get',
    headers: {},
    ...options
  };

  if (type === 'json') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };
  }

  if (fetchOptions.body && fetchOptions.method.toLowerCase() === 'get') {
    if(encodeQueryData(fetchOptions.body) !== '') {
      url += '?' + encodeQueryData(fetchOptions.body);
    }
    delete fetchOptions.body;
  }

  const hasBody = typeof fetchOptions.body !== 'undefined';
  const stringBody = typeof fetchOptions.body === 'string';

  if (type === 'json' && (hasBody && !stringBody)) {
    if (!(fetchOptions.body instanceof FormData)) {
      const found = bodyTypes.find(t => (fetchOptions.body instanceof t));
      if (!found) {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }
    }
  }

  return [url, fetchOptions];
};

/**
 * This is a fetch polyfill for XMLHttpRequest.
 * Mainly used to get upload progress indicator.
 */
const fetchXhr = (target, fetchOptions) => new Promise((resolve, reject) => {
  const req = new XMLHttpRequest();

  const onError = (msg) => (ev) => {
    console.warn(msg, ev);
    reject(new Error(msg));
  };

  const onLoad = () => {
    resolve({
      status: req.status,
      statusText: req.statusText,
      ok: req.status >= 200 && req.status <= 299,
      headers: {
        get: k => req.getResponseHeader(k)
      },
      text: () => Promise.resolve(JSON.responseText),
      json: () => Promise.resolve(JSON.parse(req.responseText)),
      arrayBuffer: () => Promise.resolve(req.response)
    });
  };

  if (typeof fetchOptions.onProgress === 'function') {
    const rel = fetchOptions.method.toUpperCase() === 'GET' ? req : req.upload;
    rel.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        const percentComplete = Math.round(ev.loaded / ev.total * 100);
        fetchOptions.onProgress(ev, percentComplete);
      }
    });
  }

  req.addEventListener('load', onLoad);
  req.addEventListener('error', onError('An error occured while performing XHR request'));
  req.addEventListener('abort', onError('XHR request was aborted'));
  req.open(fetchOptions.method, target);
  Object.entries(fetchOptions.headers).forEach(([k, v]) => req.setRequestHeader(k, v));
  req.responseType = fetchOptions.responseType || '';
  req.send(fetchOptions.body);
});

/**
 * Make a HTTP request
 *
 * @param {string} url The endpoint
 * @param {Options} [options] fetch options
 * @param {string} [type] Request / Response type
 * @return {Promise<*>}
 */
const fetch = (url, options = {}, type = null) => {
  const [target, fetchOptions] = createFetchOptions(url, options, type);

  const createErrorRejection = (response, error) =>
    Promise.reject(new Error(error
      ? error
      : `${response.status} (${response.statusText})`));

  const op = options.xhr
    ? fetchXhr(target, fetchOptions)
    : window.fetch(target, fetchOptions);

  return op
    .then(response => {
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        const method = contentType && contentType.indexOf('application/json') !== -1
          ? 'json'
          : 'text';

        return response[method]()
          .then(data => createErrorRejection(response, data.error));
      }

      return type === 'json'
        ? response.json()
        : response;
    });
};


/**
 * @typedef {Object} URLResolverOptions
 * @property {string} [type] URL type (ws/http)
 * @property {string} [boolean] Add prefix to URL
 */

/**
 * Resolves an URL
 * @param {CoreConfig} configuration
 */
const urlResolver = configuration => {
  const {http, ws} = configuration;

  /**
   * @param {string} [endpoint='/']
   * @param {URLResolverOptions} [options={}]
   * @param {PackageMetadata} [metadata={}] Metadata for package resolving
   */
  return (endpoint = '/', options = {}, metadata = {}) => {
    if (typeof endpoint !== 'string') {
      return http.public;
    } else if (endpoint.match(/^(http|ws|ftp)s?:/i)) {
      return endpoint;
    }

    const {type, prefix} = {
      type: null,
      prefix: options.type === 'websocket',
      ...options
    };

    const str = type === 'websocket' ? ws.uri : http.uri;

    let url = endpoint.replace(/^\/+/, '');
    if (metadata.type) {
      const path = endpoint.replace(/^\/?/, '/');
      const type = metadata.type === 'theme' ? 'themes' : (
        metadata.type === 'icons' ? 'icons' : 'apps'
      );

      url = `${type}/${metadata.name}${path}`;
    }

    return prefix
      ? str.replace(/\/$/, '') + url.replace(/^\/?/, '/')
      : http.public.replace(/^\/?/, '/') + url;
  };
};


/**
 * @callback SplashCallback
 * @param {Core} core
 * @return {Splash}
 */

/**
 * User Data
 * @typedef {Object} CoreUserData
 * @property {string} username
 * @property {number} [id]
 * @property {string[]} [groups=[]]
 */

/**
 * Core Options
 *
 * @typedef {Object} CoreOptions
 * @property {Element} [root] The root DOM element for elements
 * @property {Element} [resourceRoot] The root DOM element for resources
 * @property {String[]} [classNames] List of class names to apply to root dom element
 * @property {SplashCallback|Splash} [splash] Custom callback function for creating splash screen
 */

/*
 * Core Open File Options
 *
 * @typedef {Object} CoreOpenOptions
 * @property {boolean} [useDefault] Use saved default application preference
 * @property {boolean} [forceDialog] Force application choice dialog on multiple choices
 */

/**
 * Main Core class for OS.js service providers and bootstrapping.
 */
class Core extends CoreBase {

  /**
   * Create core instance
   * @param {CoreConfig} [config={}] Configuration tree
   * @param {CoreOptions} [options={}] Options
   */
  constructor(config = {}, options = {}) {
    options = {
      classNames: ['osjs-root'],
      root: document.body,
      ...options || {}
    };

    super(defaultConfiguration, config, options);

    const $contents = document.createElement('div');
    $contents.className = 'osjs-contents';

    this.logger = instance;

    /**
     * Websocket connection
     * @type {Websocket}
     */
    this.ws = null;

    /**
     * Ping (stay alive) interval
     * @type {number}
     */
    this.ping = null;

    /**
     * Splash instance
     * @type {Splash}
     * @readonly
     */
    this.splash = options.splash ? options.splash(this) : new Splash(this);

    /**
     * Main DOM element
     * @type {Element}
     * @readonly
     */
    this.$root = options.root;

    /**
     * Windows etc DOM element
     * @type {Element}
     * @readonly
     */
    this.$contents = $contents;

    /**
     * Resource script container DOM element
     * @type {Element}
     * @readonly
     */
    this.$resourceRoot = options.resourceRoot || document.querySelector('head');

    /**
     * Default fetch request options
     * @type {Object}
     */
    this.requestOptions = {};

    /**
     * Url Resolver
     * TODO: typedef
     * @type {function(): string}
     * @readonly
     */
    this.urlResolver = urlResolver(this.configuration);

    /**
     * Current user data
     * @type {CoreUserData}
     * @readonly
     */
    this.user = this.config('auth.defaultUserData');

    this.options.classNames.forEach(n => this.$root.classList.add(n));

    const {uri} = this.configuration.ws;
    if (!uri.match(/^wss?:/)) {
      const {protocol, host} = window.location;

      this.configuration.ws.uri = protocol.replace(/^http/, 'ws') + '//' + host + uri.replace(/^\/+/, '/');
    }

    this.splash.init();
  }

  /**
   * Destroy core instance
   * @return {boolean}
   */
  destroy() {
    if (this.destroyed) {
      return Promise.resolve();
    }

    this.emit('osjs/core:destroy');

    this.ping = clearInterval(this.ping);

    Application.destroyAll();

    if (this.ws) {
      this.ws.close();
    }

    if (this.$contents) {
      this.$contents.remove();
      this.$contents = undefined;
    }

    this.user = this.config('auth.defaultUserData');
    this.ws = null;
    this.ping = null;

    return super.destroy();
  }

  /**
   * Boots up OS.js
   * @return {Promise<boolean>}
   */
  boot() {
    const done = e => {
      if (e) {
        instance.error('Error while booting', e);
      }

      console.groupEnd();

      return this.start();
    };

    if (this.booted) {
      return Promise.resolve(false);
    }

    console.group('Core::boot()');

    this.$root.appendChild(this.$contents);
    this._attachEvents();
    this.emit('osjs/core:boot');

    return super.boot()
      .then(() => {
        this.emit('osjs/core:booted');

        if (this.has('osjs/auth')) {
          return this.make('osjs/auth').show(user => {
            const defaultData = this.config('auth.defaultUserData');
            this.user = {
              ...defaultData,
              ...user
            };

            if (this.has('osjs/settings')) {
              this.make('osjs/settings').load()
                .then(() => done())
                .catch(() => done());
            } else {
              done();
            }
          });
        } else {
          instance.debug('OS.js STARTED WITHOUT ANY AUTHENTICATION');
        }

        return done();
      }).catch(done);
  }

  /**
   * Starts all core services
   * @return {Promise<boolean>}
   */
  start() {
    const connect = () => new Promise((resolve, reject) => {
      try {
        const valid = this._createConnection(error => error ? reject(error) : resolve());
        if (valid === false) {
          // We can skip the connection
          resolve();
        }
      } catch (e) {
        reject(e);
      }
    });

    const done = (err) => {
      this.emit('osjs/core:started');

      if (err) {
        instance.warn('Error while starting', err);
      }

      console.groupEnd();

      return !err;
    };

    if (this.started) {
      return Promise.resolve(false);
    }

    console.group('Core::start()');

    this.emit('osjs/core:start');

    this._createListeners();

    return super.start()
      .then(result => {
        console.groupEnd();

        if (result) {
          return connect()
            .then(() => done())
            .catch(err => done(err));
        }

        return false;
      }).catch(done);
  }

  /**
   * Attaches some internal events
   * @private
   */
  _attachEvents() {
    // Attaches sounds for certain events
    this.on('osjs/core:started', () => {
      if (this.has('osjs/sounds')) {
        this.make('osjs/sounds').play('service-login');
      }
    });

    this.on('osjs/core:destroy', () => {
      if (this.has('osjs/sounds')) {
        this.make('osjs/sounds').play('service-logout');
      }
    });

    // Forwards messages to an application from internal websocket
    this.on('osjs/application:socket:message', ({pid, args}) => {
      const found = Application.getApplications()
        .find(proc => proc && proc.pid === pid);

      if (found) {
        found.emit('ws:message', ...args);
      }
    });

    // Sets up a server ping
    this.on('osjs/core:connected', config => {
      const enabled = this.config('http.ping');

      if (enabled) {
        const pingTime = typeof enabled === 'number'
          ? enabled
          : (30 * 60 * 1000);

        this.ping = setInterval(() => {
          if (this.ws) {
            if (this.ws.connected && !this.ws.reconnecting) {
              this.request('/ping').catch(e => instance.warn('Error on ping', e));
            }
          }
        }, pingTime);
      }
    });

    const updateRootLocale = () => {
      try {
        const s = this.make('osjs/settings');
        const l = s.get('osjs/locale', 'language');
        this.$root.setAttribute('data-locale', l);
      } catch (e) {
        console.warn(e);
      }
    };

    this.on('osjs/locale:change', updateRootLocale);
    this.on('osjs/settings:load', updateRootLocale);
    this.on('osjs/settings:save', updateRootLocale);
  }

  /**
   * Creates the main connection to server
   *
   * @private
   * @param {Function} cb Callback function
   * @return {boolean}
   */
  _createConnection(cb) {
    if (this.configuration.standalone || this.configuration.ws.disabled) {
      return false;
    }

    const {uri} = this.config('ws');
    let wasConnected = false;

    instance.debug('Creating websocket connection on', uri);

    this.ws = new Websocket('CoreSocket', uri, {
      interval: this.config('ws.connectInterval', 1000)
    });

    this.ws.once('connected', () => {
      // Allow for some grace-time in case we close prematurely
      setTimeout(() => {
        wasConnected = true;
        cb();
      }, 100);
    });

    this.ws.on('connected', (ev, reconnected) => {
      this.emit('osjs/core:connect', ev, reconnected);
    });

    this.ws.once('failed', ev => {
      if (!wasConnected) {
        cb(new Error('Connection closed'));
        this.emit('osjs/core:connection-failed', ev);
      }
    });

    this.ws.on('disconnected', ev => {
      this.emit('osjs/core:disconnect', ev);
    });

    this.ws.on('message', ev => {
      try {
        const data = JSON.parse(ev.data);
        const params = data.params || [];
        this.emit(data.name, ...params);
      } catch (e) {
        instance.warn('Exception on websocket message', e);
      }
    });

    return true;
  }

  /**
   * Creates event listeners*
   * @private
   */
  _createListeners() {
    const handle = data => {
      const {pid, wid, args} = data;

      const proc = Application.getApplications()
        .find(p => p.pid === pid);

      const win = proc
        ? proc.windows.find(w => w.wid === wid)
        : null;

      if (win) {
        win.emit('iframe:get', ...(args || []));
      }
    };

    window.addEventListener('message', ev => {
      const message = ev.data || {};
      if (message && message.name === 'osjs/iframe:message') {
        handle(...(message.params || []));
      }
    });
  }

  /**
   * Creates an URL based on configured public path
   *
   * If you give a options.type, the URL will be resolved
   * to the correct resource.
   *
   * @param {string} [endpoint=/] Endpoint
   * @param {object} [options] Additional options for resolving url
   * @param {boolean} [options.prefix=false] Returns a full URL complete with scheme, etc. (will always be true on websocket)
   * @param {string} [options.type] Optional URL type (websocket)
   * @param {PackageMetadata} [metadata] A package metadata
   * @return {string}
   */
  url(endpoint = '/', options = {}, metadata = {}) {
    return this.urlResolver(endpoint, options, metadata);
  }


  /**
   * Make a HTTP request
   *
   * This is a wrapper for making a 'fetch' request with some helpers
   * and integration with OS.js
   *
   * @param {string} url The endpoint
   * @param {Options} [options] fetch options
   * @param {string} [type] Request / Response type
   * @param {boolean} [force=false] Force request even when in standalone mode
   * @return {*}
   */
  request(url, options = {}, type = null, force = false) {
    const _ = this.has('osjs/locale')
      ? this.make('osjs/locale').translate
      : t => t;

    if (this.config('standalone') && !force) {
      return Promise.reject(new Error(_('ERR_REQUEST_STANDALONE')));
    }

    if (!url.match(/^((http|ws|ftp)s?:)/i)) {
      url = this.url(url);
      // FIXME: Deep merge
      options = {
        ...options || {},
        ...this.requestOptions || {}
      };
    }

    return fetch(url, options, type)
      .catch(error => {
        instance.warn(error);

        throw new Error(_('ERR_REQUEST_NOT_OK', error));
      });
  }

  /**
   * Create an application from a package
   *
   * @param {string} name Package name
   * @param {{foo: *}} [args] Launch arguments
   * @param {PackageLaunchOptions} [options] Launch options
   * @see {Packages}
   * @return {Promise<Application>}
   */
  run(name, args = {}, options = {}) {
    instance.debug('Core::run()', name, args, options);

    return this.make('osjs/packages').launch(name, args, options);
  }

  /**
   * Spawns an application based on the file given
   * @param {VFSFile} file A file object
   * @param {CoreOpenOptions} [options] Options
   * @return {Boolean|Application}
   */
  open(file, options = {}) {
    if (file.mime === 'osjs/application') {
      return this.run(file.path.split('/').pop());
    }

    const run = app => this.run(app, {file}, options);

    const compatible = this.make('osjs/packages')
      .getCompatiblePackages(file.mime);

    if (compatible.length > 0) {
      if (compatible.length > 1) {
        try {
          this._openApplicationDialog(options, compatible, file, run);

          return true;
        } catch (e) {
          instance.warn('Exception on compability check', e);
        }
      }

      run(compatible[0].name);

      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  /**
   * Wrapper method to create an application choice dialog
   * @private
   */
  _openApplicationDialog(options, compatible, file, run) {
    const _ = this.make('osjs/locale').translate;
    const useDefault = options.useDefault && this.has('osjs/settings');
    const setDefault = name => this.make('osjs/settings')
      .set('osjs/default-application', file.mime, name)
      .save();

    const value = useDefault
      ? this.make('osjs/settings').get('osjs/default-application', file.mime)
      : null;

    const type = useDefault
      ? 'defaultApplication'
      : 'choice';

    const args = {
      title: _('LBL_LAUNCH_SELECT'),
      message: _('LBL_LAUNCH_SELECT_MESSAGE', file.path),
      choices: compatible.reduce((o, i) => ({...o, [i.name]: i.name}), {}),
      value
    };

    if (value && !options.forceDialog) {
      run(value);
    } else {
      this.make('osjs/dialog', type, args, (btn, choice) => {
        if (btn === 'ok') {
          if (type === 'defaultApplication') {
            if (useDefault) {
              setDefault(choice.checked ? choice.value : null);
            }

            run(choice.value);
          } else if (choice) {
            run(choice);
          }
        }
      });
    }
  }

  /**
   * Removes an event handler
   * @param {string} name
   * @param {Function} [callback=null]
   * @param {boolean} [force=false]
   * @return {Core} this
   */
  off(name, callback = null, force = false) {
    if (name.match(/^osjs\//) && typeof callback !== 'function') {
      throw new TypeError('The callback must be a function');
    }

    return super.off(name, callback, force);
  }

  /**
   * Sends a 'broadcast' event with given arguments
   * to all applications matching given filter
   *
   * @param {string|Function} pkg The filter
   * @param {string} name The event name
   * @param {*} ...args Arguments to pass to emit
   * @return {string[]} List of application names emitted to
   */
  broadcast(pkg, name, ...args) {
    const filter = typeof pkg === 'function'
      ? pkg
      : p => p.metadata.name === pkg;


    const apps = Application
      .getApplications()
      .filter(filter);

    return apps.map(proc => {
      proc.emit(name, ...args);

      return proc.name;
    });
  }

  /**
   * Sends a signal to the server over websocket.
   * This will be interpreted as an event in the server core.
   * @param {string} name Event name
   * @param {*} ...params Event callback parameters
   */
  send(name, ...params) {
    return this.ws.send(JSON.stringify({
      name,
      params
    }));
  }

  /**
   * Set the internal fetch/request options
   * @param {object} options Request options
   */
  setRequestOptions(options) {
    this.requestOptions = {...options};
  }

  /**
   * Gets the current user
   * @return {CoreUserData} User object
   */
  getUser() {
    return {...this.user};
  }

  /**
   * Add middleware function to a group
   *
   * @param {string} group Middleware group
   * @param {Function} callback Middleware function to add
   */
  middleware(group, callback) {
    return this.make('osjs/middleware').add(group, callback);
  }

  /**
   * Kills the specified application
   * @param {string|number} match Application name or PID
   */
  kill(match) {
    const apps = Application.getApplications();
    const matcher = typeof match === 'number'
      ? app => app.pid === match
      : app => app.metadata.name === match;

    const found = apps.filter(matcher);
    found.forEach(app => app.destroy());
  }

}


const modifierNames =  ['ctrl', 'shift', 'alt', 'meta'];

/**
 * @typedef {Object} NormalizedEventPosition
 * @property {number} clientX
 * @property {number} clientY
 * @property {boolean} touch
 * @property {Element} target
 */

/**
 * Checks if keycombo matches
 * @param {string} combo Key combo
 * @param {Event} ev Event
 * @return {boolean}
 */
const matchKeyCombo = (combo, ev) => {
  const checkKeys = String(combo).toLowerCase().split('+');
  const keyName = String(ev.key).toLowerCase();
  const validKeypress = checkKeys.every(k => modifierNames.indexOf(k) !== -1
    ? ev[k + 'Key']
    : keyName === k);

  return validKeypress;
};

/**
 * Normalizes event input (position)
 * @param {Event} ev Event
 * @return {NormalizedEventPosition}
 */
const getEvent = (ev) => {
  let {clientX, clientY, target} = ev;
  const touch = ev.touches || ev.changedTouches || [];

  if (touch.length) {
    clientX = touch[0].clientX;
    clientY = touch[0].clientY;
  }

  return {clientX, clientY, touch: touch.length > 0, target};
};

/**
 * Creates a double-tap event handler
 * @param {number} [timeout=250] Timeout
 * @return {Function} Handler with => (ev, cb)
 */
const doubleTap = (timeout = 250) => {
  let tapped = false;
  let timer;

  return (ev, cb) => {
    timer = clearTimeout(timer);
    timer = setTimeout(() => (tapped = false), timeout);

    if (tapped) {
      ev.preventDefault();
      return cb(ev);
    }

    tapped = true;

    return false;
  };
};


/**
 * Get parent directory
 * @param {string} path Directory
 * @return {string} Parent directory
 */
const parentDirectory = path => path
  .replace(/\/$/, '')
  .split('/')
  .filter((item, index, arr) => index < (arr.length - 1))
  .join('/')
  .replace(/(\/+)?$/, '/');

/**
 * Joins paths
 * @param {string[]} args paths
 * @return {string}
 */
const pathJoin = (...args) => args
  .map((str, index) => {
    if (index > 0) {
      str = str.replace(/^\/?/, '');
    }
    return str.replace(/\/?$/, '');
  })
  .join('/');

/*
 * Sort by locale string
 */
const sortString = (k, d) => (a, b) => d === 'asc'
  ? String(a[k]).localeCompare(b[k])
  : String(b[k]).localeCompare(a[k]);

/*
 * Sort by date
 */
const sortDate = (k, d) => (a, b) => d === 'asc'
  ? (new Date(a[k])) > (new Date(b[k]))
  : (new Date(b[k])) > (new Date(a[k]));

/*
 * Sort by educated guess
 */
const sortDefault = (k, d) => (a, b) =>
  (a[k] < b[k])
    ? -1
    : ((a[k] > b[k])
      ? (d === 'asc' ? 1 : 0)
      : (d === 'asc' ? 0 : 1));

/*
 * Sorts an array of files
 */
const sortFn = t => {
  if (t === 'string') {
    return sortString;
  } else if (t === 'date') {
    return sortDate;
  }

  return sortDefault;
};

/*
 * Map of sorters from readdir attributes
 */
const sortMap = {
  size: sortFn('number'),
  mtime: sortFn('date'),
  ctime: sortFn('date'),
  atime: sortFn('date')
};

/**
 * Creates "special" directory entries
 * @param {string} path The path to the readdir root
 * @return {Object[]}
 */
const createSpecials = path => {
  const specials = [];

  const stripped = path.replace(/\/+/g, '/')
    .replace(/^(\w+):/, '') || '/';

  if (stripped !== '/') {
    specials.push({
      isDirectory: true,
      isFile: false,
      mime: null,
      size: 0,
      stat: {},
      filename: '..',
      path: parentDirectory(path) || '/'
    });
  }

  return specials;
};

/**
 * Creates a FileReader (promisified)
 * @param {string} method The method to call
 * @param {ArrayBuffer} ab The ArrayBuffer
 * @param {string} mime The MIME type
 * @return {Promise}
 */
const createFileReader = (method, ab, mime) => new Promise((resolve, reject) => {
  const b = new Blob([ab], {type: mime});
  const r = new FileReader();
  r.onerror = e => reject(e);
  r.onloadend = () => resolve(r.result);
  r[method](b);
});

/**
 * Converts a number (bytez) into human-readable string
 * @param {Number} bytes Input
 * @param {Boolean} [si=false] Use SI units
 * @return {string}
 */
const humanFileSize = (bytes, si = false) => {
  if (isNaN(bytes) || typeof bytes !== 'number') {
    bytes = 0;
  }

  const thresh = si ? 1000 : 1024;
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  if (bytes < thresh) {
    return bytes + ' B';
  }

  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh);

  return `${bytes.toFixed(1)} ${units[u]}`;
};

/**
 * Transforms a readdir result
 * @param {object} root The path to the readdir root
 * @param Object[] files An array of readdir results
 * @param {object} options Options
 * @param {Boolean} [options.showHiddenFiles=false] Show hidden files
 * @param {Function} [options.filter] A filter
 * @param {string} [options.sortBy='filename'] Sort by this attribute
 * @param {string} [options.sortDir='asc'] Sort in this direction
 * @return {Object[]}
 */
const transformReaddir = ({path}, files, options = {}) => {
  options = {
    showHiddenFiles: false,
    sortBy: 'filename',
    sortDir: 'asc',
    ...options
  };

  let {sortDir, sortBy, filter} = options;
  if (typeof filter !== 'function') {
    filter = () => true;
  }

  if (['asc', 'desc'].indexOf(sortDir) === -1) {
    sortDir = 'asc';
  }

  const filterHidden = options.showHiddenFiles
    ? () => true
    : file => file.filename.substr(0, 1) !== '.';

  const sorter = sortMap[sortBy]
    ? sortMap[sortBy]
    : sortFn('string');

  const modify = (file) => ({
    ...file,
    humanSize: humanFileSize(file.size)
  });

  // FIXME: Optimize this to one chain!

  const sortedSpecial = createSpecials(path)
    .sort(sorter(sortBy, sortDir))
    .map(modify);

  const sortedDirectories = files.filter(file => file.isDirectory)
    .sort(sorter(sortBy, sortDir))
    .filter(filterHidden)
    .filter(filter)
    .map(modify);

  const sortedFiles = files.filter(file => !file.isDirectory)
    .sort(sorter(sortBy, sortDir))
    .filter(filterHidden)
    .filter(filter)
    .map(modify);

  return [
    ...sortedSpecial,
    ...sortedDirectories,
    ...sortedFiles
  ];
};

/**
 * Transform an ArrayBuffer
 * @param {ArrayBuffer} ab The ArrayBuffer
 * @param {string} mime The MIME type
 * @param {string} type Transform to this type
 * @return {DOMString|string|Blob|ArrayBuffer}
 */
const transformArrayBuffer = (ab, mime, type) => {
  if (type === 'string') {
    return createFileReader('readAsText', ab, mime);
  } else if (type === 'uri') {
    return createFileReader('readAsDataURL', ab, mime);
  } else if (type === 'blob') {
    return Promise.resolve(new Blob([ab], {type: mime}));
  }

  return Promise.resolve(ab);
};

/**
 * Gets an icon from file stat
 * @param {object} file The file stat object
 * @return {string|object}
 */
const getFileIcon = map => {
  const find = file => {
    const found = Object.keys(map).find(re => {
      const regexp = new RegExp(re);
      return regexp.test(file.mime);
    });

    return found
      ? map[found]
      : {name: 'application-x-executable'};
  };

  return file => file.isDirectory
    ? {name: 'folder'}
    : find(file);
};

/**
 * Creates a file iter for scandir
 * @param {object} stat file stat
 * @return {object}
 */
const createFileIter = stat => ({
  isDirectory: false,
  isFile: true,
  mime: 'application/octet-stream',
  icon: null,
  size: -1,
  path: null,
  filename: null,
  label: null,
  stat: {},
  id: null,
  parent_id: null,
  ...stat
});

/**
 * Get basename of a file
 * @param {string} path The path
 * @return {string}
 */
const basename = path => path.split('/').reverse()[0];

/*
 * Get path of a file
 * @param {string} path The path
 * @return {string}
 */
const pathname = path => {
  const split = path.split('/');
  if (split.length === 2) {
    split[1] = '';
  } else {
    split.splice(split.length - 1, 1);
  }

  return split.join('/');
};

/**
 * Gets prefix from vfs path
 * @param {string} str Input
 * @return {string}
 */
const parseMountpointPrefix = str => {
  const re = /^([\w-_]+):+(.*)/;

  const match = String(str)
    .replace(/\+/g, '/')
    .match(re);

  const [prefix] = Array.from(match || [])
    .slice(1);

  return prefix;
};

/**
 * Filters a mountpoint by user groups
 * @return {boolean}
 */
const filterMountByGroups = userGroups => (mountGroups, strict = true) =>
  mountGroups instanceof Array
    ? mountGroups[strict ? 'every' : 'some'](g => userGroups.indexOf(g) !== -1)
    : true;


/**
 * Creates a list of VFS events to simulate server-side
 * file watching
 * @return {object[]}
 */
const createWatchEvents = (method, args) => {
  const events = [];
  const options = args[args.length - 1] || {};

  const movement = ['move', 'rename', 'copy'].indexOf(method) !== -1;
  const invalid = ['readdir', 'download', 'url', 'exists', 'readfile', 'search', 'stat'].indexOf(method) !== -1;
  const path = i => typeof i === 'string' ? i : i.path;

  if (!invalid) {
    const obj = {
      method,
      source: path(args[0]),
      pid: options.pid
    };

    events.push(['osjs/vfs:directoryChanged', {
      ...obj,
      path: pathname(path(args[0])),
    }]);

    if (movement) {
      events.push(['osjs/vfs:directoryChanged', {
        ...obj,
        path: pathname(path(args[1]))
      }]);
    }
  }

  return events;
};


/**
 * Inverts a HEX color
 * @link https://stackoverflow.com/a/51568508
 * @param {string} hex Color hex code
 * @return {string} Inverted hex code
 */
const invertHex = hex => '#' + hex
  .match(/[a-f0-9]{2}/ig)
  .map(e => (255 - parseInt(e, 16) | 0)
    .toString(16)
    .replace(/^([a-f0-9])$/, '0$1')
  )
  .join('');


const imageDropMimes = [
  'image/png',
  'image/jpe?g',
  'image/webp',
  'image/gif',
  'image/svg(\\+xml)?'
];

/**
 * Check if droppable data is a VFS type
 * @return {boolean}
 */
const validVfsDrop = data => data && data.path;

/**
 * Check if droppable data contains image
 * @return {boolean}
 */
const isDroppingImage = data => validVfsDrop(data) &&
  imageDropMimes.some(re => !!data.mime.match(re));

/**
 * Creates a set of styles based on background settings
 */
const applyBackgroundStyles = (core, background) => {
  const {$root} = core;

  const styles = {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 50%',
    backgroundSize: 'auto',
    backgroundColor: background.color,
    backgroundImage: 'none'
  };

  if (background.style === 'cover' || background.style === 'contain') {
    styles.backgroundSize = background.style;
  } else if (background.style === 'repeat') {
    styles.backgroundRepeat = 'repeat';
  }

  if (background.style !== 'color') {
    if (background.src === undefined) {
      styles.backgroundImage = undefined;
    } else if (typeof background.src === 'string') {
      styles.backgroundImage = `url(${background.src})`;
    } else if (background.src) {
      core.make('osjs/vfs')
        .url(background.src)
        .then(src => {
          setTimeout(() => ($root.style.backgroundImage = `url(${src})`), 1);
        })
        .catch(error => instance.warn('Error while setting wallpaper from VFS', error));
    }
  }

  Object.keys(styles).forEach(k => ($root.style[k] = styles[k]));
};

/**
 * Creates a rectangle with the realestate panels takes up
 */
const createPanelSubtraction = (panel, panels) => {
  const subtraction = {top: 0, left: 0, right: 0, bottom: 0};
  const set = p => (subtraction[p.options.position] = p.$element.offsetHeight);

  if (panels.length > 0) {
    panels.forEach(set);
  } else {
    // Backward compability
    set(panel);
  }

  return subtraction;
};

const isVisible = w => w &&
  !w.getState('minimized') &&
  w.getState('focused');

/*
 * Resolves various resources
 * TODO: Move all of this (and related) stuff to a Theme class
 */
const resourceResolver = (core) => {
  const media = supportedMedia();

  const getThemeName = (type) => {
    const defaultTheme = core.config('desktop.settings.' + type);
    return core.make('osjs/settings').get('osjs/desktop', type, defaultTheme);
  };

  const themeResource = path => {
    const theme = getThemeName('theme');

    return core.url(`themes/${theme}/${path}`); // FIXME: Use metadata ?
  };

  const getSoundThemeName = () => getThemeName('sounds');

  const soundResource = path => {
    if (!path.match(/\.([a-z]+)$/)) {
      const defaultExtension = 'mp3';
      const checkExtensions = ['oga', 'mp3'];
      const found = checkExtensions.find(str => media.audio[str] === true);
      const use = found || defaultExtension;

      path += '.' + use;
    }

    const theme = getSoundThemeName();

    return theme ? core.url(`sounds/${theme}/${path}`) : null; // FIXME: Use metadata ?
  };

  const soundsEnabled = () => !!getSoundThemeName();

  const icon = (name) => {
    name = name.replace(/\.(png|svg|gif)$/, '');
    const {getMetadataFromName} = core.make('osjs/packages');
    const theme = getThemeName('icons');
    const metadata = getMetadataFromName(theme) || {};
    const iconDefinitions = metadata.icons || {};
    const extension = iconDefinitions[name] || 'png';

    return core.url(`icons/${theme}/icons/${name}.${extension}`);
  };

  return {themeResource, soundResource, soundsEnabled, icon};
};


const tapper = doubleTap();

const onDropAction = actions => (ev, data, files, shortcut = true) => {
  if (validVfsDrop(data)) {
    actions.addEntry({entry: data, shortcut});
  } else if (files.length > 0) {
    actions.uploadEntries(files);
  }
};

const createLabelComputer = (core) => {
  const packages = f => core.make('osjs/packages').getPackages(f)[0];
  const translate = n => core.make('osjs/locale').translatableFlat(n);

  return ({filename, mime, label}) => {
    const metadata = (mime === 'osjs/application' ? packages(pkg => (pkg.name === filename)) : null);
    return label || (metadata ? translate(metadata.title) : filename);
  };
};

const isRootElement = ev =>
  ev.target && ev.target.classList.contains('osjs-desktop-iconview__wrapper');

const view = (computeLabel, fileIcon, themeIcon, droppable) => (state, actions) =>
  h('div', {
    class: 'osjs-desktop-iconview__wrapper',
    oncontextmenu: ev => {
      if (isRootElement(ev)) {
        actions.openContextMenu({ev});
      }
    },
    onclick: ev => {
      if (isRootElement(ev)) {
        actions.selectEntry({index: -1});
      }
    },
    oncreate: el => {
      droppable(el, {
        ondrop: (ev, data, files) => {
          const droppedImage = isDroppingImage(data);

          if (droppedImage || (ev.shiftKey && validVfsDrop(data))) {
            actions.openDropContextMenu({ev, data, files});
          } else {
            onDropAction(actions)(ev, data, files);
          }
        }
      });
    }
  }, state.entries.map((entry, index) => {
    return h('div', {
      class: 'osjs-desktop-iconview__entry' + (
        state.selected === index
          ? ' osjs-desktop-iconview__entry--selected'
          : ''
      ),
      oncontextmenu: ev => actions.openContextMenu({ev, entry, index}),
      ontouchstart: ev => tapper(ev, () => actions.openEntry({ev, entry, index})),
      ondblclick: ev => actions.openEntry({ev, entry, index}),
      onclick: ev => actions.selectEntry({ev, entry, index})
    }, [
      h('div', {
        class: 'osjs-desktop-iconview__entry__inner'
      }, [
        h('div', {
          class: 'osjs-desktop-iconview__entry__icon'
        }, [
          h('img', {
            src: entry.icon ? entry.icon : themeIcon(fileIcon(entry).name),
            class: 'osjs-desktop-iconview__entry__icon__icon'
          }),
          entry.shortcut !== false
            ? h('img', {
              src: themeIcon('emblem-symbolic-link'),
              class: 'osjs-desktop-iconview__entry__icon__shortcut'
            })
            : null
        ]),
        h('div', {
          class: 'osjs-desktop-iconview__entry__label'
        }, computeLabel(entry))
      ])
    ]);
  }));

const createShortcuts = (root, readfile, writefile) => {
  const read = () => {
    const filename = pathJoin(root, '.shortcuts.json');

    return readfile(filename)
      .then(contents => JSON.parse(contents))
      .catch(error => ([]));
  };

  const write = shortcuts => {
    const filename = pathJoin(root, '.shortcuts.json');
    const contents = JSON.stringify(shortcuts || []);

    return writefile(filename, contents)
      .catch(() => 0);
  };

  const add = entry => read()
    .then(shortcuts => ([...shortcuts, entry]))
    .then(write);

  const remove = index => read()
    .then(shortcuts => {
      shortcuts.splice(index, 1);
      return shortcuts;
    })
    .then(write);

  return {read, add, remove};
};

const readDesktopFolder = (root, readdir, shortcuts) => {
  const supressError = () => [];

  const read = () => readdir(root, {
    showHiddenFiles: false
  })
    .then(files => files.map(s => ({shortcut: false, ...s})))
    .catch(supressError);

  const readShortcuts = () => shortcuts.read()
    .then(shortcuts => shortcuts.map((s, index) => ({shortcut: index, ...s})))
    .catch(supressError);

  return () => {
    return Promise.all([readShortcuts(), read()])
      .then(results => [].concat(...results));
  };
};

/**
 * Desktop Icon View
 */
class DesktopIconView extends EventEmitter {

  /**
   * @param {Core} core Core reference
   */
  constructor(core) {
    super('DesktopIconView');

    this.core = core;
    this.$root = null;
    this.iconview = null;
    this.root = 'home:/.desktop'; // Default path, changed later
  }

  destroy() {
    if (this.$root && this.$root.parentNode) {
      this.$root.remove();
    }

    this.iconview = null;
    this.$root = null;

    this.emit('destroy');

    super.destroy();
  }

  _render(root) {
    const oldRoot = this.root;
    if (root) {
      this.root = root;
    }

    if (this.$root) {
      if (this.root !== oldRoot) {
        this.iconview.reload();
      }

      return false;
    }

    return true;
  }

  render(root) {
    if (!this._render(root)) {
      return;
    }

    this.$root = document.createElement('div');
    this.$root.className = 'osjs-desktop-iconview';
    this.core.$contents.appendChild(this.$root);

    const {droppable} = this.core.make('osjs/dnd');
    const {icon: fileIcon} = this.core.make('osjs/fs');
    const {icon: themeIcon} = this.core.make('osjs/theme');
    const {copy, readdir, readfile, writefile, unlink, mkdir} = this.core.make('osjs/vfs');
    const error = err => console.error(err);
    const shortcuts = createShortcuts(root, readfile, writefile);
    const read = readDesktopFolder(root, readdir, shortcuts);
    const computeLabel = createLabelComputer(this.core);

    this.iconview = app({
      selected: -1,
      entries: []
    }, {
      setEntries: entries => ({entries}),

      openDropContextMenu: ({ev, data, files, droppedImage}) => {
        this.createDropContextMenu(ev, data, files, droppedImage);
      },

      openContextMenu: ({ev, entry, index}) => {
        if (entry) {
          this.createFileContextMenu(ev, entry);

          return {selected: index};
        } else {
          this.createRootContextMenu(ev);

          return {selected: -1};
        }
      },

      openEntry: ({entry, forceDialog}) => {
        if (entry.isDirectory) {
          this.core.run('FileManager', {
            path: entry
          });
        } else if (entry.mime === 'osjs/application') {
          this.core.run(entry.filename);
        } else {
          this.core.open(entry, {
            useDefault: true,
            forceDialog
          });
        }

        return {selected: -1};
      },

      selectEntry: ({index}) => ({selected: index}),

      uploadEntries: files => {
        // TODO
      },

      addEntry: ({entry, shortcut}) => (state, actions) => {
        const dest = `${root}/${entry.filename}`;

        mkdir(root)
          .catch(() => true)
          .then(() => {
            if (shortcut || entry.mime === 'osjs/application') {
              return shortcuts.add(entry);
            }

            return copy(entry, dest)
              .then(() => actions.reload(true))
              .catch(error);
          })
          .then(() => actions.reload(true));

        return {selected: -1};
      },

      removeEntry: entry => (state, actions) => {
        if (entry.shortcut !== false) {
          shortcuts.remove(entry.shortcut)
            .then(() => actions.reload(true))
            .catch(error);
        } else {
          unlink(entry)
            .then(() => actions.reload(true))
            .catch(error);
        }

        return {selected: -1};
      },

      reload: (fromUI) => (state, actions) => {
        if (fromUI && this.core.config('vfs.watch')) {
          return;
        }

        read()
          .then(entries => entries.filter(e => e.filename !== '..'))
          .then(entries => actions.setEntries(entries));
      }

    }, view(computeLabel, fileIcon, themeIcon, droppable), this.$root);

    this.applySettings();
    this.iconview.reload();
    this._createWatcher();

    this.core.on('osjs/settings:save', () => this.iconview.reload());
  }

  createFileContextMenu(ev, entry) {
    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu: [{
        label: _('LBL_OPEN'),
        onclick: () => this.iconview.openEntry({entry, forceDialog: false})
      }, {
        label: _('LBL_OPEN_WITH'),
        onclick: () => this.iconview.openEntry({entry, forceDialog: true})
      }, {
        label: entry.shortcut !== false ? _('LBL_REMOVE_SHORTCUT') : _('LBL_DELETE'),
        onclick: () => this.iconview.removeEntry(entry)
      }]
    });
  }

  createDropContextMenu(ev, data, files) {
    const desktop = this.core.make('osjs/desktop');
    const _ = this.core.make('osjs/locale').translate;

    const action = shortcut => onDropAction(this.iconview)(ev, data, files, shortcut);

    const menu = [{
      label: _('LBL_COPY'),
      onclick: () => action(false)
    }, {
      label: _('LBL_CREATE_SHORTCUT'),
      onclick: () => action(true)
    }, ...desktop.createDropContextMenu(data)];

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu
    });
  }

  createRootContextMenu(ev) {
    this.core.make('osjs/desktop')
      .openContextMenu(ev);
  }

  _createWatcher() {
    const listener = (args) => {
      const currentPath = String(this.root).replace(/\/$/, '');
      const watchPath = String(args.path).replace(/\/$/, '');
      if (currentPath === watchPath) {
        this.iconview.reload();
      }
    };

    this.core.on('osjs/vfs:directoryChanged', listener);
    this.on('destroy', () => this.core.off('osjs/vfs:directoryChanged', listener));
  }

  applySettings() {
    if (!this.$root) {
      return;
    }

    const settings = this.core
      .make('osjs/settings');

    const defaults = this.core
      .config('desktop.settings');

    const fontColorStyle = settings
      .get('osjs/desktop', 'iconview.fontColorStyle', defaults.iconview.fontColorStyle);

    const fontColor = settings
      .get('osjs/desktop', 'iconview.fontColor', '#ffffff', defaults.iconview.fontColor);

    const backgroundColor = settings
      .get('osjs/desktop', 'background.color', defaults.background.color);

    const styles = {
      system: 'inherit',
      invert: invertHex(backgroundColor),
      custom: fontColor
    };

    this.$root.style.color = styles[fontColorStyle];
  }
}


const createView$1 = (core, fs, icon, _) => {
  const resultView = ({results, index}, actions) => results.map((r, i) => h('li', {
    onclick: () => actions.open(i),
    onupdate: el => {
      if (i === index) {
        el.scrollIntoView();
      }
    },
    class: [
      'osjs-search-result',
      index === i ? 'osjs__active' : ''
    ].join(' ')
  }, [
    h('img', {src: icon(fs.icon(r).name)}),
    h('span', {}, `${r.path} (${r.mime})`)
  ]));

  return (state, actions) => h('div', {
    class: 'osjs-search-container osjs-notification',
    style: {
      display: state.visible ? undefined : 'none'
    }
  }, [
    h('input', {
      type: 'text',
      placeholder: _('LBL_SEARCH_PLACEHOLDER'),
      class: 'osjs-search-input',
      value: state.query,
      onblur: () => {
        if (!state.value) {
          setTimeout(() => actions.toggle(false), 300);
        }
      },
      oninput: ev => actions.setQuery(ev.target.value),
      onkeydown: ev => {
        if (ev.keyCode === 38) { // Up
          actions.setPreviousIndex();
        } else if (ev.keyCode === 40) { // Down
          actions.setNextIndex();
        } else if (ev.keyCode === 27) { // Escape
          actions.resetIndex();

          if (state.index === -1) {
            actions.hide();
          }
        }
      },
      onkeypress: ev => {
        if (ev.keyCode === 13) {
          if (state.index >= 0) {
            actions.open(state.index);
          } else {
            actions.search(state.query.replace(/\*?$/, '*').replace(/^\*?/, '*'));
          }
        }
      }
    }),
    h('div', {
      'data-error': !!state.error,
      class: 'osjs-search-message',
      style: {
        display: (state.error || state.status) ? 'block' : 'none'
      }
    }, state.error || state.status),
    h('ol', {
      class: 'osjs-search-results',
      style: {
        display: state.results.length ? undefined : 'none'
      }
    }, resultView(state, actions))
  ]);
};

/**
 * Search UI Adapter
 */
const create$1 = (core, $element) => {
  const _ = core.make('osjs/locale').translate;
  const fs = core.make('osjs/fs');
  const {icon} = core.make('osjs/theme');
  const view = createView$1(core, fs, icon, _);
  const ee = new EventEmitter('SearchUI');

  const hyperapp = app({
    query: '',
    index: -1,
    status: undefined,
    error: null,
    visible: false,
    results: []
  }, {
    search: query => {
      ee.emit('search', query);

      return {status: _('LBL_SEARCH_WAIT')};
    },
    open: index => (state, actions) => {
      const iter = state.results[index];
      if (iter) {
        ee.emit('open', iter);
      }

      actions.toggle(false);
    },
    resetIndex: () => () => ({
      index: -1
    }),
    setNextIndex: () => state => ({
      index: (state.index + 1) % state.results.length
    }),
    setPreviousIndex: () => state => ({
      index: state.index <= 0 ? state.results.length - 1 : state.index - 1
    }),
    setError: error => () => ({
      error,
      status: undefined,
      index: -1
    }),
    setResults: results => () => ({
      results,
      index: -1,
      status: _('LBL_SEARCH_RESULT', results.length),
    }),
    setQuery: query => () => ({
      query
    }),
    hide: () => {
      ee.emit('hide');
    },
    toggle: visible => state => ({
      query: '',
      results: [],
      index: -1,
      status: undefined,
      error: null,
      visible: typeof visible === 'boolean' ? visible : !state.visible
    })
  }, view, $element);

  ee.on('error', error => hyperapp.setError(error));
  ee.on('success', results => hyperapp.setResults(results));
  ee.on('toggle', toggle => hyperapp.toggle(toggle));
  ee.on('focus', () => {
    const el = $element.querySelector('.osjs-search-input');
    if (el) {
      el.focus();
    }
  });

  return ee;
};

class VFSSearchAdapter {
  constructor(core) {
    this.core = core;
  }

  destroy() {
  }

  async init() {
  }

  async search(pattern) {
    const vfs = this.core.make('osjs/vfs');
    const promises = this.core.make('osjs/fs')
      .mountpoints()
      .map(mount => `${mount.name}:/`)
      .map(path => {
        return vfs.search({path}, pattern)
          .catch(error => {
            instance.warn('Error while searching', error);
            return [];
          });
      });
    return Promise.all(promises)
      .then(lists => [].concat(...lists));
  }
}


/**
 * Search Service
 */
class Search {
  /**
   * Create Search instance
   * @param {Core} core Core reference
   */
  constructor(core, options) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Wired actions
     * @type {Object}
     */
    this.ui = null;

    /**
     * Last focused window
     * @type {Window}
     */
    this.focusLastWindow = null;

    /**
     * Search root DOM element
     * @type {Element}
     * @readonly
     */
    this.$element = document.createElement('div');
    const providedAdapters = options.adapters || [];
    const useAdapters = [VFSSearchAdapter, ...providedAdapters];
    this.adapters = useAdapters.map(A => new A(core));
  }

  /**
   * Destroy Search instance
   */
  destroy() {
    if (this.ui) {
      this.ui.destroy();
    }
  }

  /**
   * Initializes Search Service
   */
  async init() {
    const {icon} = this.core.make('osjs/theme');
    const _ = this.core.make('osjs/locale').translate;

    this.$element.className = 'osjs-search';
    this.core.$root.appendChild(this.$element);

    this.core.make('osjs/tray').create({
      title: _('LBL_SEARCH_TOOLTOP', 'F3'),
      icon: icon('system-search')
    }, () => this.show());

    this.ui = create$1(this.core, this.$element);
    this.ui.on('hide', () => this.hide());
    this.ui.on('open', iter => this.core.open(iter));
    this.ui.on('search', query => {
      this.search(query)
        .then(results => this.ui.emit('success', results))
        .catch(error => this.ui.emit('error', error));
    });
    await Promise.all(this.adapters.map(a => a.init()));
  }

  /**
   * Performs a search across all mounts
   * @param {string} pattern Search query
   * @return {Promise<FileMetadata[]>}
   */
  async search(pattern) {
    const results = await Promise.all(this.adapters.map(a => a.search(pattern)));
    return results.flat(1);
  }

  /**
   * Focuses UI
   */
  focus() {
    if (this.ui) {
      this.ui.emit('focus');
    }
  }

  /**
   * Hides UI
   */
  hide() {
    if (this.ui) {
      this.ui.emit('toggle', false);

      const win = Window.lastWindow();
      if (this.focusLastWindow && win) {
        win.focus();
      }
    }
  }

  /**
   * Shows UI
   */
  show() {
    if (this.ui) {
      const win = Window.lastWindow();

      this.focusLastWindow = win && win.blur();

      this.ui.emit('toggle', true);
      setTimeout(() => this.focus(), 1);
    }
  }
}


/**
 * TODO: typedef
 * @typedef {Object} DesktopContextMenuEntry
 */

/**
 * @typedef {Object} DesktopIconViewSettings
 */

/**
 * TODO: typedef
 * @typedef {Object} DesktopSettings
 * @property {DesktopIconViewSettings} [iconview]
 */

/**
 * Desktop Options
 *
 * @typedef {Object} DeskopOptions
 * @property {object[]} [contextmenu={}] Default Context menu items
 */

/**
 * Desktop Viewport Rectangle
 *
 * @typedef {Object} DesktopViewportRectangle
 * @property {number} left
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 */

/**
 * Desktop Class
 */
class Desktop extends EventEmitter {

  /**
   * Create Desktop
   *
   * @param {Core} core Core reference
   * @param {DesktopOptions} [options={}] Options
   */
  constructor(core, options = {}) {
    super('Desktop');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Desktop Options
     * @type {DeskopOptions}
     * @readonly
     */
    this.options = {
      contextmenu: [],
      ...options
    };

    /**
     * Theme DOM elements
     * @type {Element[]}
     */
    this.$theme = [];

    /**
     * Icon DOM elements
     * @type {Element[]}
     */
    this.$icons = [];

    /**
     * Default context menu entries
     * @type {DesktopContextMenuEntry[]}
     */
    this.contextmenuEntries = [];

    /**
     * Search instance
     * @type {Search|null}
     * @readonly
     */
    this.search = core.config('search.enabled') ? new Search(core, options.search || {}) : null;

    /**
     * Icon View instance
     * @type {DesktopIconView}
     * @readonly
     */
    this.iconview = new DesktopIconView(this.core);

    /**
     * Keyboard context dom element
     * @type {Element|null}
     */
    this.keyboardContext = null;

    /**
     * Desktop subtraction rectangle
     * TODO: typedef
     * @type {DesktopViewportRectangle}
     */
    this.subtract = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
  }

  /**
   * Destroy Desktop
   */
  destroy() {
    if (this.search) {
      this.search = this.search.destroy();
    }

    if (this.iconview) {
      this.iconview.destroy();
    }

    this._removeIcons();
    this._removeTheme();

    super.destroy();
  }

  /**
   * Initializes Desktop
   */
  init() {
    this.initConnectionEvents();
    this.initUIEvents();
    this.initDragEvents();
    this.initKeyboardEvents();
    this.initGlobalKeyboardEvents();
    this.initMouseEvents();
    this.initBaseEvents();
    this.initLocales();
    this.initDeveloperTray();
  }

  /**
   * Initializes connection events
   */
  initConnectionEvents() {
    this.core.on('osjs/core:disconnect', ev => {
      instance.warn('Connection closed', ev);

      const _ = this.core.make('osjs/locale').translate;
      this.core.make('osjs/notification', {
        title: _('LBL_CONNECTION_LOST'),
        message: _('LBL_CONNECTION_LOST_MESSAGE')
      });
    });

    this.core.on('osjs/core:connect', (ev, reconnected) => {
      instance.debug('Connection opened');

      if (reconnected) {
        const _ = this.core.make('osjs/locale').translate;
        this.core.make('osjs/notification', {
          title: _('LBL_CONNECTION_RESTORED'),
          message: _('LBL_CONNECTION_RESTORED_MESSAGE')
        });
      }
    });

    this.core.on('osjs/core:connection-failed', (ev) => {
      instance.warn('Connection failed');

      const _ = this.core.make('osjs/locale').translate;
      this.core.make('osjs/notification', {
        title: _('LBL_CONNECTION_FAILED'),
        message: _('LBL_CONNECTION_FAILED_MESSAGE')
      });
    });
  }

  /**
   * Initializes user interface events
   */
  initUIEvents() {
    this.core.on(['osjs/panel:create', 'osjs/panel:destroy'], (panel, panels = []) => {
      this.subtract = createPanelSubtraction(panel, panels);

      try {
        this._updateCSS();
        this._clampWindows();
      } catch (e) {
        instance.warn('Panel event error', e);
      }

      this.core.emit('osjs/desktop:transform', this.getRect());
    });

    this.core.on('osjs/window:transitionend', (...args) => {
      this.emit('theme:window:transitionend', ...args);
    });

    this.core.on('osjs/window:change', (...args) => {
      this.emit('theme:window:change', ...args);
    });
  }

  /**
   * Initializes development tray icons
   */
  initDeveloperTray() {
    if (!this.core.config('development')) {
      return;
    }

    // Creates tray
    const tray = this.core.make('osjs/tray').create({
      title: 'OS.js developer tools'
    }, (ev) => this.onDeveloperMenu(ev));

    this.core.on('destroy', () => tray.destroy());
  }

  /**
   * Initializes drag-and-drop events
   */
  initDragEvents() {
    const {droppable} = this.core.make('osjs/dnd');

    droppable(this.core.$contents, {
      strict: true,
      ondrop: (ev, data, files) => {
        const droppedImage = isDroppingImage(data);
        if (droppedImage) {
          this.onDropContextMenu(ev, data);
        }
      }
    });
  }

  /**
   * Initializes keyboard events
   */
  initKeyboardEvents() {
    const forwardKeyEvent = (n, e) => {
      const w = Window.lastWindow();
      if (isVisible(w)) {
        w.emit(n, e, w);
      }
    };

    const isWithinContext = (target) => this.keyboardContext &&
      this.keyboardContext.contains(target);

    const isWithinWindow = (w, target) => w &&
      w.$element.contains(target);

    const isWithin = (w, target) => isWithinWindow(w, target) ||
      isWithinContext(target);

    ['keydown', 'keyup', 'keypress'].forEach(n => {
      this.core.$root.addEventListener(n, e => forwardKeyEvent(n, e));
    });

    this.core.$root.addEventListener('keydown', e => {
      if (!e.target) {
        return;
      }

      if (e.keyCode === 114) { // F3
        e.preventDefault();

        if (this.search) {
          this.search.show();
        }
      } else if (e.keyCode === 9) { // Tab
        const {tagName} = e.target;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].indexOf(tagName) !== -1;
        const w = Window.lastWindow();

        if (isWithin(w, e.target)) {
          if (isInput) {
            if (tagName === 'TEXTAREA') {
              handleTabOnTextarea(e);
            }
          } else {
            e.preventDefault();
          }
        } else {
          e.preventDefault();
        }
      }
    });
  }

  /**
   * Initializes global keyboard events
   */
  initGlobalKeyboardEvents() {
    let keybindings = [];

    const defaults = this.core.config('desktop.settings.keybindings', {});

    const reload = () => {
      keybindings = this.core.make('osjs/settings')
        .get('osjs/desktop', 'keybindings', defaults);
    };

    window.addEventListener('keydown', ev => {
      Object.keys(keybindings).some(eventName => {
        const combo = keybindings[eventName];
        const result = matchKeyCombo(combo, ev);
        if (result) {
          this.core.emit('osjs/desktop:keybinding:' + eventName, ev);
        }
      });
    });

    this.core.on('osjs/settings:load', reload);
    this.core.on('osjs/settings:save', reload);
    this.core.on('osjs/core:started', reload);

    const closeBindingName = 'osjs/desktop:keybinding:close-window';
    const closeBindingCallback = () => {
      const w = Window.lastWindow();
      if (isVisible(w)) {
        w.close();
      }
    };
    this.core.on(closeBindingName, closeBindingCallback);
  }

  /**
   * Initializes mouse events
   */
  initMouseEvents() {
    // Custom context menu
    this.core.$contents.addEventListener('contextmenu', ev => {
      if (ev.target === this.core.$contents) {
        this.onContextMenu(ev);
      }
    });

    // A hook to prevent iframe events when dragging mouse
    window.addEventListener('mousedown', () => {
      let moved = false;

      const onmousemove = () => {
        if (!moved) {
          moved = true;

          this.core.$root.setAttribute('data-mousemove', String(true));
        }
      };

      const onmouseup = () => {
        moved = false;

        this.core.$root.setAttribute('data-mousemove', String(false));
        window.removeEventListener('mousemove', onmousemove);
        window.removeEventListener('mouseup', onmouseup);
      };

      window.addEventListener('mousemove', onmousemove);
      window.addEventListener('mouseup', onmouseup);
    });
  }

  /**
   * Initializes base events
   */
  initBaseEvents() {
    // Resize hook
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        this._updateCSS();
        this._clampWindows(true);
      }, 200);
    });

    // Prevent navigation
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', () => {
      history.pushState(null, null, document.URL);
    });

    // Prevents background scrolling on iOS
    this.core.$root.addEventListener('touchmove', e => e.preventDefault());
  }

  /**
   * Initializes locales
   */
  initLocales() {
    // Right-to-left support triggers
    const rtls = this.core.config('locale.rtl');
    const checkRTL = () => {
      const locale = this.core.make('osjs/locale')
        .getLocale()
        .split('_')[0]
        .toLowerCase();

      const isRtl = rtls.indexOf(locale) !== -1;
      this.core.$root.setAttribute('data-dir', isRtl ? 'rtl' : 'ltr');
    };
    this.core.on('osjs/settings:load', checkRTL);
    this.core.on('osjs/settings:save', checkRTL);
    this.core.on('osjs/core:started', checkRTL);
  }

  /**
   * Starts desktop services
   */
  start() {
    if (this.search) {
      this.search.init();
    }

    this._updateCSS();
  }

  /**
   * Update CSS
   * @private
   */
  _updateCSS() {
    const mobile = this.core.config('windows.mobile');
    const isMobile = !mobile ? false : this.core.$root.offsetWidth <= mobile;
    this.core.$root.setAttribute('data-mobile', isMobile);

    if (this.core.$contents) {
      this.core.$contents.style.top = `${this.subtract.top}px`;
      this.core.$contents.style.left = `${this.subtract.left}px`;
      this.core.$contents.style.right = `${this.subtract.right}px`;
      this.core.$contents.style.bottom = `${this.subtract.bottom}px`;
    }
  }

  _clampWindows(resize) {
    if (resize && !this.core.config('windows.clampToViewport')) {
      return;
    }

    Window.getWindows().forEach(w => w.clampToViewport());
  }

  /**
   * Adds something to the default contextmenu entries
   * @param {DesktopContextMenuEntry[]} entries
   */
  addContextMenu(entries) {
    this.contextmenuEntries = this.contextmenuEntries.concat(entries);
  }

  /**
   * Applies settings and updates desktop
   * @param {DesktopSettings} [settings] Use this set instead of loading from settings
   * @return {DesktopSettings} New settings
   */
  applySettings(settings) {
    const lockSettings = this.core.config('desktop.lock');
    const defaultSettings = this.core.config('desktop.settings');
    let newSettings;

    if (lockSettings) {
      newSettings = defaultSettings;
    } else {
      const userSettings = settings
        ? settings
        : this.core.make('osjs/settings').get('osjs/desktop');

      newSettings = merge(defaultSettings, userSettings, {
        arrayMerge: (dest, source) => source
      });
    }

    const applyOverlays = (test, list) => {
      if (this.core.has(test)) {
        const instance = this.core.make(test);
        instance.removeAll();
        list.forEach(item => instance.create(item));
      }
    };

    const applyCss = ({font, background}) => {
      this.core.$root.style.fontFamily = `${font}, sans-serif`;

      applyBackgroundStyles(this.core, background);

    };

    applyCss(newSettings);

    // TODO: Multiple panels
    applyOverlays('osjs/panels', (newSettings.panels || []).slice(-1));
    applyOverlays('osjs/widgets', newSettings.widgets);

    this.applyTheme(newSettings.theme);
    this.applyIcons(newSettings.icons);

    this.applyIconView(newSettings.iconview);

    this.core.emit('osjs/desktop:applySettings');

    return {...newSettings};
  }

  /**
   * Removes current style theme from DOM
   * @private
   */
  _removeTheme() {
    this.emit('theme:destroy');

    this.off([
      'theme:init',
      'theme:destroy',
      'theme:window:change',
      'theme:window:transitionend'
    ]);

    this.$theme.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });

    this.$theme = [];
  }

  /**
   * Removes current icon theme from DOM
   * @private
   */
  _removeIcons() {
    this.$icons.forEach(el => {
      if (el && el.parentNode) {
        el.remove();
      }
    });

    this.$icons = [];
  }

  /**
   * Adds or removes the icon view
   * @param {DesktopIconViewSettings} settings
   */
  applyIconView(settings) {
    if (!this.iconview) {
      return;
    }

    if (settings.enabled) {
      this.iconview.render(settings.path);
    } else {
      this.iconview.destroy();
    }
  }

  /**
   * Sets the current icon theme from settings
   * @param {string} name Icon theme name
   * @return {Promise<undefined>}
   */
  applyIcons(name) {
    name = name || this.core.config('desktop.icons');

    return this._applyTheme(name)
      .then(({elements, errors, callback, metadata}) => {
        this._removeIcons();

        this.$icons = Object.values(elements);

        this.emit('icons:init');
      });
  }

  /**
   * Sets the current style theme from settings
   * @param {string} name Theme name
   * @return {Promise<undefined>}
   */
  applyTheme(name) {
    name = name || this.core.config('desktop.theme');

    return this._applyTheme(name)
      .then(({elements, errors, callback, metadata}) => {
        this._removeTheme();

        if (callback && metadata) {
          try {
            callback(this.core, this, {}, metadata);
          } catch (e) {
            instance.warn('Exception while calling theme callback', e);
          }
        }

        this.$theme = Object.values(elements);

        this.emit('theme:init');
      });
  }

  /**
   * Apply theme wrapper
   * @private
   * @param {string} name Theme name
   * @return {Promise<undefined>}
   */
  _applyTheme(name) {
    return this.core.make('osjs/packages')
      .launch(name)
      .then(result => {
        if (result.errors.length) {
          instance.error(result.errors);
        }

        return result;
      });
  }

  /**
   * Apply settings by key
   * @private
   * @param {string} k Key
   * @param {*} v Value
   * @return {Promise<boolean>}
   */
  _applySettingsByKey(k, v) {
    return this.core.make('osjs/settings')
      .set('osjs/desktop', k, v)
      .save()
      .then(() => this.applySettings());
  }

  /**
   * Create drop context menu entries
   * @param {Object} data Drop data
   * @return {Object[]}
   */
  createDropContextMenu(data) {
    const _ = this.core.make('osjs/locale').translate;
    const settings = this.core.make('osjs/settings');
    const desktop = this.core.make('osjs/desktop');
    const droppedImage = isDroppingImage(data);
    const menu = [];

    const setWallpaper = () => settings
      .set('osjs/desktop', 'background.src', data)
      .save()
      .then(() => desktop.applySettings());

    if (droppedImage) {
      menu.push({
        label: _('LBL_DESKTOP_SET_AS_WALLPAPER'),
        onclick: setWallpaper
      });
    }

    return menu;
  }

  /**
   * When developer menu is shown
   * @param {Event} ev
   */
  onDeveloperMenu(ev) {
    const _ = this.core.make('osjs/locale').translate;
    const s = this.core.make('osjs/settings').get();

    const storageItems = Object.keys(s)
      .map(k => ({
        label: k,
        onclick: () => {
          this.core.make('osjs/settings')
            .clear(k)
            .then(() => this.applySettings());
        }
      }));

    this.core.make('osjs/contextmenu').show({
      position: ev,
      menu: [
        {
          label: _('LBL_KILL_ALL'),
          onclick: () => Application.destroyAll()
        },
        {
          label: _('LBL_APPLICATIONS'),
          items: Application.getApplications().map(proc => ({
            label: `${proc.metadata.name} (${proc.pid})`,
            items: [
              {
                label: _('LBL_KILL'),
                onclick: () => proc.destroy()
              },
              {
                label: _('LBL_RELOAD'),
                onclick: () => proc.relaunch()
              }
            ]
          }))
        },
        {
          label: 'Clear Storage',
          items: storageItems
        }
      ]
    });
  }

  /**
   * When drop menu is shown
   * @param {Event} ev
   * @param {Object} data
   */
  onDropContextMenu(ev, data) {
    const menu = this.createDropContextMenu(data);

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu
    });
  }

  /**
   * When context menu is shown
   * @param {Event} ev
   */
  onContextMenu(ev) {
    const lockSettings = this.core.config('desktop.lock');
    const extras = [].concat(...this.contextmenuEntries.map(e => typeof e === 'function' ? e() : e));
    const config = this.core.config('desktop.contextmenu');
    const hasIconview = this.core.make('osjs/settings').get('osjs/desktop', 'iconview.enabled');

    if (config === false || config.enabled === false) {
      return;
    }

    const useDefaults = config === true || config.defaults; // NOTE: Backward compability

    const _ = this.core.make('osjs/locale').translate;
    const __ = this.core.make('osjs/locale').translatableFlat;

    const themes = this.core.make('osjs/packages')
      .getPackages(p => p.type === 'theme');

    const defaultItems = lockSettings ? [] : [{
      label: _('LBL_DESKTOP_SELECT_WALLPAPER'),
      onclick: () => {
        this.core.make('osjs/dialog', 'file', {
          mime: ['^image']
        }, (btn, file) => {
          if (btn === 'ok') {
            this._applySettingsByKey('background.src', file);
          }
        });
      }
    }, {
      label: _('LBL_DESKTOP_SELECT_THEME'),
      items: themes.map(t => ({
        label: __(t.title, t.name),
        onclick: () => {
          this._applySettingsByKey('theme', t.name);
        }
      }))
    }];

    if (hasIconview && this.iconview) {
      defaultItems.push({
        label: _('LBL_REFRESH'),
        onclick: () => this.iconview.iconview.reload()
      });
    }

    const base = useDefaults === 'function'
      ? config.defaults(this, defaultItems)
      : (useDefaults ? defaultItems : []);

    const provided = typeof this.options.contextmenu === 'function'
      ? this.options.contextmenu(this, defaultItems)
      : this.options.contextmenu || [];

    const menu = [
      ...base,
      ...provided,
      ...extras
    ];

    if (menu.length) {
      this.core.make('osjs/contextmenu').show({
        menu,
        position: ev
      });
    }
  }

  /**
   * Sets the keyboard context.
   *
   * Used for tabbing and other special events
   *
   * @param {Element} [ctx]
   */
  setKeyboardContext(ctx) {
    this.keyboardContext = ctx;
  }

  /**
   * Gets the rectangle of available space
   *
   * This is based on any panels etc taking up space
   *
   * @return {DesktopViewportRectangle}
   */
  getRect() {
    const root = this.core.$root;
    // FIXME: Is this now wrong because panels are not on the root anymore ?!
    const {left, top, right, bottom} = this.subtract;
    const width = root.offsetWidth - left - right;
    const height = root.offsetHeight - top - bottom;

    return {width, height, top, bottom, left, right};
  }
}


/**
 * Notification Options
 *
 * @typedef {Object} NotificationOptions
 * @property {string} title Title
 * @property {string} message Message
 * @property {string} [sound=message] Sound to play
 * @property {string} [icon] Icon source
 * @property {number} [timeout=5000] Timeout value (0=infinite)
 * @property {string} [className] Adds a DOM class name to notification
 */

/**
 * Notification Implementation
 */
class Notification {

  /**
   * Create notification
   *
   * @param {Core} core Core reference
   * @param {Element} root Root DOM element
   * @param {NotificationOptions} options Options
   */
  constructor(core, root, options = {}) {
    const defaultLabel = core.make('osjs/locale')
      .translate('LBL_NOTIFICATION');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Root node reference
     * @type {Element}
     * @readonly
     */
    this.$root = root;

    /**
     * Notification DOM node
     * @type {Element}
     * @readonly
     */
    this.$element = document.createElement('div');

    /**
     * The notification destruction state
     * @type {Boolean}
     * @readonly
     */
    this.destroyed = false;

    /**
     * Options
     * @type {NotificationOptions}
     * @readonly
     */
    this.options = {
      icon: null,
      title: defaultLabel,
      message: defaultLabel,
      timeout: 5000,
      native: core.config('notifications.native', false),
      sound: 'message',
      className: '',
      ...options
    };

    this.core.emit('osjs/notification:create', this);
  }

  /**
   * Destroy notification
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.core.emit('osjs/notification:destroy', this);

    this.$element.remove();
    this.$element = null;
    this.$root = null;
  }

  /**
   * Render notification
   * @return {Promise<boolean>}
   */
  render() {
    const onclick = () => this.destroy();

    const renderCustom = () => {
      const view = state => h('div', {
        class: 'osjs-notification-wrapper',
        'data-has-icon': !!state.icon,
        style: {
          backgroundImage: state.icon ? `url(${state.icon})` : undefined
        }
      }, [
        h('div', {class: 'osjs-notification-title'}, state.title),
        h('div', {class: 'osjs-notification-message'}, state.message),
      ]);

      this.$element.classList.add('osjs-notification');
      if (this.options.className) {
        this.$element.classList.add(this.options.className);
      }

      if (this.options.timeout) {
        setTimeout(() => this.destroy(), this.options.timeout);
      }

      this.$element.addEventListener('click', onclick);

      this.$root.appendChild(this.$element);

      app(this.options, {}, view, this.$element);

      return Promise.resolve(true);
    };

    if (this.options.native) {
      return createNativeNotification(this.options, onclick)
        .catch(err => {
          instance.warn('Error on native notification', err);
          return renderCustom();
        });
    }

    if (this.options.sound) {
      this.core.make('osjs/sounds')
        .play(this.options.sound);
    }

    return renderCustom();
  }

}


/**
 * Notification Factory
 */
class Notifications {

  /**
   * @param {Core} core OS.js Core instance reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * @type {Element}
     */
    this.$element = null;
  }

  /**
   * Destroy notification handler
   */
  destroy() {
    this.$element.remove();
    this.$element = null;
  }

  /**
   * Initialize notification handler
   */
  init() {
    this.$element = document.createElement('div');
    this.$element.classList.add('osjs-notifications');
    this.core.$root.appendChild(this.$element);

    this.core.on('osjs/desktop:applySettings', () => {
      this.setElementStyles();
    });

    this.setElementStyles();
  }

  /**
   * Create a new notification
   * @param {NotificationOptions} options See notification class for options
   * @return {Notification}
   */
  create(options) {
    if (!options) {
      throw new Error('Notification options not given');
    }

    const notification = new Notification(this.core, this.$element, options);
    notification.render();
    return notification;
  }

  /**
   * Sets the element styles
   */
  setElementStyles() {
    const styles = createCssText(this.createElementStyles());
    this.$element.style.cssText = styles;
  }

  /**
   * Creates a new CSS style object
   * @return {{property: string}}
   */
  createElementStyles() {
    const defaultPosition = this.core
      .config('desktop.settings.notifications.position', 'top-right');

    const position = this.core.make('osjs/settings')
      .get('osjs/desktop', 'notifications.position', defaultPosition);

    if (position.split('-').length !== 2) {
      return {};
    }

    return ['left', 'right', 'top', 'bottom']
      .reduce((carry, key) => ({
        [key]: position.indexOf(key) === -1 ? 'auto' : '0',
        ...carry
      }), {});
  }
}


const isPassive = supportsPassive();
const touchArg = isPassive ? {passive: true} : false;

/*
 * Map of available "actions"
 */
const actionMap = {
  maximize: (win) => win.maximize() ? null : win.restore(),
  minimize: (win) => win.minimize(),
  close: (win) => win.close()
};

/**
 * Default Window Behavior
 *
 * Controls certain events and their interaction with a window
 */
class WindowBehavior {
  /**
   * Create window behavior
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Last action
     * @type {string}
     */
    this.lastAction = null;

    /**
     * LoFi DOM Element
     * @type {Element}
     * @readonly
     */
    this.$lofi = document.createElement('div');
    this.$lofi.className = 'osjs-window-behavior-lofi';
  }

  /**
   * Initializes window behavior
   * @param {Window} win Window reference
   */
  init(win) {
    const ontouchstart = ev => this.mousedown(ev, win);
    const onmousedown = ev => this.mousedown(ev, win);
    const onclick = ev => this.click(ev, win);
    const ondblclick = ev => this.dblclick(ev, win);

    const onicondblclick = ev => {
      ev.stopPropagation();
      ev.preventDefault();
      this.iconDblclick(ev, win);
    };

    const oniconclick = ev => {
      ev.stopPropagation();
      ev.preventDefault();

      this.iconClick(ev, win);
    };

    const ontrasitionend = ev => {
      if (win) {
        win.emit('transitionend');
      }

      this.core.emit('osjs/window:transitionend', ev, win);
    };

    win.$element.addEventListener('touchstart', ontouchstart, touchArg);
    win.$element.addEventListener('mousedown', onmousedown);
    win.$element.addEventListener('click', onclick);
    win.$element.addEventListener('dblclick', ondblclick);
    win.$element.addEventListener('transitionend', ontrasitionend);

    if (win.$icon) {
      win.$icon.addEventListener('dblclick', onicondblclick);
      win.$icon.addEventListener('click', oniconclick);
    }

    win.on('resized,rendered', () => {
      win.setState('media', getMediaQueryName(win));
    });

    win.on('destroy', () => {
      if (win.$element) {
        win.$element.removeEventListener('touchstart', ontouchstart, touchArg);
        win.$element.removeEventListener('mousedown', onmousedown);
        win.$element.removeEventListener('click', onclick);
        win.$element.removeEventListener('dblclick', ondblclick);
        win.$element.removeEventListener('transitionend', ontrasitionend);
      }

      if (win.$icon) {
        win.$icon.removeEventListener('dblclick', onicondblclick);
        win.$icon.removeEventListener('click', oniconclick);
      }
    });

    const rect = {top: 0, left: 0};
    const {top, left} = getCascadePosition(win, rect, win.state.position);
    win.state.position.top = top;
    win.state.position.left = left;
    win.state.media = getMediaQueryName(win);
  }

  /**
   * Handles Mouse Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  click(ev, win) {
    if (this.lastAction) {
      return;
    }

    const target = ev.target;
    const hitButton = target.classList.contains('osjs-window-button');

    if (hitButton) {
      const action =  ev.target.getAttribute('data-action');
      actionMap[action](win);
    }
  }

  /**
   * Handles Mouse Double Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  dblclick(ev, win) {
    if (this.lastAction) {
      return;
    }

    const target = ev.target;
    const hitTitle = target.classList.contains('osjs-window-header');

    if (hitTitle) {
      if (win.state.maximized) {
        win.restore();
      } else if (win.state.minimized) {
        win.raise();
      } else {
        win.maximize();
      }
    }
  }

  /**
   * Handles Mouse Down Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  mousedown(ev, win) {
    let attributeSet = false;

    const {moveable, resizable} = win.attributes;
    const {maximized} = win.state;
    const {lofi, moveKeybinding} = this.core.config('windows');
    const {clientX, clientY, touch, target} = getEvent(ev);

    const checkMove = matchKeyCombo(moveKeybinding, ev)
      ? win.$element.contains(target)
      : target.classList.contains('osjs-window-header');

    const rect = this.core.has('osjs/desktop')
      ? this.core.make('osjs/desktop').getRect()
      : {top: 0, left: 0};

    const resize = target.classList.contains('osjs-window-resize')
      ? resizer(win, target)
      : null;

    const move = checkMove
      ? mover(win, {top: 0, left: 0})
      : null;

    let actionCallback;

    const mousemove = (ev) => {
      if (!isPassive) {
        ev.preventDefault();
      }

      if (maximized || (!moveable && move) || (!resizable && resize)) {
        return;
      }

      const transformedEvent = getEvent(ev);
      const posX = resize ? Math.max(rect.left, transformedEvent.clientX) : transformedEvent.clientX;
      const posY = resize ? Math.max(rect.top, transformedEvent.clientY) : transformedEvent.clientY;
      const diffX = posX - clientX;
      const diffY = posY - clientY;

      if (resize) {
        const {width, height, top, left} = resize(diffX, diffY);

        actionCallback = () => {
          win._setState('dimension', {width, height}, false);
          win._setState('position', {top, left}, false);
        };

        if (lofi) {
          this.$lofi.style.top = `${top}px`;
          this.$lofi.style.left = `${left}px`;
          this.$lofi.style.width = `${width}px`;
          this.$lofi.style.height = `${height}px`;
        } else {
          actionCallback();
        }

        this.lastAction = 'resize';
      } else if (move) {
        const position = move(diffX, diffY);

        actionCallback = () => {
          win._setState('position', position, false);
        };

        if (lofi) {
          this.$lofi.style.top = `${position.top}px`;
          this.$lofi.style.left = `${position.left}px`;
        } else {
          actionCallback();
        }

        this.lastAction = 'move';
      }

      if (this.lastAction) {
        win._setState(this.lastAction === 'move' ? 'moving' : 'resizing', true);

        if (!attributeSet) {
          this.core.$root.setAttribute('data-window-action', String(true));
          attributeSet = true;
        }
      }
    };

    const mouseup = () => {
      if (touch) {
        document.removeEventListener('touchmove', mousemove, touchArg);
        document.removeEventListener('touchend', mouseup, touchArg);
      } else {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
      }

      if (lofi) {
        this.$lofi.remove();

        if (actionCallback) {
          actionCallback();
        }

        actionCallback = undefined;
      }

      if (this.lastAction === 'move') {
        win.emit('moved', {...win.state.position}, win);
        win._setState('moving', false);
      } else if (this.lastAction === 'resize') {
        win.emit('resized', {...win.state.dimension}, win);
        win._setState('resizing', false);
      }

      this.core.$root.setAttribute('data-window-action', String(false));
    };


    if (!win.focus()) {
      win.setNextZindex();
    }

    if (move || resize) {
      if (touch) {
        document.addEventListener('touchmove', mousemove, touchArg);
        document.addEventListener('touchend', mouseup, touchArg);
      } else {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
      }
    }

    this.lastAction = null;

    if (this.core.has('osjs/contextmenu')) {
      this.core.make('osjs/contextmenu').hide();
    }

    if (lofi) {
      this.$lofi.style.zIndex = win.state.zIndex + 1;
      this.$lofi.style.top = `${win.state.position.top}px`;
      this.$lofi.style.left = `${win.state.position.left}px`;
      this.$lofi.style.width = `${win.state.dimension.width}px`;
      this.$lofi.style.height = `${win.state.dimension.height}px`;

      if (!this.$lofi.parentNode) {
        document.body.appendChild(this.$lofi);
      }
    }
  }

  /**
   * Handles Icon Double Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  iconDblclick(ev, win) {
    win.close();
  }

  /**
   * Handles Icon Click Event
   * @param {Event} ev Browser Event
   * @param {Window} win Window reference
   */
  iconClick(ev, win) {
    const {minimized, maximized} = win.state;
    const {minimizable, maximizable, closeable} = win.attributes;
    const _ = this.core.make('osjs/locale').translate;

    this.core.make('osjs/contextmenu', {
      position: ev,
      menu: [{
        label: minimized ? _('LBL_RAISE') : _('LBL_MINIMIZE'),
        disabled: !minimizable,
        onclick: () => minimized ? win.raise() : win.minimize()
      }, {
        label: maximized ? _('LBL_RESTORE') : _('LBL_MAXIMIZE'),
        disabled: !maximizable,
        onclick: () => maximized ? win.restore() : win.maximize()
      }, {
        label: _('LBL_CLOSE'),
        disabled: !closeable,
        onclick: () => win.close()
      }]
    });
  }
}


const createAttributes = (props, field, disabled) => {
  disabled = disabled ? 'disabled' : undefined;
  if (field.tagName === 'input') {
    if (field.attributes.type !== 'submit') {
      return {
        autocapitalize: 'off',
        autocomplete: 'new-' + field.attributes.name,
        disabled,
        oncreate: el => (el.value = props[field.attributes.name] || field.value || ''),
        ...field.attributes
      };
    }
  }

  return {disabled, ...field.attributes};
};

const createFields = (props, fields, disabled) => {
  const children = f => {
    if (f.tagName === 'select' && f.choices) {
      return f.choices.map(c => h('option', {
        current: c.current ? 'current' : undefined,
        value: c.value
      }, c.label));
    }

    return f.children || [];
  };

  return fields.map(f => h('div', {
    class: 'osjs-login-field osjs-login-field-' + f.tagName
  }, h(f.tagName, createAttributes(props, f, disabled), children(f))));
};

const createView = (options) => {
  const {src, position} = options.logo;

  const logo = () =>
    h('div', {
      class: 'osjs-login-logo',
      'data-position': position,
      style: {
        backgroundImage: `url('${src}')`
      }
    });

  const fields = state => {
    const result = createFields(state, options.fields, state.loading);

    if (src && position === 'bottom') {
      result.push(logo());
    }

    if (options.stamp) {
      result.push(h('div', {
        class: 'osjs-login-stamp'
      }, options.stamp));
    }

    return result;
  };

  return (state, actions) => {
    const header = [];

    if (options.title) {
      header.push(h('div', {
        class: 'osjs-login-header'
      }, h('span', {}, options.title)));
    }

    if (src && ['top', 'middle'].indexOf(position) !== -1) {
      const m = position === 'top'
        ? 'unshift'
        : 'push';

      header[m](logo());
    }

    const createSide = side => position === side
      ? h('div', {'data-position': position}, logo())
      : null;

    const left = () => createSide('left');
    const right = () => createSide('right');
    const middle = () => h('div', {class: 'osjs-login-content'}, children);

    const formFields = fields(state);

    const children = [
      ...header,

      h('div', {
        class: 'osjs-login-error',
        style: {display: state.error ? 'block' : 'none'}
      }, h('span', {}, state.error)),
      h('form', {
        loading: false,
        method: 'post',
        action: '#',
        autocomplete: 'off',
        onsubmit: actions.submit
      }, formFields)
    ];

    return h('div', {
      class: 'osjs-login',
      id: options.id,
      style: {display: state.hidden ? 'none' : undefined}
    }, [left(), middle(), right()].filter(el => !!el));
  };
};

/**
 * Login UI Adapter
 */
const create = (options, login, startHidden, $container) => {
  const ee = new EventEmitter('LoginUI');
  const view = createView(options);
  const a = app({
    hidden: startHidden,
    ...login
  }, {
    setLoading: loading => ({loading}),
    setError: error => ({error, hidden: false}),
    submit: ev => state => {
      ev.preventDefault();

      if (state.loading) {
        return;
      }

      const values = Array.from(ev.target.elements)
        .filter(el => el.type !== 'submit')
        .reduce((o, el) => ({...o, [el.name] : el.value}), {});

      ee.emit('login:post', values);
    }
  }, view, $container);

  ee.on('login:start', () => a.setLoading(true));
  ee.on('login:stop', () => a.setLoading(false));
  ee.on('login:error', err => a.setError(err));

  return ee;
};


/**
 * Login Options
 *
 * @typedef {Object} LoginOptions
 * @property {string} [title] Title
 * @property {object[]} [fields] Fields
 */

/**
 * OS.js Login UI
 */
class Login extends EventEmitter {

  /**
   * Create authentication handler
   *
   * @param {Core} core Core reference
   * @param {LoginOptions} [options] Options
   */
  constructor(core, options) {
    super('Login');

    /**
     * Login root DOM element
     * @type {Element}
     */
    this.$container = null;

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Login options
     * TODO: typedef
     * @type {Object}
     * @readonly
     */
    this.options = {
      id: 'osjs-login',
      title: 'Welcome to OS.js',
      stamp: core.config('version'),
      logo: {
        position: 'top',
        src: null
      },
      fields: [{
        tagName: 'input',
        attributes: {
          name: 'username',
          type: 'text',
          placeholder: 'Username'
        }
      }, {
        tagName: 'input',
        attributes: {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      }, {
        tagName: 'input',
        attributes: {
          type: 'submit',
          value: 'Login'
        }
      }],
      ...options
    };
  }

  /**
   * Initializes the UI
   */
  init(startHidden) {
    this.$container = document.createElement('div');
    this.$container.id = this.options.id;
    this.$container.className = 'osjs-login-base';
    this.core.$root.classList.add('login');
    this.core.$root.appendChild(this.$container);

    this.render(startHidden);
  }

  /**
   * Destroys the UI
   */
  destroy() {
    this.core.$root.classList.remove('login');

    if (this.$container) {
      this.$container.remove();
      this.$container = null;
    }

    super.destroy();
  }

  /**
   * Renders the UI
   */
  render(startHidden) {
    const login = this.core.config('auth.login', {});
    const ui = create(this.options, login, startHidden, this.$container);

    ui.on('register:post', values => this.emit('register:post', values));
    ui.on('login:post', values => this.emit('login:post', values));
    this.on('login:start', () => ui.emit('login:start'));
    this.on('login:stop', () => ui.emit('login:stop'));
    this.on('login:error', err => ui.emit('login:error', err));
  }

}


/**
 * Server Auth adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const serverAuth = (core, options) => {
  const request = (endpoint, params = {}) => core.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(params)
  }, 'json');

  return {
    register: (values) => request('/register', values),
    login: (values) => request('/login', values),
    logout: () =>  request('/logout')
  };
};


/**
 * LocalStorage Auth adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const localStorageAuth = (core, options) => ({
  login: (values) => Promise.resolve(values)
});


const defaultAdapters$1 = {
  server: serverAuth,
  localStorage: localStorageAuth
};

const createUi = (core, options) => {
  const defaultUi = core.config('auth.ui', {});

  return options.login
    ? options.login(core, options.config || {})
    : new Login(core, options.ui || defaultUi);
};

const createAdapter$1 = (core, options) => {
  const adapter = core.config('standalone')
    ? localStorageAuth
    : typeof options.adapter === 'function'
      ? options.adapter
      : defaultAdapters$1[options.adapter || 'server'];

  return {
    login: () => Promise.reject(new Error('Not implemented')),
    logout: () => Promise.reject(new Error('Not implemented')),
    register: () => Promise.reject(new Error('Not implemented')),
    init: () => Promise.resolve(true),
    destroy: () => {},
    ...adapter(core, options.config || {})
  };
};

/**
 * TODO: typedef
 * @typedef {Object} AuthAdapter
 */

/**
 * TODO: typedef
 * @typedef {Object} AuthAdapterConfig
 */

/**
 * @typedef {Object} AuthForm
 * @property {string} [username]
 * @property {string} [password]
 */

/**
 * @callback AuthAdapterCallback
 * @param {Core} core
 * @return {AuthAdapter}
 */

/**
 * @callback LoginAdapterCallback
 * @param {Core} core
 * @return {Login}
 */

/**
 * @callback AuthCallback
 * @param {AuthForm} data
 * @return {boolean}
 */

/**
 * @typedef {Object} AuthSettings
 * @property {AuthAdapterCallback|AuthAdapter} [adapter] Adapter to use
 * @property {LoginAdapterCallback|Login} [login] Login Adapter to use
 * @property {AuthAdapterConfig} [config] Adapter configuration
 */

/**
 * Handles Authentication
 */
class Auth {

  /**
   * @param {Core} core OS.js Core instance reference
   * @param {AuthSettings} [options={}] Auth Options
   */
  constructor(core, options = {}) {
    /**
     * Authentication UI
     * @type {Login}
     * @readonly
     */
    this.ui = createUi(core, options);

    /**
     * Authentication adapter
     * @type {AuthAdapter}
     * @readonly
     */
    this.adapter = createAdapter$1(core, options);

    /**
     * Authentication callback function
     * @type {AuthCallback}
     * @readonly
     */
    this.callback = function() {};

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;
  }

  /**
   * Initializes authentication handler
   */
  init() {
    this.ui.on('login:post', values => this.login(values));
    this.ui.on('register:post', values => this.register(values));

    return this.adapter.init();
  }

  /**
   * Destroy authentication handler
   */
  destroy() {
    this.ui.destroy();
  }

  /**
   * Run the shutdown procedure
   * @param {boolean} [reload] Reload afterwards
   */
  shutdown(reload) {
    try {
      this.core.destroy();
    } catch (e) {
      instance.warn('Exception on destruction', e);
    }

    this.core.emit('osjs/core:logged-out');

    if (reload) {
      setTimeout(() => {
        window.location.reload();
        // FIXME Reload, not refresh
        // this.core.boot();
      }, 1);
    }
  }

  /**
   * Shows Login UI
   * @param {AuthCallback} cb Authentication callback
   * @return {Promise<boolean>}
   */
  show(cb) {
    const login = this.core.config('auth.login', {});
    const autologin = login.username && login.password;
    const settings = this.core.config('auth.cookie');

    this.callback = cb;
    this.ui.init(autologin);

    if (autologin) {
      return this.login(login);
    } else if (settings.enabled) {
      const cookie = Cookies.get(settings.name);
      console.warn(cookie);
      if (cookie) {
        return this.login(JSON.parse(cookie));
      }
    }

    return Promise.resolve(true);
  }

  /**
   * Performs a login
   * @param {AuthForm} values Form values as JSON
   * @return {Promise<boolean>}
   */
  login(values) {
    this.ui.emit('login:start');

    return this.adapter
      .login(values)
      .then(response => {
        if (response) {
          const settings = this.core.config('auth.cookie');
          if (settings.enabled) {
            Cookies.set(settings.name, JSON.stringify(values), {
              expires: settings.expires,
              sameSite: 'strict'
            });
          } else {
            Cookies.remove(settings.name);
          }

          this.ui.destroy();
          this.callback(response);

          this.core.emit('osjs/core:logged-in');
          this.ui.emit('login:stop', response);

          return true;
        }

        return false;
      })
      .catch(e => {
        if (this.core.config('development')) {
          instance.warn('Exception on login', e);
        }

        this.ui.emit('login:error', 'Login failed');
        this.ui.emit('login:stop');

        return false;
      });
  }

  /**
   * Performs a logout
   * @param {boolean} [reload=true] Reload client afterwards
   * @return {Promise<boolean>}
   */
  logout(reload = true) {
    return this.adapter.logout(reload)
      .then(response => {
        if (!response) {
          return false;
        }

        const settings = this.core.config('auth.cookie');
        Cookies.remove(settings.name);

        this.shutdown(reload);

        return true;
      });
  }

  /**
   * Performs a register call
   * @param {AuthForm} values Form values as JSON
   * @return {Promise<*>}
   */
  register(values) {
    this.ui.emit('register:start');

    return this.adapter
      .register(values)
      .then(response => {
        if (response) {
          this.ui.emit('register:stop', response);

          return response;
        }

        return false;
      })
      .catch(e => {
        if (this.core.config('development')) {
          instance.warn('Exception on registration', e);
        }

        this.ui.emit('register:error', 'Registration failed');
        this.ui.emit('register:stop');

        return false;
      });
  }
}


/**
 * Session Handler
 */
class Session {

  /**
   * Creates the Session Handler
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;
  }

  /**
   * Destroys instance
   */
  destroy() {
  }

  /**
   * Saves session
   * @return {Promise<boolean>}
   */
  save() {
    const apps = Application.getApplications()
      .filter(a => a.options.sessionable !== false);

    const session = apps.map(app => app.getSession());

    return this.core.make('osjs/settings')
      .set('osjs/session', null, session)
      .save();
  }

  /**
   * Loads session
   * @param {boolean} [fresh=false] Kill all current applications first
   * @return {Promise<boolean>}
   */
  load(fresh = false) {
    if (fresh) {
      Application.destroyAll();
    }

    let session = this.core.make('osjs/settings')
      .get('osjs/session');

    if (session && !(session instanceof Array)) {
      session = Object.values(session);
    }

    if (session) {
      console.group('Session::load()');

      session.forEach(app => {
        try {
          this.core.run(app.name, app.args, {
            restore: {
              windows: app.windows
            }
          });
        } catch (e) {
          instance.warn('Error while loading session entry', e);
        }
      });

      console.groupEnd();
    }

    return Promise.resolve(true);
  }
}


/**
 * @typedef {HTMLScriptElement|HTMLLinkElement} PreloaderEntryElement
 */

/**
 * @typedef {Object} PreloaderEntry
 * @property {boolean} success
 * @property {PreloaderEntryElement} [el]
 * @property {string} [entry]
 * @property {string} [error]
 */

/**
 * @typedef {Object} PreloaderResult
 * @property {string[]} errors
 * @property {{string: PreloaderEntryElement}} elements
 */

/**
 * The Preloader loads styles and scripts
 */
class Preloader {

  constructor(root) {
    /**
     * A list of cached preloads
     * @type {String[]}
     */
    this.loaded = [];

    /**
     * @type {Element}
     */
    this.$root = root;
  }

  destroy() {
    this.loaded = [];
  }

  /**
   * Loads all resources required for a package
   * @param {string[]} list A list of resources
   * @param {boolean} [force=false] Force loading even though previously cached
   * @return {Promise<PreloaderResult>} A list of failed resources
   */
  load(list, force = false) {
    const cached = entry => force
      ? false
      : this.loaded.find(src => src === entry);

    const promises = list
      .filter(entry => !cached(entry))
      .map(entry => {
        instance.debug('Packages::preload()', entry);

        const p = entry.match(/\.js$/)
          ? script(this.$root, entry)
          : style(this.$root, entry);

        return p
          .then(el => ({success: true, entry, el}))
          .catch(error => ({success: false, entry, error}));
      });

    return Promise.all(promises)
      .then(results => this._load(results, cached));
  }

  /**
   * Checks the loaded list
   * @private
   * @param {Object[]} results Preload results
   * @param {string[]} cached Already cached preloads
   * @return {PreloaderResult}
   */
  _load(results, cached) {
    const successes = results.filter(res => res.success);
    successes.forEach(entry => {
      if (!cached(entry)) {
        this.loaded.push(entry);
      }
    });

    const failed = results.filter(res => !res.success);
    failed.forEach(failed => instance.warn('Failed loading', failed.entry, failed.error));

    return {
      errors: failed.map(failed => failed.entry),
      elements: successes.reduce((result, iter) => {
        return {...result, [iter.entry]: iter.el};
      }, {})
    };
  }
}


const createPackageAvailabilityCheck = (core) => {
  const user = core.getUser();
  const permissions = core.config('packages.permissions', {});

  const checkMetadataGroups = iter => {
    const m = iter.strictGroups === false ? 'some' : 'every';

    return iter.groups instanceof Array
      ? iter.groups[m](g => user.groups.indexOf(g) !== -1)
      : true;
  };

  const checkConfigGroups = iter => {
    const perm = permissions[iter.name];
    if (perm && perm.groups instanceof Array) {
      const m = perm.strictGroups === false ? 'some' : 'every';
      return perm.groups[m](g => user.groups.indexOf(g) !== -1);
    }

    return true;
  };

  const checkBlacklist = iter => user.blacklist instanceof Array
    ? user.blacklist.indexOf(iter.name) === -1
    : true;

  const checks =  [
    checkMetadataGroups,
    checkConfigGroups,
    checkBlacklist
  ];

  return metadata => checks.every(fn => fn(metadata));
};

const createManifestFromArray = list => list
  .map(iter => ({
    type: 'application',
    ...iter,
    files: (iter.files || [])
      .map(file =>
        typeof file === 'string'
          ? {filename: file, type: 'preload'}
          : {type: 'preload', ...file}
      )
  }));

const filterMetadataFilesByType = (files, type) =>
  (files || []).filter(file => file.type === type);

const metadataFilesToFilenames = files =>
  (files || []).map(file => file.filename);


/**
 * A registered package reference
 *
 * @typedef {Object} PackageReference
 * @property {PackageMetadata} metadata Package metadata
 * @property {Function} callback Callback to instanciate
 */

/**
 * A package metadata
 *
 * @typedef {Object} PackageMetadata
 * @property {string} name The package name
 * @property {string} [category] Package category
 * @property {string} [icon] Package icon
 * @property {boolean} [singleton] If only one instance allowed
 * @property {boolean} [autostart] Autostart on boot
 * @property {boolean} [hidden] Hide from launch menus etc.
 * @property {string} [server] Server script filename
 * @property {string[]} [groups] Only available for users in this group
 * @property {Object[]|string[]} [files] Files to preload
 * @property {{key: string}} title A map of locales and titles
 * @property {{key: string}} description A map of locales and titles
 */

/**
 * Package Launch Options
 *
 * @typedef {Object} PackageLaunchOptions
 * @property {boolean} [forcePreload=false] Force preload reloading
 */

/**
 * Package Manager
 *
 * Handles indexing, loading and launching of OS.js packages
 */
class Packages {

  /**
   * Create package manage
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * A list of registered packages
     * @type {PackageReference[]}
     */
    this.packages = [];

    /**
     * The lost of loaded package metadata
     * @type {PackageMetadata[]}
     */
    this.metadata = [];

    /**
     * A list of running application names
     *
     * Mainly used for singleton awareness
     *
     * @private
     * @type {string[]}
     */
    this._running = [];

    /**
     * Preloader
     * @type {Preloader}
     * @readonly
     */
    this.preloader = new Preloader(core.$resourceRoot);

    /**
     * If inited
     * @type {boolean}
     */
    this.inited = false;
  }

  /**
   * Destroy package manager
   */
  destroy() {
    this.packages = [];
    this.metadata = [];

    this.preloader.destroy();
  }

  /**
   * Initializes package manager
   * @return {Promise<boolean>}
   */
  init() {
    instance.debug('Packages::init()');

    if (!this.inited) {
      this.core.on('osjs/core:started', () => this._autostart());
    }

    this.metadata = this.core.config('packages.metadata', [])
      .map(iter => ({type: 'application', ...iter}));

    this.inited = true;

    const manifest = this.core.config('packages.manifest');

    return manifest
      ? this.core.request(manifest, {}, 'json', true)
        .then(metadata => this.addPackages(metadata))
        .then(metadata => this._preloadBackgroundFiles(metadata))
        .then(() => true)
        .catch(error => instance.error(error))
      : Promise.resolve(true);
  }

  /**
   * Launches a (application) package
   *
   * @param {string} name Package name
   * @param {{foo: *}} [args={}] Launch arguments
   * @param {PackageLaunchOptions} [options={}] Launch options
   * @see PackageServiceProvider
   * @throws {Error}
   * @return {Promise<Application>}
   */
  launch(name, args = {}, options = {}) {
    instance.debug('Packages::launch()', name, args, options);

    const _ = this.core.make('osjs/locale').translate;
    const metadata = this.metadata.find(pkg => pkg.name === name);
    if (!metadata) {
      throw new Error(_('ERR_PACKAGE_NOT_FOUND', name));
    }

    if (['theme', 'icons', 'sounds'].indexOf(metadata.type) !== -1) {
      return this._launchTheme(name, metadata);
    }

    return this._launchApplication(name, metadata, args, options);
  }

  /**
   * Launches an application package
   *
   * @private
   * @param {string} name Application package name
   * @param {Metadata} metadata Application metadata
   * @param {{foo: *}} args Launch arguments
   * @param {PackageLaunchOptions} options Launch options
   * @return {Promise<Application>}
   */
  _launchApplication(name, metadata, args, options) {
    let signaled = false;

    if (metadata.singleton) {
      const foundApp = Application.getApplications()
        .find(app => app.metadata.name === metadata.name);

      if (foundApp) {
        foundApp.emit('attention', args, options);
        signaled = true;

        return Promise.resolve(foundApp);
      }

      const found = this._running.filter(n => n === name);

      if (found.length > 0) {
        return new Promise((resolve, reject) => {
          this.core.once(`osjs/application:${name}:launched`, a => {
            if (signaled) {
              resolve(a);
            } else {
              a.emit('attention', args, options);
              resolve(a);
            }
          });
        });
      }
    }

    this.core.emit('osjs/application:launch', name, args, options);

    this._running.push(name);

    return this._launch(name, metadata, args, options);
  }

  /**
   * Launches a (theme) package
   *
   * @private
   * @param {string} name Package name
   * @param {Metadata} metadata Application metadata
   * @throws {Error}
   * @return {Promise<object>}
   */
  _launchTheme(name, metadata) {
    const preloads = this._getPreloads(metadata, 'preload', 'theme');

    return this.preloader.load(preloads)
      .then(result => {
        return {
          elements: {},
          ...result,
          ...this.packages.find(pkg => pkg.metadata.name === name) || {}
        };
      });
  }

  /**
   * Returns preloads
   *
   * @private
   * @param {Metadata} metadata Application metadata
   * @param {string} fileType Files type
   * @param {string} packageType Package type
   * @return {string[]}
   */
  _getPreloads(metadata, fileType, packageType) {
    return metadataFilesToFilenames(
      filterMetadataFilesByType(metadata.files, fileType)
    ).map(f => this.core.url(f, {}, {type: packageType, ...metadata}));
  }

  /**
   * Wrapper for launching a (application) package
   *
   * @private
   * @param {string} name Package name
   * @param {{foo: *}} args Launch arguments
   * @param {PackageLaunchOptions} options Launch options
   * @return {Promise<Application>}
   */
  _launch(name, metadata, args, options) {
    const _ = this.core.make('osjs/locale').translate;
    const canLaunch = createPackageAvailabilityCheck(this.core);

    const dialog = e => {
      if (this.core.has('osjs/dialog')) {
        this.core.make('osjs/dialog', 'alert', {
          type: 'error',
          title: _('ERR_PACKAGE_EXCEPTION', name),
          message: _('ERR_PACKAGE_EXCEPTION', name),
          error: e
        }, () => { /* noop */});
      } else {
        alert(`${_('ERR_PACKAGE_EXCEPTION', name)}: ${e.stack || e}`);
      }
    };

    const fail = err => {
      this.core.emit('osjs/application:launched', name, false);
      this.core.emit(`osjs/application:${name}:launched`, false);

      dialog(err);

      throw new Error(err);
    };

    const preloads = this._getPreloads(metadata, 'preload', 'apps');

    const create = found => {
      let app;

      try {
        console.group('Packages::_launch()');
        app = found.callback(this.core, args, options, found.metadata);

        if (app instanceof Application) {
          app.on('destroy', () => {
            const foundIndex = this._running.findIndex(n => n === name);
            if (foundIndex !== -1) {
              this._running.splice(foundIndex, 1);
            }
          });
        } else {
          instance.warn('The application', name, 'did not return an Application instance from registration');
        }
      } catch (e) {
        dialog(e);

        instance.warn('Exception when launching', name, e);
      } finally {
        this.core.emit('osjs/application:launched', name, app);
        this.core.emit(`osjs/application:${name}:launched`, app);
        console.groupEnd();
      }

      return app;
    };

    if (!canLaunch(metadata)) {
      fail(_('ERR_PACKAGE_PERMISSION_DENIED', name));
    }

    return this.preloader.load(preloads, options.forcePreload === true)
      .then(({errors}) => {
        if (errors.length) {
          fail(_('ERR_PACKAGE_LOAD', name, errors.join(', ')));
        }

        const found = this.packages.find(pkg => pkg.metadata.name === name);
        if (!found) {
          fail(_('ERR_PACKAGE_NO_RUNTIME', name));
        }

        return create(found);
      });
  }

  /**
   * Autostarts tagged packages
   * @private
   */
  _autostart() {
    const meta = this.metadata
      .filter(pkg => pkg.autostart === true);

    const configured = this.core
      .config('application.autostart', [])
      .map(value => typeof value === 'string' ? {name: value} : value);

    [...meta, ...configured].forEach(({name, args}) => this.launch(name, args || {}));
  }

  /**
   * Registers a package
   *
   * @param {string} name Package name
   * @param {Function} callback Callback function to construct application instance
   * @throws {Error}
   */
  register(name, callback) {
    instance.debug('Packages::register()', name);

    const _ = this.core.make('osjs/locale').translate;
    const metadata = this.metadata.find(pkg => pkg.name === name);
    if (!metadata) {
      throw new Error(_('ERR_PACKAGE_NO_METADATA', name));
    }

    const foundIndex = this.packages.findIndex(pkg => pkg.metadata.name === name);
    if (foundIndex !== -1) {
      this.packages.splice(foundIndex, 1);
    }

    this.packages.push({
      metadata,
      callback
    });
  }

  /**
   * Adds a set of packages
   * @param {PackageMetadata[]} list Package list
   * @return {PackageMetadata[]} Current list of packages
   */
  addPackages(list) {
    if (list instanceof Array) {
      const override = this.core.config('packages.overrideMetadata', {});
      const append = createManifestFromArray(list)
        .map(meta => override[meta.name] ? {...meta, ...override[meta.name]} : meta);

      this.metadata = [...this.metadata, ...append];
    }

    return this.getPackages();
  }

  /**
   * Gets a list of packages (metadata)
   * @param {Function} [filter] A filter function
   * @return {PackageMetadata[]}
   */
  getPackages(filter) {
    filter = filter || (() => true);

    const metadata = this.metadata.map(m => ({...m}));
    const hidden = this.core.config('packages.hidden', []);
    const filterAvailable = createPackageAvailabilityCheck(this.core);

    const filterConfigHidden = iter => hidden instanceof Array
      ? hidden.indexOf(iter.name) === -1
      : true;

    return metadata
      .filter(filterAvailable)
      .filter(filterConfigHidden)
      .filter(filter);
  }

  /**
   * Gets a list of packages compatible with the given mime type
   * @param {string} mimeType MIME Type
   * @see PackageManager#getPackages
   * @return {PackageMetadata[]}
   */
  getCompatiblePackages(mimeType) {
    return this.getPackages(meta => {
      if (meta.mimes && !meta.hidden) {
        return !!meta.mimes.find(mime => {
          try {
            const re = new RegExp(mime);
            return re.test(mimeType);
          } catch (e) {
            instance.warn('Compability check failed', e);
          }

          return mime === mimeType;
        });
      }

      return false;
    });
  }

  /**
   * Preloads background files of a set of packages
   * @param {PackageMetadata[]} list Package list
   */
  _preloadBackgroundFiles(list) {
    const backgroundFiles = list.reduce((filenames, iter) => [
      ...filenames,
      ...this._getPreloads(iter, 'background', 'apps')
    ], []);

    return this.preloader.load(backgroundFiles)
      .then(({errors = []}) => {
        errors.forEach(error => instance.error(error));
      });
  }

  /**
   * Gets a list of running packages
   * @return {string[]}
   */
  running() {
    return this._running;
  }

  /**
   * Gets the package metadata for a given package name
   * @param {string} name
   * @returns {PackageMetadata}
   */
  getMetadataFromName(name) {
    const found = this.metadata.find(pkg => pkg.name === name);
    return found ? {...found} : null;
  }
}

/**
 * Tray Icon Data
 * @typedef {Object} TrayEntryData
 * @property {string} [key] Used as internal index for tray entry
 * @property {string} [icon] Icon source
 * @property {string} [title] The title and tooltip
 * @property {Function} [onclick] The callback function for clicks
 * @property {Function} [oncontextmenu] The callback function for contextmenu
 */

/**
 * Tray Icon Entry
 * @typedef {Object} TrayEntry
 * @property {TrayEntryData} entry The given entry data
 * @property {Function} update Updates entry with given data
 * @property {Function} destroy Destroy the entry
 */

/**
 * Tray Handler
 */
class Tray {

  /**
   * Creates the Tray Handler
   *
   * @param {Core} core Core reference
   */
  constructor(core) {
    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * All Tray entries
     * @type {TrayEntry[]}
     */
    this.entries = [];
  }

  /**
   * Destroys instance
   */
  destroy() {
    this.entries = [];
  }

  /**
   * Creates a new Tray entry
   * @param {TrayEntryData} options Options
   * @param {Function} [handler] The callback function for all events
   * @return {TrayEntry}
   */
  create(options, handler) {
    const defaultTitle = this.core.make('osjs/locale')
      .translate('LBL_TRAY');

    handler = handler || (() => {});

    const entry = {
      key: null,
      icon: defaultIcon,
      title: defaultTitle,
      onclick: handler,
      oncontextmenu: handler,
      handler,
      ...options
    };

    instance.debug('Created new tray entry', entry);

    this.entries.push(entry);

    this.core.emit('osjs/tray:create', entry);
    this.core.emit('osjs/tray:update', this.entries);

    const obj = {
      entry,
      update: u => {
        Object.keys(u).forEach(k => (entry[k] = u[k]));

        this.core.emit('osjs/tray:update', this.entries);
      },
      destroy: () => this.remove(entry)
    };

    return obj;
  }

  /**
   * Removes a Tray entry
   * @param {TrayEntry} entry The tray entry
   */
  remove(entry) {
    const foundIndex = this.entries.findIndex(e => e === entry);
    if (foundIndex !== -1) {
      this.entries.splice(foundIndex, 1);

      this.core.emit('osjs/tray:remove', entry);
      this.core.emit('osjs/tray:update', this.entries);
    }
  }

  /**
   * @return {TrayEntry[]}
   */
  list() {
    return this.entries;
  }

  /**
   * @return {Boolean}
   */
  has(key) {
    return this.entries.findIndex(entry => entry.key === key) !== -1;
  }

}


/**
 * Clipboard Data
 *
 * @typedef {Object} ClipboardData
 * @property {string} [type] Optional data type
 * @property {*} data
 */

/**
 * Clipboard Manager
 */
class Clipboard {

  /**
   * Create new clipboard
   */
  constructor() {
    /**
     * @type {ClipboardData}
     */
    this.clipboard = undefined;

    this.clear();
  }

  /**
   * Destroy clipboard
   */
  destroy() {
    this.clear();
  }

  /**
   * Clear clipboard
   */
  clear() {
    this.clipboard = {data: undefined, type: undefined};
  }

  /**
   * Set clipboard data
   * @param {*} data Clipboard data. For async data, provide a function that returns a promise
   * @param {string} [type] Optional type used by applications for identifying content
   */
  set(data, type) {
    this.clipboard = {data, type};
  }

  /**
   * Checks if current clipboard data has this type
   * @param {string|RegExp} type Data type
   * @return {boolean}
   */
  has(type) {
    if (type instanceof RegExp) {
      return typeof this.clipboard.type === 'string' &&
        !!this.clipboard.type.match(type);
    }
    return this.clipboard.type === type;
  }

  /**
   * Gets clipboard data
   * @param {boolean} [clear=false] Clear clipboard
   * @return {Promise<*>}
   */
  get(clear = false) {
    const {data} = this.clipboard;
    const result = typeof data === 'function'
      ? data()
      : data;

    if (clear) {
      this.clear();
    }

    return Promise.resolve(result);
  }
}


/**
 * Middleware Data
 *
 * @typedef {Object} MiddlewareData
 * @property {string} [group] Middleware group
 */

/**
 * Middleware Manager
 */
class Middleware {

  /**
   * Create new middleware
   */
  constructor() {
    /**
     * @type {MiddlewareData}
     */
    this.middleware = {};
  }

  /**
   * Destroy middleware
   */
  destroy() {
    this.clear();
  }

  /**
   * Clear middleware
   */
  clear() {
    this.middleware = {};
  }

  /**
   * Add middleware function to a group
   * @param {string} group Middleware group
   * @param {Function} callback Middleware function to add
   */
  add(group, callback) {
    if (!this.middleware[group]) {
      this.middleware[group] = [];
    }

    this.middleware[group].push(callback);
  }

  /**
   * Remove middleware function from a group
   * @param {string} group Middleware group
   * @param {Function} callback Middleware function to remove
   */
  remove(group, callback) {
    if (this.middleware[group]) {
      this.middleware[group] =
        this.middleware[group].filter(cb => cb !== callback);
    }
  }

  /**
   * Gets middleware functions for a group
   * @param {string} group Middleware group
   * @return {Function[]}
   */
  get(group) {
    return this.middleware[group] || [];
  }
}


const en_EN = {
  // Core
  ERR_REQUEST_STANDALONE: 'Cannot make requests in standalone mode.',
  ERR_REQUEST_NOT_OK: 'An error occured while performing a request: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filesystem \'{0}\' not found',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filesystem not found for \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filesystem \'{0}\' not mounted',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' already mounted',
  ERR_VFS_PATH_FORMAT_INVALID: 'Given path \'{0}\' does not match \'name:/path\'',
  ERR_PACKAGE_PERMISSION_DENIED: 'You are not permitted to run \'{0}\'',
  ERR_PACKAGE_NOT_FOUND: 'Package Metadata \'{0}\' not found',
  ERR_PACKAGE_LOAD: 'Package Loading \'{0}\' failed: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Package Runtime \'{0}\' not found',
  ERR_PACKAGE_NO_METADATA: 'Metadata not found for \'{0}\'. Is it in the manifest?',
  ERR_PACKAGE_EXCEPTION: 'An exception occured in \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Window with ID \'{0}\' already exists',
  ERR_INVALID_LOCALE: 'Invalid locale \'{0}\'',
  LBL_CONNECTION_LOST: 'Connection Lost',
  LBL_CONNECTION_LOST_MESSAGE: 'The connection to the OS.js was lost. Reconnecting....',
  LBL_CONNECTION_RESTORED: 'Connection Restored',
  LBL_CONNECTION_RESTORED_MESSAGE: 'The connection to the OS.js server was restored.',
  LBL_CONNECTION_FAILED: 'Connection Failed',
  LBL_CONNECTION_FAILED_MESSAGE: 'The connection to the OS.js could not be established. Some features might not work properly.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Development',
  LBL_APP_CAT_SCIENCE: 'Science',
  LBL_APP_CAT_GAMES: 'Games',
  LBL_APP_CAT_GRAPHICS: 'Graphics',
  LBL_APP_CAT_NETWORK: 'Network',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Office',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Utilities',
  LBL_APP_CAT_OTHER: 'Other',

  // UI
  LBL_LAUNCH_SELECT: 'Select application',
  LBL_LAUNCH_SELECT_MESSAGE: 'Select application for \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Select wallpaper',
  LBL_DESKTOP_SELECT_THEME: 'Select theme',
  LBL_SEARCH_TOOLTOP: 'Search Filesystem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Search filesystems...',
  LBL_SEARCH_WAIT: 'Searching...',
  LBL_SEARCH_RESULT: 'Showing {0} results',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Set as wallpaper',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Top',
  LBL_LEFT: 'Left',
  LBL_RIGHT: 'Right',
  LBL_BOTTOM: 'Bottom',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Error',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Message',
  LBL_WARNINIG: 'Warning',
  LBL_SUCCESS: 'Success',
  LBL_FAILURE: 'Failure',
  LBL_WINDOW: 'Window',
  LBL_WINDOWS: 'Windows',
  LBL_NOTIFICATION: 'Notification',
  LBL_NOTIFICATIONS: 'Notifications',
  LBL_TRAY: 'Tray Entry',
  LBL_NAME: 'Name',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Size',
  LBL_FILE: 'File',
  LBL_NEW: 'New',
  LBL_OPEN: 'Open',
  LBL_OPEN_WITH: 'Open with...',
  LBL_SAVE: 'Save',
  LBL_SAVEAS: 'Save As',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abort',
  LBL_CANCEL: 'Cancel',
  LBL_CLOSE: 'Close',
  LBL_QUIT: 'Quit',
  LBL_YES: 'Yes',
  LBL_NO: 'No',
  LBL_GO: 'Go',
  LBL_MKDIR: 'Create new directory',
  LBL_MKFILE: 'Create new file',
  LBL_COPY: 'Copy',
  LBL_PASTE: 'Paste',
  LBL_CUT: 'Cut',
  LBL_MOVE: 'Move',
  LBL_RENAME: 'Rename',
  LBL_DELETE: 'Delete',
  LBL_DOWNLOAD: 'Download',
  LBL_REFRESH: 'Refresh',
  LBL_RELOAD: 'Reload',
  LBL_HOME: 'Home',
  LBL_VIEW: 'View',
  LBL_HELP: 'Help',
  LBL_ABOUT: 'About',
  LBL_APPLICATION: 'Application',
  LBL_APPLICATIONS: 'Applications',
  LBL_KILL: 'Kill',
  LBL_KILL_ALL: 'Kill all',
  LBL_MINIMIZE: 'Minimize',
  LBL_MAXIMIZE: 'Maximize',
  LBL_RESTORE: 'Restore',
  LBL_RAISE: 'Raise',
  LBL_SHADE: 'Shade',
  LBL_UNSHADE: 'Unshade',
  LBL_ONTOP: 'On top',
  LBL_RESIZE: 'Resize',
  LBL_BACK: 'Back',
  LBL_FORWARD: 'Forward',
  LBL_UPLOAD: 'Upload',
  LBL_IMAGE: 'Image',
  LBL_CREATE_SHORTCUT: 'Create shortcut',
  LBL_REMOVE_SHORTCUT: 'Remove shortcut',
  LBL_EDIT: 'Edit'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  Julien Gomes Dias <abld@abld.info>
 * @license Simplified BSD License
 */

const fr_FR = {
  // Core
  ERR_REQUEST_STANDALONE: 'Impossible d\'effectuer des requêtes en mode autonome.',
  ERR_REQUEST_NOT_OK: 'Une erreur s\'est produite en exécutant une requête : {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Système de fichier \'{0}\' absent',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Système de fichier pour \'{0}\' absent',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Le système de fichier \'{0}\' n\'est pas encore monté',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Le système de fichier \'{0}\' est déjà monté',
  ERR_VFS_PATH_FORMAT_INVALID: 'Le dossier \'{0}\' ne correspond pas \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Les métadonnées du paquet \'{0}\' n\'ont pas été touvées',
  ERR_PACKAGE_LOAD: 'Le chargement du paquet \'{0}\' a échoué: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Durée d\'exécution du paquet \'{0}\' absente',
  ERR_PACKAGE_NO_METADATA: 'Métadonnées absentes pour \'{0}\'. Sont-elles dans le manifeste ?',
  ERR_PACKAGE_EXCEPTION: 'Une exception s\'est produite dans \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'La fénêtre avec l\'identifiant \'{0}\' existe déjà',
  ERR_INVALID_LOCALE: 'Paramètre de langue invalide \'{0}\'',
  LBL_CONNECTION_LOST: 'Connexion perdue',
  LBL_CONNECTION_LOST_MESSAGE: 'La connexion à OS.js a été perdue. Reconnexion...',
  LBL_CONNECTION_RESTORED: 'Connexion restaurée',
  LBL_CONNECTION_RESTORED_MESSAGE: 'La connexion à OS.js a été restaurée.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Développement',
  LBL_APP_CAT_SCIENCE: 'Science',
  LBL_APP_CAT_GAMES: 'Jeux',
  LBL_APP_CAT_GRAPHICS: 'Graphisme',
  LBL_APP_CAT_NETWORK: 'Réseau',
  LBL_APP_CAT_MULTIMEDIA: 'Multimédia',
  LBL_APP_CAT_OFFICE: 'Bureautique',
  LBL_APP_CAT_SYSTEM: 'Système',
  LBL_APP_CAT_UTILITIES: 'Utilitaires',
  LBL_APP_CAT_OTHER: 'Autre',

  // UI
  LBL_LAUNCH_SELECT: 'Sélectionner l\'application',
  LBL_LAUNCH_SELECT_MESSAGE: 'Sélectionner l\'application pour \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Sélectionner le fond d\'écran',
  LBL_DESKTOP_SELECT_THEME: 'Sélectionner le thème',
  LBL_SEARCH_TOOLTOP: 'Recherche d\'un système de fichier ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Recherche des systèmes de fichiers...',
  LBL_SEARCH_WAIT: 'Recherche...',
  LBL_SEARCH_RESULT: 'Affichage des résultats {0}',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'En Haut',
  LBL_LEFT: 'À Gauche',
  LBL_RIGHT: 'À Droite',
  LBL_BOTTOM: 'En Bas',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Erreur',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Message',
  LBL_WARNINIG: 'Attention',
  LBL_SUCCESS: 'Succès',
  LBL_FAILURE: 'Échec',
  LBL_WINDOW: 'Fenêtre',
  LBL_WINDOWS: 'Fenêtres',
  LBL_NOTIFICATION: 'Notification',
  LBL_NOTIFICATIONS: 'Notifications',
  LBL_TRAY: 'Accès au plateau',
  LBL_NAME: 'Nom',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Taille',
  LBL_FILE: 'Fichier',
  LBL_NEW: 'Nouveau',
  LBL_OPEN: 'Ouvrir',
  LBL_SAVE: 'Sauvegarder',
  LBL_SAVEAS: 'Sauvegarder comme',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abandonner',
  LBL_CANCEL: 'Annuler',
  LBL_CLOSE: 'Fermer',
  LBL_QUIT: 'Quitter',
  LBL_YES: 'Oui',
  LBL_NO: 'Non',
  LBL_GO: 'C\'est parti !',
  LBL_MKDIR: 'Créer nouveau dossier',
  LBL_MKFILE: 'Créer nouveau fichier',
  LBL_COPY: 'Copier',
  LBL_PASTE: 'Coller',
  LBL_CUT: 'Couper',
  LBL_MOVE: 'Déplacer',
  LBL_RENAME: 'Renommer',
  LBL_DELETE: 'Supprimer',
  LBL_DOWNLOAD: 'Télécharger',
  LBL_REFRESH: 'Rafraîchir',
  LBL_RELOAD: 'Recharger',
  LBL_HOME: 'Accueil',
  LBL_VIEW: 'Aperçu',
  LBL_HELP: 'Aide',
  LBL_ABOUT: 'À propos',
  LBL_APPLICATION: 'Application',
  LBL_APPLICATIONS: 'Applications',
  LBL_KILL: 'Tuer',
  LBL_KILL_ALL: 'Tuer tout'
};


const nb_NO = {
  // Core
  ERR_REQUEST_STANDALONE: 'Kan ikke gjøre spørringer i standalone modus.',
  ERR_REQUEST_NOT_OK: 'En feil oppstod under spørring: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filsystem \'{0}\' ikke funnet',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filsystem ikke funnet for \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filsystem \'{0}\' ikke montert',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' allerede montert',
  ERR_VFS_PATH_FORMAT_INVALID: 'Angitt sti \'{0}\' tilfredstiller ikke format \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Pakke Metadata \'{0}\' ikke funnet',
  ERR_PACKAGE_LOAD: 'Pakke Lasting \'{0}\' feilet: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Pakke Runtime \'{0}\' ikke funnet',
  ERR_PACKAGE_NO_METADATA: 'Metadata ikke funnet for \'{0}\'. Er den i manifestet?',
  ERR_PACKAGE_EXCEPTION: 'En unntaksfeil oppstod i \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Vindu med ID \'{0}\' eksisterer allerede',
  ERR_INVALID_LOCALE: 'Ugyldig lokalisering \'{0}\'',
  LBL_CONNECTION_LOST: 'Tilkobling tapt',
  LBL_CONNECTION_LOST_MESSAGE: 'Tilkobling til OS.js var tapt. Kobler til på nytt....',
  LBL_CONNECTION_RESTORED: 'Tilkobling gjenopprettet',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Tilkobling til OS.js var gjenopprettet.',
  LBL_CONNECTION_FAILED: 'Tilkobling feilet',
  LBL_CONNECTION_FAILED_MESSAGE: 'Tilkobling til OS.js var ikke vellykket. Noen egenskaper er utilgjenglig.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Utvikling',
  LBL_APP_CAT_SCIENCE: 'Vitenskap',
  LBL_APP_CAT_GAMES: 'Spill',
  LBL_APP_CAT_GRAPHICS: 'Grafikk',
  LBL_APP_CAT_NETWORK: 'Nettverk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Kontor',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Verktøy',
  LBL_APP_CAT_OTHER: 'Andre',

  // UI
  LBL_LAUNCH_SELECT: 'Velg applikasjon',
  LBL_LAUNCH_SELECT_MESSAGE: 'Velg applikasjon for \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Velg bakgrunnsbilde',
  LBL_DESKTOP_SELECT_THEME: 'Velg tema',
  LBL_SEARCH_TOOLTOP: 'Søk i filsystemer ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Søker filsystemer...',
  LBL_SEARCH_WAIT: 'Søker...',
  LBL_SEARCH_RESULT: 'Viser {0} resultater',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Sett som bakgrunnsbilde',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topp',
  LBL_LEFT: 'Venstre',
  LBL_RIGHT: 'Høyre',
  LBL_BOTTOM: 'Bunn',
  LBL_MENU: 'Meny',
  LBL_ERROR: 'Feil',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Melding',
  LBL_WARNINIG: 'Advarsel',
  LBL_SUCCESS: 'Velykket',
  LBL_FAILURE: 'Svikt',
  LBL_WINDOW: 'Vindu',
  LBL_WINDOWS: 'Vinduer',
  LBL_NOTIFICATION: 'Notifikasjon',
  LBL_NOTIFICATIONS: 'Notifikasjoner',
  LBL_TRAY: 'Tray Oppføring',
  LBL_NAME: 'Navn',
  LBL_TYPE: 'Type',
  LBL_SIZE: 'Størrelse',
  LBL_FILE: 'Fil',
  LBL_NEW: 'Ny',
  LBL_OPEN: 'Åpne',
  LBL_OPEN_WITH: 'Åpne med...',
  LBL_SAVE: 'Lagre',
  LBL_SAVEAS: 'Lagre Som',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abort',
  LBL_CANCEL: 'Avbryt',
  LBL_CLOSE: 'Lukk',
  LBL_QUIT: 'Slutt',
  LBL_YES: 'Ja',
  LBL_NO: 'Nei',
  LBL_GO: 'Gå',
  LBL_MKDIR: 'Lag ny mappe',
  LBL_MKFILE: 'Lag ny fil',
  LBL_COPY: 'Kopier',
  LBL_PASTE: 'Lim inn',
  LBL_CUT: 'Kutt',
  LBL_MOVE: 'Flytt',
  LBL_RENAME: 'Navngi',
  LBL_DELETE: 'Slett',
  LBL_DOWNLOAD: 'Last ned',
  LBL_REFRESH: 'Gjenoppfrisk',
  LBL_RELOAD: 'Last på nytt',
  LBL_HOME: 'Hjem',
  LBL_VIEW: 'Visning',
  LBL_HELP: 'Hjelp',
  LBL_ABOUT: 'Om',
  LBL_APPLICATION: 'Applikasjon',
  LBL_APPLICATIONS: 'Applikasjoner',
  LBL_KILL: 'Drep',
  LBL_KILL_ALL: 'Drep alle',
  LBL_MINIMIZE: 'Minimisèr',
  LBL_MAXIMIZE: 'Maksimisèr',
  LBL_RESTORE: 'Gjenopprett',
  LBL_RAISE: 'Løft',
  LBL_SHADE: 'Rull opp',
  LBL_UNSHADE: 'Rull ned',
  LBL_ONTOP: 'Alltid øverst',
  LBL_RESIZE: 'Endre størrelse',
  LBL_BACK: 'Tilbake',
  LBL_FORWARD: 'Frem',
  LBL_UPLOAD: 'Last opp',
  LBL_IMAGE: 'Bilde',
  LBL_CREATE_SHORTCUT: 'Lag til snarvei',
  LBL_REMOVE_SHORTCUT: 'Fjern snarvei',
  LBL_EDIT: 'Rediger'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  Filip Š <projects@filips.com>
 * @license Simplified BSD License
 */

const sl_SI = {
  // Core
  ERR_REQUEST_STANDALONE: 'Zahteve v samostojnem načinu niso mogoče.',
  ERR_REQUEST_NOT_OK: 'Pri zahtevi je prišlo do napake: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Datotečni sistem \'{0}\' ni najden',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Datotečni sistem ni najden \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Datotečni sistem \'{0}\' ni nameščen',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Datotečni sistem \'{0}\' že nameščen',
  ERR_VFS_PATH_FORMAT_INVALID: 'Podana pot \'{0}\' se ne ujema z \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Metapodatki paketa \'{0}\' niso najdeni',
  ERR_PACKAGE_LOAD: 'Pri nalaganju pageta \'{0}\' je prišlo do napake: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Koda paketa \'{0}\' ni najdena',
  ERR_PACKAGE_NO_METADATA: 'Metapodatki \'{0}\' niso najdeni. Ali so v datoteki manifest?',
  ERR_PACKAGE_EXCEPTION: 'Sprožena je bila izjema v \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Okno z ID-jem \'{0}\' že obstaja',
  ERR_INVALID_LOCALE: 'Neveljaven prevod \'{0}\'',
  LBL_CONNECTION_LOST: 'Izguba povezave',
  LBL_CONNECTION_LOST_MESSAGE: 'Povezava do strežnika je bila izgubljena. Ponovno povezovanje ...',
  LBL_CONNECTION_RESTORED: 'Vzpostavitev povezave',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Povezava do strežnika je bila ponovno vzpostavljena.',
  LBL_CONNECTION_FAILED: 'Povezava ni uspela',
  LBL_CONNECTION_FAILED_MESSAGE: 'Povezave z OS.js ni bilo mogoče vzpostaviti. Nekatere funkcije morda ne bodo delovale pravilno.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Razvoj',
  LBL_APP_CAT_SCIENCE: 'Znanost',
  LBL_APP_CAT_GAMES: 'Igre',
  LBL_APP_CAT_GRAPHICS: 'Grafika',
  LBL_APP_CAT_NETWORK: 'Omrežje',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedija',
  LBL_APP_CAT_OFFICE: 'Pisarna',
  LBL_APP_CAT_SYSTEM: 'Sistem',
  LBL_APP_CAT_UTILITIES: 'Orodja',
  LBL_APP_CAT_OTHER: 'Drugo',

  // UI
  LBL_LAUNCH_SELECT: 'Izberite aplikacijo',
  LBL_LAUNCH_SELECT_MESSAGE: 'Izberite aplikacijo za \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Izberite ozadje',
  LBL_DESKTOP_SELECT_THEME: 'Izberite temo',
  LBL_SEARCH_TOOLTOP: 'Išči datotečni sistem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Iskanje po datotečnih sistemih ...',
  LBL_SEARCH_WAIT: 'Iskanje ...',
  LBL_SEARCH_RESULT: 'Prikaz {0} rezultatov',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Zgoraj',
  LBL_LEFT: 'Levo',
  LBL_RIGHT: 'Desno',
  LBL_BOTTOM: 'Spodaj',
  LBL_MENU: 'Meni',
  LBL_ERROR: 'Napaka',
  LBL_INFO: 'Informacije',
  LBL_MESSAGE: 'Sporočilo',
  LBL_WARNINIG: 'Opozorilo',
  LBL_SUCCESS: 'Uspeh',
  LBL_FAILURE: 'Neuspeh',
  LBL_WINDOW: 'Okno',
  LBL_WINDOWS: 'Okna',
  LBL_NOTIFICATION: 'Obvestilo',
  LBL_NOTIFICATIONS: 'Obvestila',
  LBL_TRAY: 'Element vrstice',
  LBL_NAME: 'Ime',
  LBL_TYPE: 'Vrsta',
  LBL_SIZE: 'Velikost',
  LBL_FILE: 'Datoteka',
  LBL_NEW: 'Novo',
  LBL_OPEN: 'Odpri',
  LBL_SAVE: 'Shrani',
  LBL_SAVEAS: 'Shrani kot',
  LBL_OK: 'V redu',
  LBL_ABORT: 'Prekini',
  LBL_CANCEL: 'Prekliči',
  LBL_CLOSE: 'Zapri',
  LBL_QUIT: 'Izklopi',
  LBL_YES: 'Da',
  LBL_NO: 'Ne',
  LBL_GO: 'Pojdi',
  LBL_MKDIR: 'Ustvari novo mapo',
  LBL_MKFILE: 'Ustvari novo datoteko',
  LBL_COPY: 'Kopiraj',
  LBL_PASTE: 'Prilepi',
  LBL_CUT: 'Izreži',
  LBL_MOVE: 'Premakni',
  LBL_RENAME: 'Preimenuj',
  LBL_DELETE: 'Izbriši',
  LBL_DOWNLOAD: 'Prenesi',
  LBL_REFRESH: 'Osveži',
  LBL_RELOAD: 'Osveži',
  LBL_HOME: 'Domov',
  LBL_VIEW: 'Pogled',
  LBL_HELP: 'Pomoč',
  LBL_ABOUT: 'O programu',
  LBL_APPLICATION: 'Aplikacija',
  LBL_APPLICATIONS: 'Aplikacije',
  LBL_KILL: 'Končaj',
  LBL_KILL_ALL: 'Končaj vse',
  LBL_MINIMIZE: 'Pomanjšaj',
  LBL_MAXIMIZE: 'Povečaj',
  LBL_RESTORE: 'Obnovi',
  LBL_RAISE: 'Dvigni',
  LBL_SHADE: 'Zasenči',
  LBL_UNSHADE: 'Odsenči',
  LBL_ONTOP: 'Na vrhu',
  LBL_RESIZE: 'Spremeni velikost',
  LBL_BACK: 'Nazaj',
  LBL_FORWARD: 'Naprej',
  LBL_UPLOAD: 'Naloži',
  LBL_IMAGE: 'Slika'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  Nguyễn Anh Khoa <khoaakt@gmail.com>
 * @license Simplified BSD License
 */

const vi_VN = {
  // Core
  ERR_REQUEST_STANDALONE: 'Không thể gửi yêu cầu ở chế độ độc lập.',
  ERR_REQUEST_NOT_OK: 'Đã xảy ra lỗi khi thực hiện yêu cầu: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Không tìm thấy hệ thống tập tin \'{0}\'',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Không tìm thấy hệ thống tập tin cho \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Hệ thống tập tin \'{0}\' không được gắn kết',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Hệ thống tập tin \'{0}\' đã được gắn kết',
  ERR_VFS_PATH_FORMAT_INVALID: 'Định dạng đường dẫn \'{0}\' không khớp với \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Không tìm thấy siêu dữ liệu của gói \'{0}\'',
  ERR_PACKAGE_LOAD: 'Tải gói \'{0}\' thất bại: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Không tìm thấy Runtime của gói \'{0}\'',
  ERR_PACKAGE_NO_METADATA: 'Không tìm thấy siêu dữ liệu cho \'{0}\'. Bạn có chắc nó đã được báo cáo trong manifest không?',
  ERR_PACKAGE_EXCEPTION: 'Đã xảy ra lỗi trong \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Cửa sổ với ID \'{0}\' đã tồn tại',
  ERR_INVALID_LOCALE: 'Ngôn ngữ không hợp lệ \'{0}\'',
  LBL_CONNECTION_LOST: 'Mất kết nối',
  LBL_CONNECTION_LOST_MESSAGE: 'Kết nối với OS.js đã bị mất. Đang kết nối lại....',
  LBL_CONNECTION_RESTORED: 'Đã khôi phục kết nối',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Kết nối với máy chủ OS.js đã được khôi phục.',
  LBL_CONNECTION_FAILED: 'Kết nối thất bại',
  LBL_CONNECTION_FAILED_MESSAGE: 'Không thể kết nối đến máy chủ OS.js. Một số tính năng có thể không hoạt động ổn định.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Phát triển',
  LBL_APP_CAT_SCIENCE: 'Khoa học',
  LBL_APP_CAT_GAMES: 'Trò chơi',
  LBL_APP_CAT_GRAPHICS: 'Đồ họa',
  LBL_APP_CAT_NETWORK: 'Mạng',
  LBL_APP_CAT_MULTIMEDIA: 'Đa phương tiện',
  LBL_APP_CAT_OFFICE: 'Văn phòng',
  LBL_APP_CAT_SYSTEM: 'Hệ thống',
  LBL_APP_CAT_UTILITIES: 'Tiện ích',
  LBL_APP_CAT_OTHER: 'Ứng dụng khác',

  // UI
  LBL_LAUNCH_SELECT: 'Chọn ứng dụng',
  LBL_LAUNCH_SELECT_MESSAGE: 'Chọn ứng dụng để mở tập tin \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Thay đổi hình nền',
  LBL_DESKTOP_SELECT_THEME: 'Thay đổi chủ đề',
  LBL_SEARCH_TOOLTOP: 'Tìm kiếm dữ liệu ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Tìm kiếm...',
  LBL_SEARCH_WAIT: 'Đang tìm kiếm...',
  LBL_SEARCH_RESULT: 'Đang hiển thị {0} kết quả',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Phía trên',
  LBL_LEFT: 'Trái',
  LBL_RIGHT: 'Phải',
  LBL_BOTTOM: 'Phía dưới',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Lỗi',
  LBL_INFO: 'Thông tin',
  LBL_MESSAGE: 'Thông báo',
  LBL_WARNINIG: 'Cảnh báo',
  LBL_SUCCESS: 'Thành công',
  LBL_FAILURE: 'Thất bại',
  LBL_WINDOW: 'Cửa sổ',
  LBL_WINDOWS: 'Các cửa sổ',
  LBL_NOTIFICATION: 'Thông báo',
  LBL_NOTIFICATIONS: 'Các thông báo',
  LBL_TRAY: 'Mục khay hệ thống',
  LBL_NAME: 'Tên',
  LBL_TYPE: 'Kiểu',
  LBL_SIZE: 'Kích thước',
  LBL_FILE: 'Tập tin',
  LBL_NEW: 'Mới',
  LBL_OPEN: 'Mở',
  LBL_SAVE: 'Lưu',
  LBL_SAVEAS: 'Lưu như',
  LBL_OK: 'OK',
  LBL_ABORT: 'Hủy thao tác',
  LBL_CANCEL: 'Hủy bỏ',
  LBL_CLOSE: 'Đóng',
  LBL_QUIT: 'Thoát',
  LBL_YES: 'Có',
  LBL_NO: 'Không',
  LBL_GO: 'Đi',
  LBL_MKDIR: 'Tạo thư mục mới',
  LBL_MKFILE: 'Tạo tệp mới',
  LBL_COPY: 'Sao chép',
  LBL_PASTE: 'Dán',
  LBL_CUT: 'Cắt',
  LBL_MOVE: 'Di chuyển',
  LBL_RENAME: 'Đổi tên',
  LBL_DELETE: 'Xóa',
  LBL_DOWNLOAD: 'Tải về',
  LBL_REFRESH: 'Làm mới',
  LBL_RELOAD: 'Tải lại',
  LBL_HOME: 'Trang chủ',
  LBL_VIEW: 'Xem',
  LBL_HELP: 'Hướng dẫn',
  LBL_ABOUT: 'Thông tin',
  LBL_APPLICATION: 'Ứng dụng',
  LBL_APPLICATIONS: 'Các ứng dụng',
  LBL_KILL: 'Đóng',
  LBL_KILL_ALL: 'Đóng tất cả',
  LBL_MINIMIZE: 'Thu nhỏ',
  LBL_MAXIMIZE: 'Tối đa',
  LBL_RESTORE: 'Phục hồi',
  LBL_RAISE: 'Nâng lên',
  LBL_SHADE: 'Làm mở',
  LBL_UNSHADE: 'Bỏ làm mờ',
  LBL_ONTOP: 'Ở trên cùng',
  LBL_RESIZE: 'Thay đổi kích thước',
  LBL_BACK: 'Lùi',
  LBL_FORWARD: 'Tiến',
  LBL_UPLOAD: 'Tải lên',
  LBL_IMAGE: 'Ảnh'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  Julien Gomes Dias <abld@abld.info
 * @license Simplified BSD License
 */

const de_DE = {
  // Core
  ERR_REQUEST_STANDALONE: 'Im standalone modus können keine Anfragen gemacht werden.',
  ERR_REQUEST_NOT_OK: 'Beim Ausführen einer Anfrage ist der folgende Fehler aufgetreten: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filesystem \'{0}\' nicht gefunden',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filesystem für \'{0}\' nicht gefunden',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filesystem \'{0}\' nicht gemountet',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filesystem \'{0}\' schon gemountet',
  ERR_VFS_PATH_FORMAT_INVALID: 'Der gegebene Pfad \'{0}\' stimmt nicht mit \'name:/path\' überein',
  ERR_PACKAGE_NOT_FOUND: 'Paket-Metadaten  \'{0}\' nicht gefunden',
  ERR_PACKAGE_LOAD: 'Paket Laden \'{0}\' ist fehlgeschlagen: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Paketlaufzeit \'{0}\' nicht gefunden',
  ERR_PACKAGE_NO_METADATA: 'Metadaten für \'{0}\' nicht gefunden. Ist es in der Manifest?',
  ERR_PACKAGE_EXCEPTION: 'Eine Ausnahme trat in \'{0}\' auf.',
  ERR_WINDOW_ID_EXISTS: 'Fenster mit der ID \'{0}\' existiert schon',
  ERR_INVALID_LOCALE: 'Invalide Sprache \'{0}\'',
  LBL_CONNECTION_LOST: 'Verbindung unterbrochen',
  LBL_CONNECTION_LOST_MESSAGE: 'Die Verbindung zu OS.js wurde unterbrochen. Wiederverbinden... ',
  LBL_CONNECTION_RESTORED: 'Verbindung wiederhergestellt',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Die Verbindung zu dem OS.js wurde wieder hergestellt.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'IT-Entwicklung',
  LBL_APP_CAT_SCIENCE: 'Wissenschaft',
  LBL_APP_CAT_GAMES: 'Spiele',
  LBL_APP_CAT_GRAPHICS: 'Grafiken',
  LBL_APP_CAT_NETWORK: 'Netzwerk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Office',
  LBL_APP_CAT_SYSTEM: 'System',
  LBL_APP_CAT_UTILITIES: 'Dienstprogramme',
  LBL_APP_CAT_OTHER: 'Andere',

  // UI
  LBL_LAUNCH_SELECT: 'Applikation auswählen',
  LBL_LAUNCH_SELECT_MESSAGE: 'Applikation für \'{0}\' auswählen',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Hintergrundbild auswählen',
  LBL_DESKTOP_SELECT_THEME: 'Theme auswählen',
  LBL_SEARCH_TOOLTOP: 'Dateisysteme ({0}) finden',
  LBL_SEARCH_PLACEHOLDER: 'Dateisysteme finden...',
  LBL_SEARCH_WAIT: 'Suche...',
  LBL_SEARCH_RESULT: 'Anzeige von {0} Ergebnissen',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Oben',
  LBL_LEFT: 'Links',
  LBL_RIGHT: 'Rechts',
  LBL_BOTTOM: 'Unten',
  LBL_MENU: 'Menü',
  LBL_ERROR: 'Error',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Nachricht',
  LBL_WARNINIG: 'Warnung',
  LBL_SUCCESS: 'Success',
  LBL_FAILURE: 'Fehler',
  LBL_WINDOW: 'Fenster',
  LBL_WINDOWS: 'Fenster',
  LBL_NOTIFICATION: 'Benachrichtigung',
  LBL_NOTIFICATIONS: 'Benachrichtigungen',
  LBL_TRAY: 'Infobereich-Eintrag',
  LBL_NAME: 'Name',
  LBL_TYPE: 'Typ',
  LBL_SIZE: 'Größe',
  LBL_FILE: 'Datei',
  LBL_NEW: 'Neue',
  LBL_OPEN: 'Öffnen',
  LBL_SAVE: 'Speichern',
  LBL_SAVEAS: 'Speichern als',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abbrechen',
  LBL_CANCEL: 'Beenden',
  LBL_CLOSE: 'Schließen',
  LBL_QUIT: 'Verlassen',
  LBL_YES: 'Ja',
  LBL_NO: 'Nein',
  LBL_GO: 'Los',
  LBL_MKDIR: 'Neues Verzeichnis erstellen',
  LBL_MKFILE: 'Neue Datei erstellen',
  LBL_COPY: 'Kopieren',
  LBL_PASTE: 'Einfügen',
  LBL_CUT: 'Ausschneiden',
  LBL_MOVE: 'Verschieben',
  LBL_RENAME: 'Umbenennen',
  LBL_DELETE: 'Löschen',
  LBL_DOWNLOAD: 'Herunterladen',
  LBL_REFRESH: 'Aktualisieren',
  LBL_RELOAD: 'Neu laden',
  LBL_HOME: 'Startseite',
  LBL_VIEW: 'Ansicht',
  LBL_HELP: 'Hilfe',
  LBL_ABOUT: 'Über',
  LBL_APPLICATION: 'Anwendungsprogramme',
  LBL_APPLICATIONS: 'Anwendungsprogrammen',
  LBL_KILL: 'Beenden',
  LBL_KILL_ALL: 'Alle benden'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  lijun <lijun_ay@126.com>
 * @license Simplified BSD License
 */

const zh_CN = {
  // Core
  ERR_REQUEST_STANDALONE: '无法在独立模式下发出请求。',
  ERR_REQUEST_NOT_OK: '执行请求时发生错误：{0}',
  ERR_VFS_MOUNT_NOT_FOUND: '找不到文件系统 \'{0}\' ',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: '找不到\'{0}\'的文件系统',
  ERR_VFS_MOUNT_NOT_MOUNTED: '文件系统 \'{0}\' 未挂载',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: '文件系统 \'{0}\' 已挂载',
  ERR_VFS_PATH_FORMAT_INVALID: '给定路径\'{0}\'与\'name:/path\'不匹配',
  ERR_PACKAGE_NOT_FOUND: '未找到包的元数据\'{0}\'',
  ERR_PACKAGE_LOAD: '加载包 \'{0}\' 失败： {1}',
  ERR_PACKAGE_NO_RUNTIME: '未找到运行包 \'{0}\' ',
  ERR_PACKAGE_NO_METADATA: '找不到 \'{0}\' 的元数据。它在清单（manifest）中吗？',
  ERR_PACKAGE_EXCEPTION: '\'{0}\'发生异常',
  ERR_WINDOW_ID_EXISTS: 'ID为\'{0}\'的窗口已存在',
  ERR_INVALID_LOCALE: '无效的区域设置 \'{0}\'',
  LBL_CONNECTION_LOST: '连接丢失',
  LBL_CONNECTION_LOST_MESSAGE: '与OS.js的连接丢失了。重新连接....',
  LBL_CONNECTION_RESTORED: '连接已恢复',
  LBL_CONNECTION_RESTORED_MESSAGE: '已恢复与OS.js服务器的连接。',
  LBL_CONNECTION_FAILED: '连接失败',
  LBL_CONNECTION_FAILED_MESSAGE: '无法建立与OS.js的连接。 某些功能可能无法正常工作。',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: '开发',
  LBL_APP_CAT_SCIENCE: '科学',
  LBL_APP_CAT_GAMES: '游戏',
  LBL_APP_CAT_GRAPHICS: '图像',
  LBL_APP_CAT_NETWORK: '网络',
  LBL_APP_CAT_MULTIMEDIA: '媒体',
  LBL_APP_CAT_OFFICE: '办公',
  LBL_APP_CAT_SYSTEM: '系统',
  LBL_APP_CAT_UTILITIES: '工具',
  LBL_APP_CAT_OTHER: '其他',

  // UI
  LBL_LAUNCH_SELECT: '选择应用程序',
  LBL_LAUNCH_SELECT_MESSAGE: '选择\'{0}\'的应用程序',
  LBL_DESKTOP_SELECT_WALLPAPER: '选择壁纸',
  LBL_DESKTOP_SELECT_THEME: '选择主题',
  LBL_SEARCH_TOOLTOP: '搜索文件系统 ({0})',
  LBL_SEARCH_PLACEHOLDER: '搜索文件系统...',
  LBL_SEARCH_WAIT: '搜索...',
  LBL_SEARCH_RESULT: '显示{0}个结果',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KB',
  LBL_FS_MIB: 'MB',
  LBL_FS_GIB: 'GB',

  // Generic
  LBL_TOP: '上',
  LBL_LEFT: '左',
  LBL_RIGHT: '右',
  LBL_BOTTOM: '下',
  LBL_MENU: '菜单',
  LBL_ERROR: '错误',
  LBL_INFO: '信息',
  LBL_MESSAGE: '消息',
  LBL_WARNINIG: '警告',
  LBL_SUCCESS: '成功',
  LBL_FAILURE: '失败',
  LBL_WINDOW: '窗口',
  LBL_WINDOWS: '窗口',
  LBL_NOTIFICATION: '通知',
  LBL_NOTIFICATIONS: '通知',
  LBL_TRAY: '托盘',
  LBL_NAME: '名称',
  LBL_TYPE: '类型',
  LBL_SIZE: '大小',
  LBL_FILE: '文件',
  LBL_NEW: '新建',
  LBL_OPEN: '打开',
  LBL_SAVE: '保存',
  LBL_SAVEAS: '另存为',
  LBL_OK: '确定',
  LBL_ABORT: '中止',
  LBL_CANCEL: '取消',
  LBL_CLOSE: '关闭',
  LBL_QUIT: '退出',
  LBL_YES: '是',
  LBL_NO: '否',
  LBL_GO: '进行',
  LBL_MKDIR: '创建新目录',
  LBL_MKFILE: '创建新文件',
  LBL_COPY: '复制',
  LBL_PASTE: '粘贴',
  LBL_CUT: '剪切',
  LBL_MOVE: '移动',
  LBL_RENAME: '重命名',
  LBL_DELETE: '删除',
  LBL_DOWNLOAD: '下载',
  LBL_REFRESH: '刷新',
  LBL_RELOAD: '刷新',
  LBL_HOME: '主页',
  LBL_VIEW: '视图',
  LBL_HELP: '帮助',
  LBL_ABOUT: '关于',
  LBL_APPLICATION: '应用程序',
  LBL_APPLICATIONS: '应用程序',
  LBL_KILL: '杀死',
  LBL_KILL_ALL: '全部杀死',
  LBL_MINIMIZE: '最小化',
  LBL_MAXIMIZE: '最大化',
  LBL_RESTORE: '恢复',
  LBL_RAISE: '上浮',
  LBL_SHADE: '置后',
  LBL_UNSHADE: '置前',
  LBL_ONTOP: '顶端',
  LBL_RESIZE: '调整',
  LBL_BACK: '后退',
  LBL_FORWARD: '前进',
  LBL_UPLOAD: '上传',
  LBL_IMAGE: '图像'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 *
 * @author  Morteza Javan <javan.it@gmail.com>
 * @license Simplified BSD License
 */

const fa_FA = {
  // Core
  ERR_REQUEST_STANDALONE: 'امکان اجرای درخواست در حالت واحد وجود ندارد.',
  ERR_REQUEST_NOT_OK: 'خطایی در حال انجام این درخواست رخ داد: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'سیستم فایل \'{0}\' پیدا نشد',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'سیستم فایل برای \'{0}\' پیدا نشد',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'سیستم فایل \'{0}\' متصل نیست',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'سیستم فایل \'{0}\' از قبل متصل شده است',
  ERR_VFS_PATH_FORMAT_INVALID: 'آدرس \'{0}\' با الگو مطابقت ندارد \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'فراداده بسته \'{0}\' پیدا نشد',
  ERR_PACKAGE_LOAD: 'بارگزاری بسته \'{0}\' دچار خطا شد: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'فایل های اجرایی \'{0}\' پیدا نشد',
  ERR_PACKAGE_NO_METADATA: 'فراداده برای \'{0}\' پیدا نشد. ممکن است در مانیفست باشد؟?',
  ERR_PACKAGE_EXCEPTION: 'بروز شرایط استثنا \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'پنجره با شناسه \'{0}\' قبلا وجود دارد',
  ERR_INVALID_LOCALE: 'زبان نامعتبر \'{0}\'',
  LBL_CONNECTION_LOST: 'از دست رفتن ارتباط',
  LBL_CONNECTION_LOST_MESSAGE: 'ارتباط با سرور قطع شد. در حال تلاش ....',
  LBL_CONNECTION_RESTORED: 'ارتباط بازیابی شد',
  LBL_CONNECTION_RESTORED_MESSAGE: 'ارتباط با سرور مجدد برقرار شد.',
  LBL_CONNECTION_FAILED: 'ارتباط با خطا مواجه شد',
  LBL_CONNECTION_FAILED_MESSAGE: 'ارتباط نمیتواند با سرور برقرار شود.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'توسعه',
  LBL_APP_CAT_SCIENCE: 'علمی',
  LBL_APP_CAT_GAMES: 'بازی',
  LBL_APP_CAT_GRAPHICS: 'گرافیک',
  LBL_APP_CAT_NETWORK: 'شبکه',
  LBL_APP_CAT_MULTIMEDIA: 'چندرسانه ای',
  LBL_APP_CAT_OFFICE: 'اداری',
  LBL_APP_CAT_SYSTEM: 'سیستمی',
  LBL_APP_CAT_UTILITIES: 'ابزارها',
  LBL_APP_CAT_OTHER: 'سایر',

  // UI
  LBL_LAUNCH_SELECT: 'انتخاب برنامه کاربردی',
  LBL_LAUNCH_SELECT_MESSAGE: 'انتخاب برنامه کاربردی برای \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'انتخاب کاغذ دیواری',
  LBL_DESKTOP_SELECT_THEME: 'انتخاب الگو',
  LBL_SEARCH_TOOLTOP: 'جستجوی سیستم فایل ({0})',
  LBL_SEARCH_PLACEHOLDER: 'جستجوی سیستم فایل...',
  LBL_SEARCH_WAIT: 'در جال جستجو...',
  LBL_SEARCH_RESULT: 'نمایش {0} نتیجه',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'کیلوبایت',
  LBL_FS_MIB: 'مگابایت',
  LBL_FS_GIB: 'گیگابایت',

  // Generic
  LBL_TOP: 'بالا',
  LBL_LEFT: 'چپ',
  LBL_RIGHT: 'راست',
  LBL_BOTTOM: 'پایین',
  LBL_MENU: 'منوی اصلی',
  LBL_ERROR: 'خطا',
  LBL_INFO: 'نکته',
  LBL_MESSAGE: 'پیام',
  LBL_WARNINIG: 'هشدار',
  LBL_SUCCESS: 'موفق',
  LBL_FAILURE: 'شکست',
  LBL_WINDOW: 'پنجره',
  LBL_WINDOWS: 'پنجره ها',
  LBL_NOTIFICATION: 'اطلاعیه',
  LBL_NOTIFICATIONS: 'اطلاعیه ها',
  LBL_TRAY: 'سینی ابزار',
  LBL_NAME: 'نام',
  LBL_TYPE: 'نوع',
  LBL_SIZE: 'اندازه',
  LBL_FILE: 'فایل',
  LBL_NEW: 'جدید',
  LBL_OPEN: 'بازکردن',
  LBL_OPEN_WITH: 'باز کردن با...',
  LBL_SAVE: 'ذخیره',
  LBL_SAVEAS: 'ذخیره جدید',
  LBL_OK: 'تایید',
  LBL_ABORT: 'بیخیال',
  LBL_CANCEL: 'رد',
  LBL_CLOSE: 'بستن',
  LBL_QUIT: 'خروج',
  LBL_YES: 'بله',
  LBL_NO: 'خیر',
  LBL_GO: 'برو',
  LBL_MKDIR: 'ایجاد پوشه جدید',
  LBL_MKFILE: 'ایجاد فایل جدید',
  LBL_COPY: 'کپی',
  LBL_PASTE: 'الصاق',
  LBL_CUT: 'برداشتن',
  LBL_MOVE: 'انتقال',
  LBL_RENAME: 'تغییرنام',
  LBL_DELETE: 'حذف',
  LBL_DOWNLOAD: 'دانلود',
  LBL_REFRESH: 'نوسازی',
  LBL_RELOAD: 'بارگزاری مجدد',
  LBL_HOME: 'خانه',
  LBL_VIEW: 'نمایش',
  LBL_HELP: 'کمک',
  LBL_ABOUT: 'درباره',
  LBL_APPLICATION: 'برنامه کاربردی',
  LBL_APPLICATIONS: 'برنامه های کاربردی',
  LBL_KILL: 'از بین بردن',
  LBL_KILL_ALL: 'از بین بردن همه',
  LBL_MINIMIZE: 'کمینه',
  LBL_MAXIMIZE: 'بیشینه',
  LBL_RESTORE: 'عادی',
  LBL_RAISE: 'شناور',
  LBL_SHADE: 'بالا بردن',
  LBL_UNSHADE: 'پایین آوردن',
  LBL_ONTOP: 'در بالا',
  LBL_RESIZE: 'تغییراندازه',
  LBL_BACK: 'عقب',
  LBL_FORWARD: 'جلو',
  LBL_UPLOAD: 'آپلود',
  LBL_IMAGE: 'تصویر',
  LBL_CREATE_SHORTCUT: 'ایجاد میانبر',
  LBL_REMOVE_SHORTCUT: 'حذف میانبر',
  LBL_EDIT: 'ویرایش'
};

/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *

 * @author  Matheus Felipe <matheusfelipeog@gmail.com>
 * @license Simplified BSD License
 */

const pt_BR = {
  // Core
  ERR_REQUEST_STANDALONE: 'Não é possível fazer solicitações autônomas.',
  ERR_REQUEST_NOT_OK: 'Ocorreu um erro ao executar a solicitação: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Sistema de arquivo \'{0}\' não encontrado',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Sistema de arquivo não encontrado para \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Sistema de arquivo \'{0}\' não montado',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Sistema de arquivo \'{0}\' já montado',
  ERR_VFS_PATH_FORMAT_INVALID: 'O caminho especificado \'{0}\' não corresponde \'name:/path\'',
  ERR_PACKAGE_NOT_FOUND: 'Metadados do pacote \'{0}\' não encontrados',
  ERR_PACKAGE_LOAD: 'Carregamento do pacote \'{0}\' falhou: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Tempo de execução do pacote \'{0}\' não encontrado',
  ERR_PACKAGE_NO_METADATA: 'Metadados não encontrado para \'{0}\'. Está no manifesto?',
  ERR_PACKAGE_EXCEPTION: 'Ocorreu uma exceção em \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Janela com ID \'{0}\' Já existe',
  ERR_INVALID_LOCALE: 'Código de idioma inválido \'{0}\'',
  LBL_CONNECTION_LOST: 'Conexão perdida',
  LBL_CONNECTION_LOST_MESSAGE: 'A conexão com OS.js foi perdida. Reconectando....',
  LBL_CONNECTION_RESTORED: 'Conexão restaurada',
  LBL_CONNECTION_RESTORED_MESSAGE: 'A conexão com o servidor OS.js foi restaurada.',
  LBL_CONNECTION_FAILED: 'Falha na conexão',
  LBL_CONNECTION_FAILED_MESSAGE: 'A conexão com OS.js não pode ser estabelecida. Alguns recursos podem não funcionar corretamente.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Desenvolvimento',
  LBL_APP_CAT_SCIENCE: 'Ciência',
  LBL_APP_CAT_GAMES: 'Jogos',
  LBL_APP_CAT_GRAPHICS: 'Grâfico',
  LBL_APP_CAT_NETWORK: 'Rede',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Escritório',
  LBL_APP_CAT_SYSTEM: 'Sistema',
  LBL_APP_CAT_UTILITIES: 'Utilidades',
  LBL_APP_CAT_OTHER: 'Outros',

  // UI
  LBL_LAUNCH_SELECT: 'Selecionar aplicativo',
  LBL_LAUNCH_SELECT_MESSAGE: 'Selecionar aplicativo para \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Selecionar papel de parede',
  LBL_DESKTOP_SELECT_THEME: 'Selecionar tema',
  LBL_SEARCH_TOOLTOP: 'Pesquisar no sistema de arquivos ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Pesquisar...',
  LBL_SEARCH_WAIT: 'Buscando...',
  LBL_SEARCH_RESULT: 'Mostrando {0} resultados',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topo',
  LBL_LEFT: 'Esquerda',
  LBL_RIGHT: 'Direita',
  LBL_BOTTOM: 'Inferior',
  LBL_MENU: 'Menu',
  LBL_ERROR: 'Erro',
  LBL_INFO: 'Informação',
  LBL_MESSAGE: 'Mensagem',
  LBL_WARNINIG: 'Atenção',
  LBL_SUCCESS: 'Sucesso',
  LBL_FAILURE: 'Falha',
  LBL_WINDOW: 'Janela',
  LBL_WINDOWS: 'Janelas',
  LBL_NOTIFICATION: 'Notificação',
  LBL_NOTIFICATIONS: 'Notificações',
  LBL_TRAY: 'Entrada',
  LBL_NAME: 'Nome',
  LBL_TYPE: 'Tipo',
  LBL_SIZE: 'Tamanho',
  LBL_FILE: 'Arquivo',
  LBL_NEW: 'Novo',
  LBL_OPEN: 'Abrir',
  LBL_OPEN_WITH: 'Abrir com...',
  LBL_SAVE: 'Salvar',
  LBL_SAVEAS: 'Salvar como',
  LBL_OK: 'OK',
  LBL_ABORT: 'Abortar',
  LBL_CANCEL: 'Cancelar',
  LBL_CLOSE: 'Fechar',
  LBL_QUIT: 'Sair',
  LBL_YES: 'Sim',
  LBL_NO: 'Não',
  LBL_GO: 'Ir',
  LBL_MKDIR: 'Criar novo diretório',
  LBL_MKFILE: 'Criar novo arquivo',
  LBL_COPY: 'Copiar',
  LBL_PASTE: 'Colar',
  LBL_CUT: 'Recortar',
  LBL_MOVE: 'Mover',
  LBL_RENAME: 'Renomear',
  LBL_DELETE: 'Deletar',
  LBL_DOWNLOAD: 'Download',
  LBL_REFRESH: 'Atualizar',
  LBL_RELOAD: 'Recarregar',
  LBL_HOME: 'Home',
  LBL_VIEW: 'Visualização',
  LBL_HELP: 'Ajuda',
  LBL_ABOUT: 'Sobre',
  LBL_APPLICATION: 'Aplicativo',
  LBL_APPLICATIONS: 'Aplicativos',
  LBL_KILL: 'Finalizar',
  LBL_KILL_ALL: 'Finalizar tudo',
  LBL_MINIMIZE: 'Minimizar',
  LBL_MAXIMIZE: 'Maximizar',
  LBL_RESTORE: 'Restaurar',
  LBL_RAISE: 'Levantar',
  LBL_SHADE: 'Sombra',
  LBL_UNSHADE: 'Tirar sombra',
  LBL_ONTOP: 'No topo',
  LBL_RESIZE: 'Redimensionar',
  LBL_BACK: 'Voltar',
  LBL_FORWARD: 'Avançar',
  LBL_UPLOAD: 'Enviar',
  LBL_IMAGE: 'Imagem',
  LBL_CREATE_SHORTCUT: 'Criar atalho',
  LBL_REMOVE_SHORTCUT: 'Remover atalho',
  LBL_EDIT: 'Editar'
};


const ru_RU = {
  // Core
  ERR_REQUEST_STANDALONE: 'Невозможно делать запросы в автономном режиме.',
  ERR_REQUEST_NOT_OK: 'Произошла ошибка при запросе: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Файловая система \'{0}\' не найдена',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Файловая система не найдена для \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Файловая система \'{0}\' не вмонтирована',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Файловая система \'{0}\' уже вмонтирована',
  ERR_VFS_PATH_FORMAT_INVALID: 'Заданный путь \'{0}\' не соответсвует формату \'имя:/путь\'',
  ERR_PACKAGE_NOT_FOUND: 'Метаданные пакета \'{0}\' не найдены',
  ERR_PACKAGE_LOAD: 'Ошибка загрузки пакета \'{0}\': {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Рантайм пакета \'{0}\' не найден',
  ERR_PACKAGE_NO_METADATA: 'Метаданные не найдены для \'{0}\'. Is it in the manifest?',
  ERR_PACKAGE_EXCEPTION: 'Произошло исключение в \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Окно с ID \'{0}\' уже существует',
  ERR_INVALID_LOCALE: 'Неправильная локаль \'{0}\'',
  LBL_CONNECTION_LOST: 'Соединение Потеряно',
  LBL_CONNECTION_LOST_MESSAGE: 'Соединение с OS.js было потеряно. Переподключаемся....',
  LBL_CONNECTION_RESTORED: 'Соединение Восстановлено',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Соединение с сервером OS.js было восстановлено.',
  LBL_CONNECTION_FAILED: 'Ошибка Соединения',
  LBL_CONNECTION_FAILED_MESSAGE: 'Соединение с OS.js не может быть установлено. Некоторые возможности могут не работать корректно.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Разработка',
  LBL_APP_CAT_SCIENCE: 'Вычисления',
  LBL_APP_CAT_GAMES: 'Игры',
  LBL_APP_CAT_GRAPHICS: 'Графика',
  LBL_APP_CAT_NETWORK: 'Сеть',
  LBL_APP_CAT_MULTIMEDIA: 'Мультимедиа',
  LBL_APP_CAT_OFFICE: 'Офис',
  LBL_APP_CAT_SYSTEM: 'Система',
  LBL_APP_CAT_UTILITIES: 'Утилиты',
  LBL_APP_CAT_OTHER: 'Другие',

  // UI
  LBL_LAUNCH_SELECT: 'Выберите приложение',
  LBL_LAUNCH_SELECT_MESSAGE: 'Выберите приложение \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Выберите обои',
  LBL_DESKTOP_SELECT_THEME: 'Выберите тему',
  LBL_SEARCH_TOOLTOP: 'Поиск файловой системы ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Поиск файловой системы...',
  LBL_SEARCH_WAIT: 'Поиск...',
  LBL_SEARCH_RESULT: 'Показано {0} результатов',

  // FS
  LBL_FS_B: 'Б',
  LBL_FS_M: 'М',
  LBL_FS_G: 'Г',
  LBL_FS_KIB: 'ГиБ',
  LBL_FS_MIB: 'МиБ',
  LBL_FS_GIB: 'ГиБ',

  // Generic
  LBL_TOP: 'Вверх',
  LBL_LEFT: 'Лево',
  LBL_RIGHT: 'Право',
  LBL_BOTTOM: 'Вниз',
  LBL_MENU: 'Меню',
  LBL_ERROR: 'Ошибка',
  LBL_INFO: 'Информация',
  LBL_MESSAGE: 'Сообщение',
  LBL_WARNINIG: 'Предупреждение',
  LBL_SUCCESS: 'Успешно',
  LBL_FAILURE: 'Ошибка',
  LBL_WINDOW: 'Окно',
  LBL_WINDOWS: 'Окна',
  LBL_NOTIFICATION: 'Оповещение',
  LBL_NOTIFICATIONS: 'Оповещения',
  LBL_TRAY: 'Трэй',
  LBL_NAME: 'Имя',
  LBL_TYPE: 'Тип',
  LBL_SIZE: 'Размер',
  LBL_FILE: 'Файл',
  LBL_NEW: 'Новый',
  LBL_OPEN: 'Открыть',
  LBL_OPEN_WITH: 'Открыть с...',
  LBL_SAVE: 'Сохранить',
  LBL_SAVEAS: 'Сохранить как',
  LBL_OK: 'ОК',
  LBL_ABORT: 'Прервать',
  LBL_CANCEL: 'Отмена',
  LBL_CLOSE: 'Закрыть',
  LBL_QUIT: 'Выйти',
  LBL_YES: 'Да',
  LBL_NO: 'Нет',
  LBL_GO: 'Вперед',
  LBL_MKDIR: 'Новая папка',
  LBL_MKFILE: 'Новый файл',
  LBL_COPY: 'Скопировать',
  LBL_PASTE: 'Вставить',
  LBL_CUT: 'Вырезать',
  LBL_MOVE: 'Переместить',
  LBL_RENAME: 'Переименовать',
  LBL_DELETE: 'Удалить',
  LBL_DOWNLOAD: 'Скачать',
  LBL_REFRESH: 'Обновить',
  LBL_RELOAD: 'Перезагрузить',
  LBL_HOME: 'Домой',
  LBL_VIEW: 'Вид',
  LBL_HELP: 'Помощь',
  LBL_ABOUT: 'О программе',
  LBL_APPLICATION: 'Приложение',
  LBL_APPLICATIONS: 'Приложения',
  LBL_KILL: 'Убить',
  LBL_KILL_ALL: 'Убить все',
  LBL_MINIMIZE: 'Свернуть',
  LBL_MAXIMIZE: 'Развернуть',
  LBL_RESTORE: 'Восстановить',
  LBL_RAISE: 'Raise',
  LBL_SHADE: 'Shade',
  LBL_UNSHADE: 'Unshade',
  LBL_ONTOP: 'Поверх окон',
  LBL_RESIZE: 'Размер',
  LBL_BACK: 'Назад',
  LBL_FORWARD: 'Вперед',
  LBL_UPLOAD: 'Загрузить',
  LBL_IMAGE: 'Картинка',
  LBL_CREATE_SHORTCUT: 'Создать ярлык',
  LBL_REMOVE_SHORTCUT: 'Удалить ярлык'
};


const tr_TR = {
  // Core
  ERR_REQUEST_STANDALONE: 'Bağımsız modda talepde bulunulamaz.',
  ERR_REQUEST_NOT_OK: 'Talep gerçekleştirilirken bir hata oluştu: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: '\'{0}\' isimli dosya sistemi bulunamadı',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: '\'{0}\' için dosya sistemi bulunamadı',
  ERR_VFS_MOUNT_NOT_MOUNTED: '\'{0}\' isimli dosya sistemi çıkarılmadı',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: '\'{0}\' isimli dosya sistemi zaten çıkarıldı',
  ERR_VFS_PATH_FORMAT_INVALID: '\'{0}\' olarak verilen yol, \'name:/path\' ile eşleşmiyor',
  ERR_PACKAGE_PERMISSION_DENIED: '\'{0}\' dosyasını çalıştırmaya iznin yok',
  ERR_PACKAGE_NOT_FOUND: '\'{0}\' isimli paket meta verisi bulunamadı',
  ERR_PACKAGE_LOAD: '\'{0}\' paketinin yüklenmesi başarısız: {1}',
  ERR_PACKAGE_NO_RUNTIME: '\'{0}\' paketinin runtime verisi bulunamadı',
  ERR_PACKAGE_NO_METADATA: '\'{0}\' için meta verisi bulunamadı. Manifest\'de olabilir mi?',
  ERR_PACKAGE_EXCEPTION: '\'{0}\' konumunda beklenmeyen bir durum gerçekleşti',
  ERR_WINDOW_ID_EXISTS: '\'{0}\' ID\'sine sahip olan bir pencere zaten var',
  ERR_INVALID_LOCALE: 'Geçersiz yer \'{0}\'',
  LBL_CONNECTION_LOST: 'Bağlantı Koptu',
  LBL_CONNECTION_LOST_MESSAGE: 'OS.js\'ye olan bağlantı koptu. Yeniden bağlanılıyor....',
  LBL_CONNECTION_RESTORED: 'Bağlantı Yenilendi',
  LBL_CONNECTION_RESTORED_MESSAGE: 'OS.js\'ye olan bağlantı yenilendi.',
  LBL_CONNECTION_FAILED: 'Bağlantı Başarısız',
  LBL_CONNECTION_FAILED_MESSAGE: 'OS.js\'ye bağlanılamıyor. Çeşitli özellikler doğru çalışmayabilir.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Geliştirme',
  LBL_APP_CAT_SCIENCE: 'Bilim',
  LBL_APP_CAT_GAMES: 'Oyun',
  LBL_APP_CAT_GRAPHICS: 'Grafik',
  LBL_APP_CAT_NETWORK: 'Ağ',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedya',
  LBL_APP_CAT_OFFICE: 'Ofis',
  LBL_APP_CAT_SYSTEM: 'Sistem',
  LBL_APP_CAT_UTILITIES: 'Araçlar',
  LBL_APP_CAT_OTHER: 'Diğer',

  // UI
  LBL_LAUNCH_SELECT: 'Uygulama seç',
  LBL_LAUNCH_SELECT_MESSAGE: '\'{0}\' için uygulama seç',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Arkaplan seç',
  LBL_DESKTOP_SELECT_THEME: 'Tema seç',
  LBL_SEARCH_TOOLTOP: 'Dosya sistemi ({0}) ara',
  LBL_SEARCH_PLACEHOLDER: 'Dosya sistemlerini ara...',
  LBL_SEARCH_WAIT: 'Aranıyor...',
  LBL_SEARCH_RESULT: '{0} kadar sonuç gösteriliyor',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Arkaplan olarak ayarla',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Üst',
  LBL_LEFT: 'Sol',
  LBL_RIGHT: 'Sağ',
  LBL_BOTTOM: 'Alt',
  LBL_MENU: 'Menü',
  LBL_ERROR: 'Hata',
  LBL_INFO: 'Bilgi',
  LBL_MESSAGE: 'Mesaj',
  LBL_WARNINIG: 'Uyarı',
  LBL_SUCCESS: 'Başarı',
  LBL_FAILURE: 'Kusur',
  LBL_WINDOW: 'Pencere',
  LBL_WINDOWS: 'Pencereler',
  LBL_NOTIFICATION: 'Bildiri',
  LBL_NOTIFICATIONS: 'Bildiriler',
  LBL_TRAY: 'Tray Girişi',
  LBL_NAME: 'İsim',
  LBL_TYPE: 'Tür',
  LBL_SIZE: 'Boyut',
  LBL_FILE: 'Dosya',
  LBL_NEW: 'Yeni',
  LBL_OPEN: 'Aç',
  LBL_OPEN_WITH: 'Şununla aç:',
  LBL_SAVE: 'Kaydet',
  LBL_SAVEAS: 'Farklı Kaydet',
  LBL_OK: 'Tamam',
  LBL_ABORT: 'Durdur',
  LBL_CANCEL: 'İptal',
  LBL_CLOSE: 'Kapat',
  LBL_QUIT: 'Çık',
  LBL_YES: 'Evet',
  LBL_NO: 'Hayır',
  LBL_GO: 'Git',
  LBL_MKDIR: 'Yeni dizin oluştur',
  LBL_MKFILE: 'Yeni dosya oluştur',
  LBL_COPY: 'Kopyala',
  LBL_PASTE: 'Yapıştır',
  LBL_CUT: 'Kes',
  LBL_MOVE: 'Taşı',
  LBL_RENAME: 'Yeniden Adlandır',
  LBL_DELETE: 'Sil',
  LBL_DOWNLOAD: 'İndir',
  LBL_REFRESH: 'Yenile',
  LBL_RELOAD: 'Yeniden Yükle',
  LBL_HOME: 'Ev',
  LBL_VIEW: 'Göster',
  LBL_HELP: 'Yardım',
  LBL_ABOUT: 'Hakkında',
  LBL_APPLICATION: 'Uygulama',
  LBL_APPLICATIONS: 'Uygulamalar',
  LBL_KILL: 'Öldür',
  LBL_KILL_ALL: 'Hepsini öldür',
  LBL_MINIMIZE: 'Küçült',
  LBL_MAXIMIZE: 'Büyüt',
  LBL_RESTORE: 'Onar',
  LBL_RAISE: 'Yükselt',
  LBL_SHADE: 'Ört',
  LBL_UNSHADE: 'Örtme',
  LBL_ONTOP: 'Tepe',
  LBL_RESIZE: 'Yeniden boyutlandır',
  LBL_BACK: 'Geri',
  LBL_FORWARD: 'İleri',
  LBL_UPLOAD: 'Yükle',
  LBL_IMAGE: 'İmge',
  LBL_CREATE_SHORTCUT: 'Kısayol oluştur',
  LBL_REMOVE_SHORTCUT: 'Kısayolu sil',
  LBL_EDIT: 'Düzenle'
};


const sv_SE = {
  // Core
  ERR_REQUEST_STANDALONE: 'Det går inte att göra förfrågningar i fristående läge.',
  ERR_REQUEST_NOT_OK: 'Ett fel uppstod när en begäran utfördes: {0}',
  ERR_VFS_MOUNT_NOT_FOUND: 'Filsystemet \'{0}\' hittades inte',
  ERR_VFS_MOUNT_NOT_FOUND_FOR: 'Filsystemet hittades inte för \'{0}\'',
  ERR_VFS_MOUNT_NOT_MOUNTED: 'Filsystemet \'{0}\' inte monterat',
  ERR_VFS_MOUNT_ALREADY_MOUNTED: 'Filsystemet \'{0}\' redan monterat',
  ERR_VFS_PATH_FORMAT_INVALID: 'Angiven väg \'{0}\' matchar inte \'name:/path\'',
  ERR_PACKAGE_PERMISSION_DENIED: 'Du har inte tillåtelse att starta \'{0}\'',
  ERR_PACKAGE_NOT_FOUND: 'Paketmetadata \'{0}\' hittades inte',
  ERR_PACKAGE_LOAD: 'Paketladdning \'{0}\' misslyckades: {1}',
  ERR_PACKAGE_NO_RUNTIME: 'Paketets körtid \'{0}\' hittades inte',
  ERR_PACKAGE_NO_METADATA: 'Metadata hittades inte för \'{0}\'. Är det i manifestet?',
  ERR_PACKAGE_EXCEPTION: 'Ett undantag inträffade i \'{0}\'',
  ERR_WINDOW_ID_EXISTS: 'Fönster med ID \'{0}\' existerar redan',
  ERR_INVALID_LOCALE: 'Ogiltigt språk \'{0}\'',
  LBL_CONNECTION_LOST: 'Anslutning förlorad',
  LBL_CONNECTION_LOST_MESSAGE: 'Anslutningen till OS.js förlorades. Återansluter ....',
  LBL_CONNECTION_RESTORED: 'Anslutning återställd',
  LBL_CONNECTION_RESTORED_MESSAGE: 'Anslutningen till OS.js-servern återställdes.',
  LBL_CONNECTION_FAILED: 'Anslutningen misslyckades',
  LBL_CONNECTION_FAILED_MESSAGE: 'Anslutningen till OS.js kunde inte upprättas. Vissa funktioner kanske inte fungerar ordentligt.',

  // Application categories
  LBL_APP_CAT_DEVELOPMENT: 'Utveckling',
  LBL_APP_CAT_SCIENCE: 'Vetenskap',
  LBL_APP_CAT_GAMES: 'Spel',
  LBL_APP_CAT_GRAPHICS: 'Grafik',
  LBL_APP_CAT_NETWORK: 'Nätverk',
  LBL_APP_CAT_MULTIMEDIA: 'Multimedia',
  LBL_APP_CAT_OFFICE: 'Kontor',
  LBL_APP_CAT_SYSTEM: 'Systemet',
  LBL_APP_CAT_UTILITIES: 'Verktyg',
  LBL_APP_CAT_OTHER: 'Övrigt',

  // UI
  LBL_LAUNCH_SELECT: 'Välj applikation',
  LBL_LAUNCH_SELECT_MESSAGE: 'Välj applikation för \'{0}\'',
  LBL_DESKTOP_SELECT_WALLPAPER: 'Välj bakgrund',
  LBL_DESKTOP_SELECT_THEME: 'Välj tema',
  LBL_SEARCH_TOOLTOP: 'Sök filsystem ({0})',
  LBL_SEARCH_PLACEHOLDER: 'Sök filsystemen...',
  LBL_SEARCH_WAIT: 'Söker...',
  LBL_SEARCH_RESULT: 'Visar {0} resultat',
  LBL_DESKTOP_SET_AS_WALLPAPER: 'Använd som bakgrund',

  // FS
  LBL_FS_B: 'B',
  LBL_FS_M: 'M',
  LBL_FS_G: 'G',
  LBL_FS_KIB: 'KiB',
  LBL_FS_MIB: 'MiB',
  LBL_FS_GIB: 'GiB',

  // Generic
  LBL_TOP: 'Topp',
  LBL_LEFT: 'Vänster',
  LBL_RIGHT: 'Höger',
  LBL_BOTTOM: 'Botten',
  LBL_MENU: 'Meny',
  LBL_ERROR: 'Fel',
  LBL_INFO: 'Info',
  LBL_MESSAGE: 'Meddelande',
  LBL_WARNINIG: 'Varning',
  LBL_SUCCESS: 'Framgång',
  LBL_FAILURE: 'Fel',
  LBL_WINDOW: 'Fönster',
  LBL_WINDOWS: 'Fönster',
  LBL_NOTIFICATION: 'Meddelande',
  LBL_NOTIFICATIONS: 'Meddelanden',
  LBL_TRAY: 'Fackinmatning',
  LBL_NAME: 'Namn',
  LBL_TYPE: 'Typ',
  LBL_SIZE: 'Storlek',
  LBL_FILE: 'Fil',
  LBL_NEW: 'Ny',
  LBL_OPEN: 'Öppna',
  LBL_OPEN_WITH: 'Öppna med...',
  LBL_SAVE: 'Spara',
  LBL_SAVEAS: 'Spara som',
  LBL_OK: 'OK',
  LBL_ABORT: 'Avbryta',
  LBL_CANCEL: 'Avbryt',
  LBL_CLOSE: 'Stäng',
  LBL_QUIT: 'Sluta',
  LBL_YES: 'Ja',
  LBL_NO: 'Nej',
  LBL_GO: 'Gå',
  LBL_MKDIR: 'Skapa ny katalog',
  LBL_MKFILE: 'Skapa ny fil',
  LBL_COPY: 'Kopiera',
  LBL_PASTE: 'Klistra in',
  LBL_CUT: 'Klipp ut',
  LBL_MOVE: 'Flytta',
  LBL_RENAME: 'Döp om',
  LBL_DELETE: 'Radera',
  LBL_DOWNLOAD: 'Ladda ner',
  LBL_REFRESH: 'Uppdatera',
  LBL_RELOAD: 'Ladda om',
  LBL_HOME: 'Hem',
  LBL_VIEW: 'Se',
  LBL_HELP: 'Hjälp',
  LBL_ABOUT: 'Om',
  LBL_APPLICATION: 'Ansökan',
  LBL_APPLICATIONS: 'Applikationer',
  LBL_KILL: 'Döda',
  LBL_KILL_ALL: 'Döda alla',
  LBL_MINIMIZE: 'Minimera',
  LBL_MAXIMIZE: 'Maximera',
  LBL_RESTORE: 'Återställ',
  LBL_RAISE: 'Höj',
  LBL_SHADE: 'Skugga',
  LBL_UNSHADE: 'Avskugga',
  LBL_ONTOP: 'Överst',
  LBL_RESIZE: 'Ändra storlek',
  LBL_BACK: 'Back',
  LBL_FORWARD: 'Forward',
  LBL_UPLOAD: 'Ladda upp',
  LBL_IMAGE: 'Bild',
  LBL_CREATE_SHORTCUT: 'Skapa genväg',
  LBL_REMOVE_SHORTCUT: 'ta bort genväg',
  LBL_EDIT: 'Redigera'
};


var translations = /*#__PURE__*/Object.freeze({
  __proto__: null,
  en_EN: en_EN,
  fr_FR: fr_FR,
  nb_NO: nb_NO,
  sl_SI: sl_SI,
  vi_VN: vi_VN,
  de_DE: de_DE,
  zh_CN: zh_CN,
  fa_FA: fa_FA,
  pt_BR: pt_BR,
  ru_RU: ru_RU,
  tr_TR: tr_TR,
  sv_SE: sv_SE
});


/**
 * Basic Application Options
 *
 * @typedef {Object} BasicApplicationOptions
 * @property {string[]} [mimeTypes] What MIME types to support (all/fallback)
 * @property {string[]} [loadMimeTypes] What MIME types to support on load
 * @property {string[]} [saveMimeTypes] What MIME types to support on save
 * @property {string} [defaultFilename] Default filename of a new file
 */

/**
 * Basic Application Helper
 *
 * A class for helping creating basic applications with open/load/create functionality.
 * Also sets the internal proc args for sessions.
 */
class BasicApplication extends EventEmitter {

  /**
   * Basic Application Constructor
   * @param {Core} core OS.js Core API
   * @param {Application} proc The application process
   * @param {Window} win The main application window
   * @param {BasicApplicationOptions} [options={}] Basic application options
   */
  constructor(core, proc, win, options = {}) {
    super('BasicApplication<' + proc.name + '>');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Application instance reference
     * @type {Application}
     * @readonly
     */
    this.proc = proc;

    /**
     * Window instance reference
     * @type {Window}
     * @readonly
     */
    this.win = win;

    /**
     * Basic Application Options
     * @type {BasicApplicationOptions}
     * @readonly
     */
    this.options = {
      mimeTypes: proc.metadata.mimes || [],
      loadMimeTypes: [],
      saveMimeTypes: [],
      defaultFilename: 'New File',
      ...options
    };
  }

  /**
   * Destroys all Basic Application internals
   */
  destroy() {
    this.off();
    super.destroy();
  }

  /**
   * Initializes the application
   * @return {Promise<boolean>}
   */
  init() {
    if (this.proc.args.file) {
      this.open(this.proc.args.file);
    } else {
      this.create();
    }

    return Promise.resolve(true);
  }

  /**
   * Gets options for a dialog
   * @param {string} type Dialog type
   * @return {object}
   */
  getDialogOptions(type, options = {}) {
    const {
      file,
      ...rest
    } = options;

    const {
      defaultFilename,
      mimeTypes,
      loadMimeTypes,
      saveMimeTypes
    } = this.options;

    const currentFile = file ? file : this.proc.args.file;
    const defaultPath = this.core.config('vfs.defaultPath');
    const path = currentFile ? currentFile.path : null;

    let mime = type === 'open' ? loadMimeTypes : saveMimeTypes;
    if (!mime.length) {
      mime = mimeTypes;
    }

    return [{
      type,
      mime,
      filename: path ? basename(path) : defaultFilename,
      path: path ? pathname(path) : defaultPath,
      ...rest
    }, {
      parent: this.win,
      attributes: {
        modal: true
      }
    }];
  }

  /**
   * Updates the window title to match open file
   */
  updateWindowTitle() {
    if (this.win) {
      const {translatableFlat} = this.core.make('osjs/locale');
      const prefix = translatableFlat(this.proc.metadata.title);
      const title = this._createTitle(prefix);

      this.win.setTitle(title);
    }
  }

  /**
   * Creates a new dialog of a type
   * @param {string} type Dialog type
   * @param {Function} cb Callback
   * @param {object} [options] Override options
   */
  createDialog(type, cb, options = {}) {
    const [args, opts] = this.getDialogOptions(type, options);

    if (this.core.has('osjs/dialog')) {
      this.core.make('osjs/dialog', 'file', args, opts, (btn, item) => {
        if (btn === 'ok') {
          cb(item);
        }
      });
    }
  }

  /**
   * Opens given file
   *
   * Does not do any actual VFS operation
   *
   * @param {VFSFile} file A file
   */
  open(item) {
    this._setFile(item, 'open-file');
  }

  /**
   * Saves given file
   *
   * Does not do any actual VFS operation
   *
   * @param {VFSFile} file A file
   */
  save(item) {
    this._setFile(item, 'save-file');
  }

  /**
   * Create new file
   *
   * Does not do any actual VFS operation
   */
  create() {
    this.proc.args.file = null;

    this.emit('new-file');

    this.updateWindowTitle();
  }

  /**
   * Create new file
   * @see BasicApplication#create
   */
  createNew() {
    this.create();
  }

  /**
   * Creates a new save dialog
   * @param {object} [options] Dialog options
   */
  createSaveDialog(options = {}) {
    this.createDialog('save', item => this.save(item), options);
  }

  /**
   * Creates a new load dialog
   * @param {object} [options] Dialog options
   */
  createOpenDialog(options = {}) {
    this.createDialog('open', item => this.open(item), options);
  }

  /**
   * Sets file from open/save action
   *
   * @private
   * @param {VFSFile} item File
   * @param {string} eventName Event to fire
   */
  _setFile(item, eventName) {
    this.proc.args.file = {...item};
    this.emit(eventName, item);
    this.updateWindowTitle();
  }

  /**
   * Creates the window title
   *
   * @private
   * @param {string} prefix Title prefix
   * @return {string}
   */
  _createTitle(prefix) {
    const title = this.proc.args.file
      ? basename(this.proc.args.file.path)
      : this.options.defaultFilename;

    return title
      ? `${prefix} - ${title}`
      : prefix;
  }
}


/**
 * Core Provider Locale Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderLocaleContract
 * @property {Function} format
 * @property {Function} translate
 * @property {Function} translatable
 * @property {Function} translatableFlat
 * @property {Function} getLocale
 * @property {Function} setLocale
 */

/**
 * Core Provider Window Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderWindowContract
 * @property {Function} create
 * @property {Function} list
 * @property {Function} last
 */

/**
 * Core Provider DnD Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderDnDContract
 * @property {Function} draggable
 * @property {Function} droppable
 */

/**
 * Core Provider Theme Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderDOMContract
 * @property {Function} script
 * @property {Function} style
 */

/**
 * Core Provider Theme Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderThemeContract
 * @property {Function} resource
 * @property {Function} icon
 */

/**
 * Core Provider Sound Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderSoundContract
 * @property {Function} resource
 * @property {Function} play
 */

/**
 * Core Provider Session Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderSessionContract
 * @property {Function} save
 * @property {Function} load
 */

/**
 * Core Provider Packages Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderPackagesContract
 * @property {Function} [launch]
 * @property {Function} [register]
 * @property {Function} [addPackages]
 * @property {Function} [getPackages]
 * @property {Function} [getCompatiblePackages]
 * @property {Function} [running]
 */

/**
 * Core Provider Clipboard Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderClipboardContract
 * @property {Function} [clear]
 * @property {Function} [set]
 * @property {Function} [has]
 * @property {Function} [get]
 */

/**
 * Core Provider Middleware Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderMiddlewareContract
 * @property {Function} [add]
 * @property {Function} [get]
 */

/**
 * Core Provider Tray Contract
 * TODO: typedef
 * @typedef {Object} CoreProviderTrayContract
 * @property {Function} [create]
 * @property {Function} [remove]
 * @property {Function} [list]
 * @property {Function} [has]
 */

/**
 * Core Provider Options
 * @typedef {Object} CoreProviderOptions
 * @property {Function} [windowBehavior] Custom Window Behavior
 * @property {Object} [locales] Override locales
 */

/**
 * OS.js Core Service Provider
 */
class CoreServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {CoreProviderOptions} [options={}] Arguments
   */
  constructor(core, options = {}) {
    super(core, options);

    /**
     * @type {Session}
     * @readonly
     */
    this.session = new Session(core);

    /**
     * @type {Tray}
     * @readonly
     */
    this.tray = new Tray(core);

    /**
     * @type {Packages}
     * @readonly
     */
    this.pm = new Packages(core);

    /**
     * @type {Clipboard}
     * @readonly
     */
    this.clipboard = new Clipboard();

    /**
     * @type {Middleware}
     * @readonly
     */
    this.middleware = new Middleware();

    window.OSjs = this.createGlobalApi();
  }

  /**
   * Get a list of services this provider registers
   * @return {string}
   */
  provides() {
    return [
      'osjs/application',
      'osjs/basic-application',
      'osjs/window',
      'osjs/windows',
      'osjs/event-handler',
      'osjs/window-behaviour',
      'osjs/dnd',
      'osjs/dom',
      'osjs/clipboard',
      'osjs/middleware',
      'osjs/tray',
      'osjs/locale',
      'osjs/packages',
      'osjs/websocket',
      'osjs/session',
      'osjs/theme',
      'osjs/sounds'
    ];
  }

  /**
   * Destroys provider
   */
  destroy() {
    this.tray.destroy();
    this.pm.destroy();
    this.clipboard.destroy();
    this.middleware.destroy();
    this.session.destroy();

    super.destroy();
  }

  /**
   * Initializes provider
   * @return {Promise<undefined>}
   */
  init() {
    this.registerContracts();

    this.core.on('osjs/core:started', () => {
      this.session.load();
    });

    return this.pm.init();
  }

  /**
   * Starts provider
   * @return {Promise<undefined>}
   */
  start() {
    if (this.core.config('development')) {
      this.core.on('osjs/dist:changed', filename => {
        this._onDistChanged(filename);
      });

      this.core.on('osjs/packages:package:changed', name => {
        this._onPackageChanged(name);
      });
    }

    this.core.on('osjs/packages:metadata:changed', () => {
      this.pm.init();
    });
  }

  /**
   * Registers contracts
   */
  registerContracts() {
    this.core.instance('osjs/window', (options = {}) => new Window(this.core, options));
    this.core.instance('osjs/application', (data = {}) => new Application(this.core, data));
    this.core.instance('osjs/basic-application', (proc, win, options = {}) => new BasicApplication(this.core, proc, win, options));
    this.core.instance('osjs/websocket', (name, uri, options = {}) => new Websocket(name, uri, options));
    this.core.instance('osjs/event-emitter', name => new EventEmitter(name));

    this.core.singleton('osjs/windows', () => this.createWindowContract());
    this.core.singleton('osjs/locale', () => this.createLocaleContract());
    this.core.singleton('osjs/dnd', () => this.createDnDContract());
    this.core.singleton('osjs/dom', () => this.createDOMContract());
    this.core.singleton('osjs/theme', () => this.createThemeContract());
    this.core.singleton('osjs/sounds', () => this.createSoundsContract());
    this.core.singleton('osjs/session', () => this.createSessionContract());
    this.core.singleton('osjs/packages', () => this.createPackagesContract());
    this.core.singleton('osjs/clipboard', () => this.createClipboardContract());
    this.core.singleton('osjs/middleware', () => this.createMiddlewareContract());

    this.core.instance('osjs/tray', (options, handler) => {
      if (typeof options !== 'undefined') {
        // FIXME: Use contract instead
        instance.warn('osjs/tray usage without .create() is deprecated');
        return this.tray.create(options, handler);
      }

      return this.createTrayContract();
    });

    // FIXME: Remove this from public usage
    this.core.singleton('osjs/window-behavior', () => typeof this.options.windowBehavior === 'function'
      ? this.options.windowBehavior(this.core)
      : new WindowBehavior(this.core));

    // FIXME: deprecated
    this.core.instance('osjs/event-handler', (...args) => {
      instance.warn('osjs/event-handler is deprecated, use osjs/event-emitter');
      return new EventEmitter(...args);
    });
  }

  /**
   * Expose some internals to global
   */
  createGlobalApi() {
    const globalBlacklist = this.core.config('providers.globalBlacklist', []);
    const globalWhitelist = this.core.config('providers.globalWhitelist', []);

    const make = (name, ...args) => {
      if (this.core.has(name)) {
        const blacklisted = globalBlacklist.length > 0 && globalBlacklist.indexOf(name) !== -1;
        const notWhitelisted = globalWhitelist.length > 0 && globalWhitelist.indexOf(name) === -1;

        if (blacklisted || notWhitelisted) {
          throw new Error(`The provider '${name}' cannot be used via global scope`);
        }
      }

      return this.core.make(name, ...args);
    };

    return Object.freeze({
      make,
      register: (name, callback) => this.pm.register(name, callback),
      url: (endpoint, options, metadata) => this.core.url(endpoint, options, metadata),
      run: (name, args = {}, options = {}) => this.core.run(name, args, options),
      open: (file, options = {}) => this.core.open(file, options),
      request: (url, options, type) => this.core.request(url, options, type),
      middleware: (group, callback) => this.middleware.add(group, callback)
    });
  }

  /**
   * Event when dist changes from a build or deployment
   * @private
   * @param {string} filename The resource filename
   */
  _onDistChanged(filename) {
    const url = this.core.url(filename).replace(/^\//, '');
    const found = this.core.$resourceRoot.querySelectorAll('link[rel=stylesheet]');
    const map = Array.from(found).reduce((result, item) => {
      const src = item.getAttribute('href').split('?')[0].replace(/^\//, '');
      return {
        [src]: item,
        ...result
      };
    }, {});

    if (map[url]) {
      instance.debug('Hot-reloading', url);

      setTimeout(() => {
        map[url].setAttribute('href', url);
      }, 100);
    }
  }

  /**
   * Event when package dist changes from a build or deployment
   * @private
   * @param {string} name The package name
   */
  _onPackageChanged(name) {
    // TODO: Reload themes as well
    Application.getApplications()
      .filter(proc => proc.metadata.name === name)
      .forEach(proc => proc.relaunch());
  }

  /**
   * Provides localization contract
   * @return {CoreProviderLocaleContract}
   */
  createLocaleContract() {
    const strs = merge(translations, this.options.locales || {});
    const translate = translatable(this.core)(strs);

    return {
      format: format(this.core),
      translate,
      translatable: translatable(this.core),
      translatableFlat: translatableFlat(this.core),
      getLocale: (key = 'language') => {
        const ref = getLocale(this.core, key);
        return ref.userLocale || ref.defaultLocale;
      },
      setLocale: name => name in strs
        ? this.core.make('osjs/settings')
          .set('osjs/locale', 'language', name)
          .save()
          .then(() => this.core.emit('osjs/locale:change', name))
        : Promise.reject(translate('ERR_INVALID_LOCALE', name))
    };
  }

  /**
   * Provides window contract
   * @return {CoreProviderWindowContract}
   */
  createWindowContract() {
    return {
      create: (options = {}) => new Window(this.core, options),
      list: () => Window.getWindows(),
      last: () => Window.lastWindow()
    };
  }

  /**
   * Provides DnD contract
   * @return {CoreProviderDnDContract}
   */
  createDnDContract() {
    return dnd;
  }

  /**
   * Provides DOM contract
   * @return {CoreProviderDOMContract}
   */
  createDOMContract() {
    return {
      script,
      style
    };
  }

  /**
   * Provides Theme contract
   * @return {CoreProviderThemeContract}
   */
  createThemeContract() {
    const {themeResource, icon} = resourceResolver(this.core);

    return {
      resource: themeResource,
      icon
    };
  }

  /**
   * Provides Sounds contract
   * @return {CoreProviderSoundContract}
   */
  createSoundsContract() {
    const {soundResource, soundsEnabled} = resourceResolver(this.core);

    return {
      resource: soundResource,
      play: (src, options = {}) => {
        if (soundsEnabled()) {
          const absoluteSrc = src.match(/^(\/|https?:)/)
            ? src
            : soundResource(src);

          if (absoluteSrc) {
            return playSound(absoluteSrc, options);
          }
        }

        return false;
      }
    };
  }

  /**
   * Provides Session contract
   * @return {CoreProviderSessionContract}
   */
  createSessionContract() {
    return {
      save: () => this.session.save(),
      load: (fresh = false) => this.session.load(fresh)
    };
  }

  /**
   * Provides Packages contract
   * @return {CoreProviderPackagesContract}
   */
  createPackagesContract() {
    return {
      launch: (name, args = {}, options = {}) => this.pm.launch(name, args, options),
      register: (name, callback) => this.pm.register(name, callback),
      addPackages: list => this.pm.addPackages(list),
      getPackages: filter => this.pm.getPackages(filter),
      getCompatiblePackages: mimeType => this.pm.getCompatiblePackages(mimeType),
      running: () => this.pm.running(),
      getMetadataFromName: name => this.pm.getMetadataFromName(name)
    };
  }

  /**
   * Provides Clipboard contract
   * @return {CoreProviderClipboardContract}
   */
  createClipboardContract() {
    return {
      clear: () => this.clipboard.clear(),
      set: (data, type) => this.clipboard.set(data, type),
      has: type => this.clipboard.has(type),
      get: (clear = false) => this.clipboard.get(clear)
    };
  }

  /**
   * Provides Middleware contract
   * @return {CoreProviderMiddlewareContract}
   */
  createMiddlewareContract() {
    return {
      add: (group, callback) => this.middleware.add(group, callback),
      get: group => this.middleware.get(group)
    };
  }

  /**
   * Provides Tray contract
   * @return {CoreProviderTrayContract}
   */
  createTrayContract() {
    return {
      create: (options, handler) => this.tray.create(options, handler),
      remove: entry => this.tray.remove(entry),
      list: () => this.tray.list(),
      has: key => this.tray.has(key)
    };
  }
}


/**
 * Desktop Service Contract
 * TODO: typedef
 * @typedef {Object} DeskopProviderContract
 * @property {Function} setKeyboardContext
 * @property {Function} openContextMenu
 * @property {Function} addContextMenuEntries
 * @property {Function} applySettings
 * @property {Function} createDropContextMenu
 * @property {Function} getRect
 */

/**
 * OS.js Desktop Service Provider
 */
class DesktopServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   */
  constructor(core, options = {}) {
    super(core, options || {});

    /**
     * @type {Desktop}
     * @readonly
     */
    this.desktop = new Desktop(this.core, this.options);
  }

  /**
   * Destroys instance
   */
  destroy() {
    this.desktop = this.desktop.destroy();
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/desktop'
    ];
  }

  /**
   * Initializes desktop
   * @return {Promise<undefined>}
   */
  init() {
    this.desktop.init();

    this.core.singleton('osjs/desktop', () => this.createDesktopContract());

    this.core.on('osjs/core:started', () => {
      this.desktop.applySettings();
    });
  }

  /**
   * Starts desktop
   * @return {Promise<undefined>}
   */
  start() {
    this.desktop.start();
  }

  /**
   * @return {DeskopProviderContract}
   */
  createDesktopContract() {
    return {
      setKeyboardContext: ctx => this.desktop.setKeyboardContext(ctx),
      openContextMenu: ev => this.desktop.onContextMenu(ev),
      addContextMenuEntries: entries => this.desktop.addContextMenu(entries),
      applySettings: settings => this.desktop.applySettings(settings),
      createDropContextMenu: data => this.desktop.createDropContextMenu(data),
      getRect: () => this.desktop.getRect()
    };
  }
}


/**
 * OS.js Notification Service Provider
 */
class NotificationServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   */
  constructor(core) {
    super(core);

    /**
     * @type {Notifications}
     * @readonly
     */
    this.notifications = new Notifications(core);
  }

  /**
   * Destroys notifications
   */
  destroy() {
    this.notifications.destroy();
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/notification'
    ];
  }

  /**
   * Initializes authentication
   * @return {Promise<undefined>}
   */
  init() {
    this.core.instance('osjs/notification', (options) => {
      return this.notifications.create(options);
    });

    return this.notifications.init();
  }
}


/**
 * VFS Method Options
 *
 * TODO: typedef
 * @typedef {Object} VFSMethodOptions
 */

/**
 * VFS Download Options
 *
 * @typedef {Object} VFSDownloadOptions
 * @property {boolean} [readfile] Set to false to force backend fetch
 */

/**
 * VFS File Object
 *
 * @typedef {Object} VFSFile
 * @property {string} path
 * @property {string} [filename]
 * @property {boolean} [isDirectory]
 * @property {boolean} [isFile]
 * @property {string} [mime]
 * @property {object} [stat]
 */

// Cache the capability of each mount point
let capabilityCache = {};

// Makes sure our input paths are object(s)
const pathToObject = path => ({
  id: null,
  ...typeof path === 'string' ? {path} : path
});

// Handles directory listing result(s)
const handleDirectoryList = (path, options) => result =>
  Promise.resolve(result.map(stat => createFileIter(stat)))
    .then(result => transformReaddir(pathToObject(path), result, {
      showHiddenFiles: options.showHiddenFiles !== false,
      filter: options.filter
    }));

/**
 * Get vfs capabilities
 *
 * @param {string|VFSFile} path The path of a file
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<object[]>} An object of capabilities
 */
const capabilities = (adapter, mount) => (path, options = {}) => {
  const cached = capabilityCache[mount.name];
  if (cached) {
    return Promise.resolve(cached);
  }
  return adapter.capabilities(pathToObject(path), options, mount)
    .then(res => {
      capabilityCache[mount.name] = res;
      return res;
    });
};


/**
 * Read a directory
 *
 * @param {string|VFSFile} path The path to read
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<object[]>} A list of files
 */
const readdir = (adapter, mount) => (path, options = {}) =>
  adapter.readdir(pathToObject(path), options, mount)
    .then(handleDirectoryList(path, options));

/**
 * Reads a file
 *
 * Available types are 'arraybuffer', 'blob', 'uri' and 'string'
 *
 * @param {string|VFSFile} path The path to read
 * @param {string} [type=string] Return this content type
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<ArrayBuffer>}
 */
const readfile = (adapter, mount) => (path, type = 'string', options = {}) =>
  adapter.readfile(pathToObject(path), type, options, mount)
    .then(response => transformArrayBuffer(response.body, response.mime, type));

/**
 * Writes a file
 * @param {string|VFSFile} path The path to write
 * @param {ArrayBuffer|Blob|string} data The data
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<number>} File size
 */
const writefile = (adapter, mount) => (path, data, options = {}) => {
  const binary = (data instanceof ArrayBuffer || data instanceof Blob)
    ? data
    : new Blob([data], {type: 'application/octet-stream'});

  return adapter.writefile(pathToObject(path), binary, options, mount);
};

/**
 * Copies a file or directory (move)
 * @param {string|VFSFile} from The source (from)
 * @param {string|VFSFile} to The destination (to)
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const copy = (adapter, mount) => (from, to, options = {}) =>
  adapter.copy(pathToObject(from), pathToObject(to), options, mount);

/**
 * Renames a file or directory (move)
 * @param {string|VFSFile} from The source (from)
 * @param {string|VFSFile} to The destination (to)
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const rename = (adapter, mount) => (from, to, options = {}) =>
  adapter.rename(pathToObject(from), pathToObject(to), options, mount);

/**
 * Alias of 'rename'
 * @param {string|VFSFile} from The source (from)
 * @param {string|VFSFile} to The destination (to)
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const move = rename;

/**
 * Creates a directory
 * @param {string|VFSFile} path The path to new directory
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const mkdir = (adapter, mount) => (path, options = {}) =>
  adapter.mkdir(pathToObject(path), options, mount);

/**
 * Removes a file or directory
 * @param {string|VFSFile} path The path to remove
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const unlink = (adapter, mount) => (path, options = {}) =>
  adapter.unlink(pathToObject(path), options, mount);

/**
 * Checks if path exists
 * @param {string|VFSFile} path The path to check
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<boolean>}
 */
const exists = (adapter, mount) => (path, options = {}) =>
  adapter.exists(pathToObject(path), options, mount);

/**
 * Gets the stats of the file or directory
 * @param {string|VFSFile} path The path to check
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<object>}
 */
const stat = (adapter, mount) => (path, options = {}) =>
  adapter.stat(pathToObject(path), options, mount)
    .then(stat => createFileIter(stat));

/**
 * Gets an URL to a resource defined by file
 * @param {string|VFSFile} path The file
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<string>}
 */
const url = (adapter, mount) => (path, options = {}) =>
  adapter.url(pathToObject(path), options, mount);

/**
 * Initiates a native browser download of the file
 * @param {string|VFSFile} path The file
 * @param {VFSDownloadOptions} [options] Options
 * @return {Promise<any>}
 */
const download = (adapter, mount) => (path, options = {}) =>
  typeof adapter.download === 'function' && options.readfile !== true
    ? adapter.download(pathToObject(path), options, mount)
    : readfile(adapter)(path, 'blob')
      .then(body => {
        const filename = pathToObject(path).path.split('/').splice(-1)[0];
        const url = window.URL.createObjectURL(body);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);

        a.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          a.remove();
        }, 1);
      });

/**
 * Searches for files and folders
 * @param {string|VFSFile} root The root
 * @param {string} pattern Search pattern
 * @param {VFSMethodOptions} [options] Options
 * @return {Promise<object[]>} A list of files
 */
const search = (adapter, mount) => (root, pattern, options = {}) => {
  if (mount.attributes && mount.attributes.searchable === false) {
    return Promise.resolve([]);
  }

  return adapter.search(pathToObject(root), pattern, options, mount)
    .then(handleDirectoryList(root, options));
};

/**
 * Touches a file
 * @param {string|VFSFile} path File path
 * @return {Promise<boolean>}
 */
const touch = (adapter, mount) => (path, options = {}) =>
  adapter.touch(pathToObject(path), options, mount);

var VFS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  capabilities: capabilities,
  readdir: readdir,
  readfile: readfile,
  writefile: writefile,
  copy: copy,
  rename: rename,
  move: move,
  mkdir: mkdir,
  unlink: unlink,
  exists: exists,
  stat: stat,
  url: url,
  download: download,
  search: search,
  touch: touch
});


/**
 * Null VFS adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const nullAdapter = ({
  capabilities: (path, options) => Promise.resolve({}),
  readdir: (path, options) => Promise.resolve([]),
  readfile: (path, type, options) => Promise.resolve({body: new ArrayBuffer(), mime: 'application/octet-stream'}),
  writefile: (path, data, options) => Promise.resolve(-1),
  copy: (from, to, options) => Promise.resolve(false),
  rename: (from, to, options) => Promise.resolve(false),
  mkdir: (path, options) => Promise.resolve(false),
  unlink: (path, options) => Promise.resolve(false),
  exists: (path, options) => Promise.resolve(false),
  stat: (path, options) => Promise.resolve({}),
  url: (path, options) => Promise.resolve(null),
  mount: options => Promise.resolve(true),
  unmount: options => Promise.resolve(true),
  search: (root, pattern, options) => Promise.resolve([]),
  touch: (path, options) => Promise.resolve(false)
});


const getters = ['capabilities', 'exists', 'stat', 'readdir', 'readfile'];

const requester = core => (fn, body, type, options = {}) =>
  core.request(`/vfs/${fn}`, {
    body,
    method: getters.indexOf(fn) !== -1 ? 'get' : 'post',
    ...options
  }, type)
    .then(response => {
      if (type === 'json') {
        return {mime: 'application/json', body: response};
      } else if (fn === 'writefile') {
        return response.json();
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      return response.arrayBuffer().then(result => ({
        mime: contentType,
        body: result
      }));
    });

const methods = (core, request) => {
  const passthrough = (name) => ({path}, options) =>
    request(name, {path, options}, 'json')
      .then(({body}) => body);

  return {
    capabilities: passthrough('capabilities'),

    readdir: ({path}, options) => request('readdir', {
      path,
      options,
    }, 'json').then(({body}) => body),

    readfile: ({path}, type, options) =>
      request('readfile', {path, options}),

    writefile: ({path}, data, options = {}) => {
      const formData = new FormData();
      formData.append('upload', data);
      formData.append('path', path);
      formData.append('options', options);

      return request('writefile', formData, undefined, {
        onProgress: options.onProgress,
        xhr: !!options.onProgress
      });
    },

    copy: (from, to, options) =>
      request('copy', {from: from.path, to: to.path, options}, 'json').then(({body}) => body),

    rename: (from, to, options) =>
      request('rename', {from: from.path, to: to.path, options}, 'json').then(({body}) => body),

    mkdir: passthrough('mkdir'),
    unlink: passthrough('unlink'),
    exists: passthrough('exists'),
    stat: passthrough('stat'),

    url: ({path}, options) => Promise.resolve(
      core.url(`/vfs/readfile?path=${encodeURIComponent(path)}`)
    ),

    search: ({path}, pattern, options) =>
      request('search', {root: path, pattern, options}, 'json')
        .then(({body}) => body),

    touch: ({path}, options) =>
      request('touch', {path, options}, 'json').then(({body}) => body),

    download: ({path}, options = {}) => {
      const json = encodeURIComponent(JSON.stringify({download: true}));

      return Promise.resolve(`/vfs/readfile?options=${json}&path=` + encodeURIComponent(path))
        .then(url => {
          return (options.target || window).open(url);
        });
    }
  };
};

/**
 * System VFS adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const adapter$1 = (core) => {
  const request = requester(core);

  return methods(core, request);
};


/**
 * Application VFS adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const adapter = (core) => {
  const pkgs = core.make('osjs/packages');

  return {
    readdir: ({path}, options) => {
      return Promise.resolve(pkgs.getPackages())
        .then(pkgs => pkgs.map(pkg => ({
          isDirectory: false,
          isFile: true,
          filename: pkg.name,
          mime: 'osjs/application',
          path: `${path.replace(/(\/+)?$/, '/')}${pkg.name}`,
          size: 0,
          stat: {},
          icon: pkg.icon ? core.url(pkg.icon, {}, pkg) : null
        })));
    }
  };
};


/**
 * VFS Mountpoint attributes
 *
 * @typedef {Object} FilesystemMountpointAttributes
 * @property {string} [visibility='global'] Visibility in UI
 * @property {boolean} [local=true] Local filesystem ?
 * @property {boolean} [searchable=true] If can be searched
 * @property {boolean} [readOnly=false] Readonly
 */

/**
 * VFS Mountpoint
 *
 * @typedef {Object} FilesystemMountpoint
 * @property {string} name Name
 * @property {string} label Label
 * @property {string} adapter Adater name
 * @property {string} [root] System adapter root
 * @property {boolean} [enabled=true] Enabled state
 * @property {FilesystemMountpointAttributes} [attributes] Attributes
 */

/**
 * Filesystem Adapter Methods
 * TODO: typedef
 * @typedef {Object} FilesystemAdapterMethods
 * @property {Function} capabilities
 * @property {Function} readdir
 * @property {Function} readfile
 * @property {Function} writefile
 * @property {Function} copy
 * @property {Function} move
 * @property {Function} rename
 * @property {Function} mkdir
 * @property {Function} unlink
 * @property {Function} exists
 * @property {Function} stat
 * @property {Function} url
 * @property {Function} download
 * @property {Function} search
 * @property {Function} touch
 */

/**
 * @callback FilesystemAdapterWrapper
 * @return {FilesystemAdapterMethods}
 */

/**
 * Filesystem Options
 *
 * @typedef {Object} FilesystemOptions
 * @property {{name: FilesystemAdapterWrapper}} [adapters] Adapter registry
 * @property {FilesystemMountpoint[]} [mounts] Mountpoints
 */

/**
 * Filesystem Class that manages filesystems and adapters
 */
class Filesystem extends EventEmitter {

  /**
   * Create filesystem manager
   *
   * @param {Core} core Core reference
   * @param {FilesystemOptions} [options] Options
   */
  constructor(core, options = {}) {
    options = {
      adapters: {},
      mounts: [],
      ...options
    };

    super('Filesystem');

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;

    /**
     * Adapter registry
     * @type {{name: FilesystemAdapterWrapper}}
     * @readonly
     */
    this.adapters = {
      system: adapter$1,
      apps: adapter,
      ...this.core.config('vfs.adapters', {}),
      ...options.adapters
    };

    /**
     * Mountpoints
     * @type {FilesystemMountpoint[]}
     */
    this.mounts = [];

    /**
     * Options
     * @type {FilesystemOptions}
     */
    this.options = {};

    /**
     * A wrapper for VFS method requests
     * @type {{key: Function}}
     * @readonly
     */
    this.proxy = Object.keys(VFS).reduce((result, method) => {
      return {
        [method]: (...args) => this._request(method, ...args),
        ...result
      };
    }, {});
  }

  /**
   * Mounts all configured mountpoints
   * @param {boolean} [stopOnError=true] Stop on first error
   * @return {Promise<boolean[]>}
   */
  mountAll(stopOnError = true) {
    this.mounts = this._getConfiguredMountpoints();

    const fn = m => stopOnError
      ? this._mountpointAction(m)
      : this._mountpointAction(m).catch(err => instance.warn('Error while mounting', m, err));

    return Promise.all(this.mounts.map(fn));
  }

  /**
   * Adds a new mountpoint
   * @param {FilesystemMountpoint} props Mountpoint props
   * @param {boolean} [automount=true] Automount after creation
   * @return {Promise<boolean>}
   */
  addMountpoint(props, automount = true) {
    const mount = this.createMountpoint(props);

    this.mounts.push(mount);

    if (automount) {
      return this.mount(mount.name);
    }

    return Promise.resolve(true);
  }

  /**
   * Mount given mountpoint
   * @param {string|FilesystemMountpoint} m Mountpoint name or object
   * @throws {Error} On invalid name or if already mounted
   * @return {Promise<boolean>}
   */
  mount(m) {
    if (typeof m === 'string') {
      return this._mountAction(m, false);
    }

    return this.addMountpoint(m);
  }

  /**
   * Unmount given filesystem
   * @param {string} name Filesystem name
   * @throws {Error} On invalid name or if already unmounted
   * @return {Promise<boolean>}
   */
  unmount(name) {
    return this._mountAction(name, true);
  }

  /**
   * Internal wrapper for mounting/unmounting
   *
   * @private
   * @param {FilesystemMountpoint} mountpoint The mountpoint
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean>}
   */
  _mountpointAction(mountpoint, unmount = false) {
    const eventName = unmount ? 'unmounted' : 'mounted';
    const coreEventName = unmount ? 'unmount' : 'mount';

    return mountpoint._adapter[coreEventName]({}, mountpoint)
      .then(result => {
        if (result) {
          mountpoint.mounted = !unmount;

          this.emit(eventName, mountpoint);
          this.core.emit('osjs/fs:' + coreEventName);
        }

        return result;
      });
  }

  /**
   * Internal wrapper for mounting/unmounting by name
   *
   * @private
   * @param {string} name Mountpoint name
   * @param {boolean} [unmount=false] If action is unmounting
   * @return {Promise<boolean>}
   */
  _mountAction(name, unmount) {
    return Promise.resolve(this.mounts.find(m => m.name === name))
      .then(found => {
        const _ = this.core.make('osjs/locale').translate;

        // FIXME: Add already mounting state
        if (!found) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND', name));
        } else if (unmount && !found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_NOT_MOUNTED', name));
        } else if (!unmount && found.mounted) {
          throw new Error(_('ERR_VFS_MOUNT_ALREADY_MOUNTED', name));
        }

        return this._mountpointAction(found, unmount);
      });
  }

  /**
   * Gets the proxy for VFS methods
   * FIXME: Not correct type, but works for documentation atm
   * @return {FilesystemAdapterMethods} A map of VFS functions
   */
  request() {
    return this.proxy;
  }

  /**
   * Perform a VFS method request
   *
   * @private
   * @param {string} method VFS method name
   * @param {*} ...args Arguments
   * @return {*}
   */
  _request(method, ...args) {
    const ev = `osjs/vfs:${method}`;

    const done = (error) => {
      this.core.emit(`${ev}:done`, ...args);

      if (!error && this.core.config('vfs.watch')) {
        const eva = createWatchEvents(method, args);
        eva.forEach(([e, a]) => this.core.emit(e, a));
      }
    };

    this.core.emit(ev, ...args);

    return this._requestAction(method, ...args)
      .then(result => {
        done();
        return result;
      })
      .catch(error => {
        done(error);
        throw error;
      });
  }

  /**
   * Request action wrapper
   * @private
   * @param {string} method
   * @param {*} ...args Arguments
   * @return {Promise<*>}
   */
  _requestAction(method, ...args) {
    if (['rename', 'move', 'copy'].indexOf(method) !== -1) {
      const [src, dest] = args;
      const srcMount = this.getMountpointFromPath(src);
      const destMount = this.getMountpointFromPath(dest);
      const sameAdapter = srcMount.adapter === destMount.adapter;

      if (!sameAdapter) {
        return readfile(srcMount._adapter, srcMount)(src)
          .then(ab => writefile(destMount._adapter, destMount)(dest, ab))
          .then(result => {
            return method === 'rename'
              ? unlink(srcMount._adapter, srcMount)(src).then(() => result)
              : result;
          });
      }
    }

    const [file] = args;
    const mount = this.getMountpointFromPath(file);

    return VFS[method](mount._adapter, mount)(...args);
  }

  /**
   * Creates a new mountpoint based on given properties
   * @param {FilesystemMountpoint} props Properties
   * @return {FilesystemMountpoint}
   */
  createMountpoint(props) {
    const name = props.adapter || this.core.config('vfs.defaultAdapter');
    const adapter = {...nullAdapter, ...this.adapters[name](this.core)};

    const result = merge({
      enabled: true,
      mounted: false,
      adapter: name,
      attributes: {
        visibility: 'global',
        local: true,
        searchable: true,
        readOnly: false
      }
    }, props);

    return {
      _adapter: adapter,
      label: name,
      root: `${result.name || name}:/`,
      ...result
    };
  }

  /**
   * Gets mountpoint from given path
   * @param {string|VFSFile} file The file
   * @return {FilesystemMountpoint|null}
   */
  getMountpointFromPath(file) {
    const path = typeof file === 'string' ? file : file.path;
    const prefix = parseMountpointPrefix(path);
    const _ = this.core.make('osjs/locale').translate;

    if (!prefix) {
      throw new Error(_('ERR_VFS_PATH_FORMAT_INVALID', path));
    }

    const found = this.mounts.find(m => m.name === prefix);

    if (!found) {
      throw new Error(_('ERR_VFS_MOUNT_NOT_FOUND_FOR', `${prefix}:`));
    }

    return found;
  }

  /**
   * Gets all mountpoints
   * @return {FilesystemMountpoint[]}
   */
  getMounts(all = false) {
    const user = this.core.getUser();
    const theme = this.core.make('osjs/theme');
    const icon = str => str
      ? (typeof str === 'string' ? str : theme.icon(str.name))
      : theme.icon('drive-harddisk');

    return this.mounts
      .filter(m => all || m.mounted)
      .filter(m => m.enabled !== false)
      .filter(m => {
        const mg = m.attributes ? m.attributes.groups : [];
        const ms = m.attributes ? m.attributes.strictGroups !== false : true;
        return filterMountByGroups(user.groups)(mg, ms);
      })
      .map(m => ({
        attributes: {...m.attributes},
        icon: icon(m.icon),
        name: m.name,
        label: m.label,
        root: m.root
      }));
  }

  /**
   * Gets configured mountpoints
   * @return {FilesystemMountpoint[]}
   */
  _getConfiguredMountpoints() {
    const list = [
      ...this.core.config('vfs.mountpoints', []),
      ...(this.options.mounts || [])
    ];

    return list
      .map(mount => {
        try {
          return this.createMountpoint(mount);
        } catch (e) {
          instance.warn('Error while creating mountpoint', e);
        }

        return null;
      })
      .filter((mount, pos, arr) => {
        const index = arr.findIndex(item => item.label === mount.label || item.root === mount.label);
        if (index === pos) {
          return true;
        }

        instance.warn('Removed duplicate mountpoint', mount);
        return false;
      })
      .filter(mount => mount !== null);
  }
}


/**
 * Filesytem Service Contract
 * TODO: typedef
 * @typedef {Object} VFSServiceFilesystemContract
 * @property {Function} basename
 * @property {Function} pathname
 * @property {Function} pathJoin
 * @property {Function} icon
 * @property {Function} mountpoints
 * @property {Function} mount
 * @property {Function} unmount
 * @property {Function} addMountpoint
 */

/**
 * VFS Service Contract
 * TODO: typedef
 * @typedef {Object} VFSServiceContract
 * @property {Function} readdir
 * @property {Function} readfile
 * @property {Function} writefile
 * @property {Function} copy
 * @property {Function} move
 * @property {Function} rename
 * @property {Function} mkdir
 * @property {Function} unlink
 * @property {Function} exists
 * @property {Function} stat
 * @property {Function} url
 * @property {Function} download
 * @property {Function} search
 * @property {Function} touch
 */

/**
 * VFS Service Options
 * @typedef {Object} VFSServiceOptions
 * @property {{name: FilesystemAdapter}} [adapters={}]
 * @property {FilesystemMountpoint[]} [mountpoints=[]]
 */

/**
 * OS.js Virtual Filesystem Service Provider
 */
class VFSServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {VFSServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Filesystem}
     * @readonly
     */
    this.fs = new Filesystem(core, {
      adapters: options.adapters || {},
      mounts: options.mounts || []
    });
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/vfs',
      'osjs/fs'
    ];
  }

  /**
   * Initializes VFS providers
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/vfs', () => this.createVFSContract());
    this.core.singleton('osjs/fs', () => this.createFilesystemContract());

    return this.fs.mountAll(false);
  }

  /**
   * @return {VFSServiceContract}
   */
  createVFSContract() {
    return this.fs.request();
  }

  /**
   * @return {VFSServiceFilesystemContract}
   */
  createFilesystemContract() {
    const iconMap = this.core.config('vfs.icons', {});
    const icon = getFileIcon(iconMap);

    return {
      basename: p => basename(p),
      pathname: p => pathname(p),
      pathJoin: (...args) => pathJoin(...args),
      icon: icon,
      mountpoints: (all = false) => this.fs.getMounts(all),
      addMountpoint: (props, automount = true) => this.fs.addMountpoint(props, automount),
      mount: m => this.fs.mount(m),
      unmount: name => this.fs.unmount(name)
    };
  }
}


/**
 * Auth Service Contract
 * TODO: typedef
 * @typedef {Object} AuthProviderContract
 * @property {Function} show
 * @property {Function} login
 * @property {Function} logout
 * @property {Function} user
 */

/**
 * Auth Service Options
 * @typedef {Object} AuthServiceOptions
 */

/**
 * OS.js Auth Service Provider
 *
 * Creates the login prompt and handles authentication flow
 */
class AuthServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {AuthServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Auth}
     * @readonly
     */
    this.auth = new Auth(core, options);
  }

  /**
   * Initializes authentication
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/auth', () => this.createAuthContract());

    return this.auth.init();
  }

  /**
   * Destroys authentication
   */
  destroy() {
    this.auth.destroy();

    return super.destroy();
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/auth'
    ];
  }

  /**
   * @return {AuthProviderContract}
   */
  createAuthContract() {
    return {
      show: (cb) => this.auth.show(cb),
      login: (values) => this.auth.login(values),
      logout: (reload) => this.auth.logout(reload),
      user: () => this.core.getUser()
    };
  }
}


/**
 * LocalStorage Settings adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const localStorageSettings = (core) => {
  const prefix = core.config('settings.prefix', '');

  return {
    clear(ns) {
      if (ns) {
        localStorage.removeItem(prefix + ns);
      } else {
        localStorage.clear();
      }

      return Promise.resolve(true);
    },

    save(settings) {
      Object.keys(settings).forEach((k) => {
        localStorage.setItem(prefix + k, JSON.stringify(settings[k]));
      });

      return Promise.resolve(true);
    },

    load() {
      const entries = Object
        .keys(localStorage)
        .filter(k => prefix ? k.startsWith(prefix) : true)
        .map((k) => {
          const v = localStorage.getItem(k);
          const kk = prefix ? k.substr(prefix.length) : k;

          try {
            return [kk, JSON.parse(v)];
          } catch (e) {
            instance.warn(`localStorageAdapter parse failed for '${k}'`, e);
          }

          return [kk, v];
        });

      return Promise.resolve(Object.fromEntries(entries));
    }
  };
};


/**
 * Server Settings adapter
 * @param {Core} core Core reference
 * @param {object} [options] Adapter options
 */
const serverSettings = core => ({
  save: settings => core.request(core.url('/settings'), {
    method: 'post',
    body: settings
  }, 'json'),

  load: () => core.request(core.url('/settings'), {
    method: 'get'
  }, 'json')
});


const defaultAdapters = {
  server: serverSettings,
  localStorage: localStorageSettings
};

const createAdapter = (core, options) => {
  const adapter = core.config('standalone')
    ? localStorageSettings
    : typeof options.adapter === 'function'
      ? options.adapter
      : defaultAdapters[options.adapter || 'localStorage'];

  return {
    load: () => Promise.reject(new Error('Not implemented')),
    save: () => Promise.reject(new Error('Not implemented')),
    init: () => Promise.resolve(true),
    clear: () => Promise.resolve(true),
    destroy: () => {},
    ...adapter(core, options.config)
  };
};

/**
 * TODO: typedef
 * @typedef {Object} SettingsAdapterConfiguration
 */

/**
 * TODO: typedef
 * @typedef {Object} SettingsAdapter
 */

/**
 * @callback SettingsAdapterCallback
 * @param {Core} core
 * @return {SettingsAdapterCallback}
 */

/**
 * Settings Options
 *
 * @typedef {Object} SettingsOptions
 * @property {SettingsAdapterCallback|SettingsAdapter} [adapter] Adapter to use
 * @property {SettingsAdapterConfiguration} [config] Adapter configuration
 */

/**
 * OS.js Settings Manager
 */
class Settings {

  // TODO: Destroy method

  /**
   * Create application
   *
   * @param {Core} core Core reference
   * @param {SettingsOptions} options Options
   */
  constructor(core, options) {

    /**
     * The settings adapter
     * @type {SettingsAdapter}
     * @readonly
     */
    this.adapter = createAdapter(core, options);

    /**
     * Internal timeout reference used for debouncing
     * @type {object}
     */
    this.debounce = null;

    /**
     * The settings tree
     * @type {{name: *}}
     */
    this.settings = {};

    /**
     * Core instance reference
     * @type {Core}
     * @readonly
     */
    this.core = core;
  }

  /**
   * Initializes settings adapter
   */
  init() {
    return this.adapter.init();
  }

  /**
   * Saves settings
   * @return {Promise<boolean>}
   */
  save() {
    return new Promise((resolve, reject) => {
      if (this.debounce) {
        const [promise, timer] = this.debounce;
        promise.resolve(false);
        this.debounce = clearTimeout(timer);
      }

      this.debounce = [
        {resolve, reject},
        setTimeout(() => {
          this.adapter.save(this.settings)
            .then((...args) => {
              this.core.emit('osjs/settings:save');

              resolve(...args);
            }).catch(reject);
        }, 100)
      ];
    });
  }

  /**
   * Loads settings
   * @return {Promise<boolean>}
   */
  load() {
    const defaults = this.core.config('settings.defaults', {});

    return this.adapter.load()
      .then(settings => {
        this.settings = merge(defaults, settings, {
          arrayMerge: (dest, source) => source
        });

        this.core.emit('osjs/settings:load');

        return true;
      }).catch(e => {
        instance.warn('Failed to set settings', e);
        this.settings = defaults;

        return false;
      });
  }

  /**
   * Gets a settings entry by key (cached)
   *
   * @param {string} [ns] The namespace
   * @param {string} [key] The key to get the value from
   * @param {*} [defaultValue] If result is undefined, return this instead
   * @return {*}
   */
  get(ns, key, defaultValue) {
    if (typeof ns === 'undefined') {
      return {...this.settings};
    } else if (typeof this.settings[ns] === 'undefined') {
      return key ? defaultValue : defaultValue || {};
    }

    const tree = simplejsonconf(this.settings[ns]);

    return key
      ? tree.get(key, defaultValue)
      : tree.get() || defaultValue;
  }

  /**
   * Sets a settings entry by root key (but does not save).
   *
   * @param {string} ns The namespace
   * @param {string} [key] The key to set
   * @param {*} [value] The value to set
   * @return {Settings} This
   */
  set(ns, key, value) {
    const lock = this.core.config('settings.lock', []);
    if (lock.indexOf(ns) !== -1) {
      return this;
    }

    if (typeof this.settings[ns] === 'undefined') {
      this.settings[ns] = {};
    }

    if (key) {
      try {
        const sjc = simplejsonconf(this.settings[ns]);
        sjc.set(key, value);
        this.settings[ns] = sjc.get();
      } catch (e) {
        instance.warn('Error while setting settings for', key, e);
      }
    } else {
      this.settings[ns] = {...value};
    }

    return this;
  }

  /**
   * Clears a namespace by root key
   * @param {string} ns The namespace
   * @return {Promise<boolean>}
   */
  clear(ns) {
    return this.adapter.clear(ns)
      .then(result => {
        if (result && this.settings[ns]) {
          delete this.settings[ns];
        }

        return result;
      });
  }

}


/**
 * Settings Service Contract
 * TODO: typedef
 * @typedef {Object} SettingsProviderContract
 * @property {Function} save
 * @property {Function} load
 * @property {Function} clear
 * @property {Function} set
 * @property {Function} get
 */

/**
 * TODO: typedef
 * @typedef {Object} SettingsServiceOptions
 * @property {Object} [config]
 */

/**
 * OS.js Settings Service Provider
 */
class SettingsServiceProvider extends ServiceProvider {

  /**
   * @param {Core} core OS.js Core
   * @param {SettingsServiceOptions} [options={}]
   */
  constructor(core, options = {}) {
    super(core);

    /**
     * @type {Settings}
     * @readonly
     */
    this.settings = new Settings(core, {
      config: {},
      ...options
    });
  }

  /**
   * Get a list of services this provider registers
   * @return {string[]}
   */
  provides() {
    return [
      'osjs/settings'
    ];
  }

  /**
   * Initializes settings
   * @return {Promise<undefined>}
   */
  init() {
    this.core.singleton('osjs/settings', () => this.createSettingsContract());

    return this.settings.init();
  }

  /**
   * @return {SettingsProviderContract}
   */
  createSettingsContract() {
    return {
      save: () => this.settings.save(),
      load: () => this.settings.load(),
      clear: (ns) => this.settings.clear(ns),
      get: (ns, key, defaultValue) => this.settings.get(ns, key, defaultValue),
      set: (ns, key, value) => this.settings.set(ns, key, value)
    };
  }
}

const icon = './logo-blue-32x32.png';

export { Application, Auth, AuthServiceProvider, BasicApplication, Clipboard, Core, Core as Gui, CoreServiceProvider, Desktop, DesktopServiceProvider, Filesystem, Login, Middleware, Notification, NotificationServiceProvider, Notifications, Packages, Search, Settings, SettingsServiceProvider, Splash, Tray, VFSServiceProvider, Websocket, Window, WindowBehavior, defaultConfiguration as configuration, icon, instance as logger };
